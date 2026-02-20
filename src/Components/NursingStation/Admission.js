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

// ── Print styles injected once ──────────────────────────────────────────────
const printStyles = `
  @media print {
    body * { visibility: hidden !important; }
    #admission-receipt, #admission-receipt * { visibility: visible !important; }
    #admission-receipt {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: white;
      z-index: 99999;
    }
  }
`;

// ── Styled components for Receipt ────────────────────────────────────────────
const ReceiptOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
`;

const ReceiptBox = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 560px;
  width: 95%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

const ReceiptContent = styled.div`
  id: admission-receipt;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 16px;
  border: 2px solid #000;
`;

const ReceiptRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ReceiptActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
`;

// Simple SVG barcode renderer (Code 128-style visual)
const BarcodeCanvas = ({ value }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);

    // Generate pseudo-barcode bars from char codes
    const chars = value.split("");
    const barData = [];
    // Start pattern
    barData.push(2, 1, 1, 4, 1, 2);
    chars.forEach((ch) => {
      const code = ch.charCodeAt(0);
      const bars = [
        ((code >> 5) & 3) + 1,
        ((code >> 3) & 3) + 1,
        ((code >> 1) & 3) + 1,
        (code & 1) + 1,
        ((code >> 4) & 3) + 1,
        ((code >> 2) & 3) + 1,
      ];
      barData.push(...bars);
    });
    // Stop pattern
    barData.push(2, 3, 3, 1, 1, 1, 2);

    const totalUnits = barData.reduce((a, b) => a + b, 0);
    const unitW = (W - 20) / totalUnits;
    let x = 10;
    ctx.fillStyle = "#000";
    barData.forEach((units, i) => {
      const barW = units * unitW;
      if (i % 2 === 0) {
        ctx.fillRect(x, 4, barW - 0.5, H - 20);
      }
      x += barW;
    });

    // Label below
    ctx.fillStyle = "#000";
    ctx.font = "bold 11px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText(value, W / 2, H - 4);
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      width={340}
      height={70}
      style={{ display: "block", margin: "0 auto" }}
    />
  );
};

// ── UHID / IP Search Modal ───────────────────────────────────────────────────
const PatientSearchModal = ({ onClose, onSelect, mode, HmsBaseUrl }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async () => {
    if (query.length < 4) {
      toast.warning("Please enter at least 4 characters");
      return;
    }
    setLoading(true);
    try {
      const url =
        mode === "ip"
          ? `${HmsBaseUrl}admission/?ip_number=${encodeURIComponent(query)}`
          : `${HmsBaseUrl}op-patient-search/?uhid=${encodeURIComponent(query)}`;
      const response = await apiRequest(url, "GET");
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setResults(data);
        if (data.length === 0) toast.info("No patients found");
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      toast.error("Search failed: " + err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <ModalHeader>
          <ModalTitle>Search by {mode === "ip" ? "IP Number" : "UHID"}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <SearchRow>
            <SearchInput
              type="text"
              placeholder={`Enter at least 4 digits of ${mode === "ip" ? "IP Number" : "UHID"}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && doSearch()}
              autoFocus
            />
            <Button type="button" onClick={doSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </SearchRow>

          {results.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <Th>UHID</Th>
                  <Th>Name</Th>
                  <Th>Age/Gender</Th>
                  {mode === "ip" && <Th>IP No.</Th>}
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {results.map((p, i) => (
                  <tr key={i}>
                    <Td>{p.uhid}</Td>
                    <Td>{`${p.salutation || ""} ${p.firstName || ""} ${p.lastName || ""}`.trim()}</Td>
                    <Td>{`${p.age || "-"} / ${p.gender || "-"}`}</Td>
                    {mode === "ip" && <Td>{p.ipNumber || "-"}</Td>}
                    <Td>
                      <Button onClick={() => onSelect(p)}>Select</Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {!loading && results.length === 0 && query && (
            <NoResults>No patients found. Try a different search.</NoResults>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

// ── Room + Bed Modal ─────────────────────────────────────────────────────────
const RoomBedModal = ({ onClose, onSelect, HmsBaseUrl }) => {
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [roomResults, setRoomResults] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  const searchRooms = async () => {
    setLoadingRooms(true);
    setSelectedRoom(null);
    setSelectedBed(null);
    try {
      const queryParam = roomSearchQuery
        ? `?room_number=${encodeURIComponent(roomSearchQuery)}`
        : "";
      const response = await apiRequest(`${HmsBaseUrl}search-rooms/${queryParam}`, "GET");
      if (response.success) {
        setRoomResults(response.data || []);
        if ((response.data || []).length === 0) toast.info("No rooms found");
      } else {
        throw new Error(response.error || "Failed to search rooms");
      }
    } catch (error) {
      toast.error("Failed to search rooms");
      setRoomResults([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    searchRooms();
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setSelectedBed(null);
  };

  const handleBedSelect = (bed) => {
    setSelectedBed(bed);
  };

  const handleConfirm = () => {
    if (!selectedRoom) { toast.warning("Please select a room"); return; }
    if (!selectedBed) { toast.warning("Please select a bed"); return; }
    onSelect(selectedRoom, selectedBed);
  };

  const beds = selectedRoom?.beds || [];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <ModalHeader>
          <ModalTitle>Select Room & Bed</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <SearchRow>
            <SearchInput
              type="text"
              placeholder="Search room number..."
              value={roomSearchQuery}
              onChange={(e) => setRoomSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchRooms()}
            />
            <Button type="button" onClick={searchRooms} disabled={loadingRooms}>
              {loadingRooms ? "Searching..." : "Search"}
            </Button>
          </SearchRow>

          {/* Rooms Table */}
          {loadingRooms ? (
            <NoResults>Loading rooms...</NoResults>
          ) : roomResults.length > 0 ? (
            <>
              <p style={{ fontWeight: 600, marginBottom: 6, color: "#0d9488" }}>
                Step 1: Select a Room
              </p>
              <Table>
                <thead>
                  <tr>
                    <Th>Room No.</Th>
                    <Th>Category</Th>
                    <Th>Block</Th>
                    <Th>Floor</Th>
                    <Th>Nursing Station</Th>
                    <Th>Fee</Th>
                    <Th>Select</Th>
                  </tr>
                </thead>
                <tbody>
                  {roomResults.map((room, i) => (
                    <tr
                      key={i}
                      style={{
                        background: selectedRoom?.room_number === room.room_number
                          ? "#ccfbf1"
                          : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => handleRoomClick(room)}
                    >
                      <Td>{room.room_number}</Td>
                      <Td>{room.room_category}</Td>
                      <Td>{room.block}</Td>
                      <Td>{room.floor}</Td>
                      <Td>{room.nursing_station}</Td>
                      <Td>₹{room.admission_fee}</Td>
                      <Td>
                        <Button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRoomClick(room); }}
                          style={{ padding: "3px 10px", fontSize: "0.8rem" }}
                        >
                          Select
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <NoResults>No rooms found.</NoResults>
          )}

          {/* Beds Section */}
          {selectedRoom && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 6, color: "#0d9488" }}>
                Step 2: Select a Bed in Room {selectedRoom.room_number}
              </p>
              {beds.length > 0 ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {beds.map((bed, i) => {
                    const bedId = typeof bed === "object" ? bed.bed_number || bed.id : bed;
                    const isOccupied = typeof bed === "object" ? bed.is_occupied : false;
                    return (
                      <div
                        key={i}
                        onClick={() => !isOccupied && handleBedSelect(bedId)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          border: `2px solid ${
                            isOccupied ? "#f87171" :
                            selectedBed === bedId ? "#0d9488" : "#94a3b8"
                          }`,
                          background: isOccupied ? "#fee2e2" : selectedBed === bedId ? "#ccfbf1" : "#f8fafc",
                          cursor: isOccupied ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: isOccupied ? "#991b1b" : "#0d9488",
                        }}
                      >
                        Bed {bedId} {isOccupied ? "(Occupied)" : ""}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // If room has no bed array, allow manual bed entry
                <div>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 8 }}>
                    Enter bed number manually:
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. 01, A, 02..."
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: "0.9rem",
                    }}
                    value={selectedBed || ""}
                    onChange={(e) => setSelectedBed(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {selectedRoom && (
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button type="button" secondary onClick={onClose}>Cancel</Button>
              <Button type="button" onClick={handleConfirm} disabled={!selectedBed}>
                Confirm Selection
              </Button>
            </div>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

// ── Print Receipt Component ──────────────────────────────────────────────────
const PrintReceipt = ({ data, onClose }) => {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    // Inject print styles
    let styleEl = document.getElementById("admission-print-style");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "admission-print-style";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #admission-receipt, #admission-receipt * { visibility: visible !important; }
        #admission-receipt {
          position: fixed; top: 0; left: 0;
          width: 100%; padding: 20px; box-sizing: border-box;
          background: white; z-index: 99999;
        }
      }
    `;
    window.print();
  };

  const fmtDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  };

  const fullName = [data.salutation, data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <ReceiptOverlay onClick={onClose}>
      <ReceiptBox onClick={(e) => e.stopPropagation()}>
        <div id="admission-receipt">
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 16, marginBottom: 8, fontFamily: "Courier New" }}>
            SHANMUGA HOSPITAL LTD
          </div>
          <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", padding: "8px 0", marginBottom: 10 }}>
            <BarcodeCanvas value={data.ipNumber || "S025/000000"} />
          </div>

          <div style={{ fontFamily: "Courier New", fontSize: 13 }}>
            <ReceiptRow>
              <span><strong>IP NO:</strong> {data.ipNumber}</span>
              <span><strong>Customer:</strong> {data.customerType}</span>
            </ReceiptRow>
            <ReceiptRow>
              <span><strong>Name:</strong> {fullName}</span>
              <span><strong>Age:</strong> {data.age} {data.gender?.toUpperCase()}</span>
            </ReceiptRow>
            <ReceiptRow>
              <span><strong>UHID:</strong> {data.uhid}</span>
              <span><strong>DOA:</strong> {fmtDate(data.admissionDate)}</span>
            </ReceiptRow>
            <ReceiptRow>
              <span><strong>AD.TIME:</strong> {data.time}</span>
              <span><strong>Room:</strong> {data.roomNo}</span>
            </ReceiptRow>
            <ReceiptRow>
              <span><strong>Bed:</strong> {data.bedNo}</span>
              <span></span>
            </ReceiptRow>
            <div style={{ marginTop: 6, borderTop: "1px dashed #000", paddingTop: 6 }}>
              <strong>Admitted by:</strong> {data.admittingDoctor}
            </div>
            {data.consultingDoctor && (
              <div><strong>Consulting:</strong> {data.consultingDoctor}</div>
            )}
            {data.nursingStation && (
              <div><strong>Nursing Station:</strong> {data.nursingStation}</div>
            )}
            {data.admissionFee && (
              <div><strong>Admission Fee:</strong> ₹{data.admissionFee}</div>
            )}
          </div>
        </div>

        <ReceiptActions>
          <Button secondary type="button" onClick={onClose}>Close</Button>
          <Button type="button" onClick={handlePrint}>🖨️ Print</Button>
        </ReceiptActions>
      </ReceiptBox>
    </ReceiptOverlay>
  );
};

// ── Cancel Confirmation Modal ────────────────────────────────────────────────
const CancelModal = ({ admission, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <ModalHeader>
          <ModalTitle>Cancel Admission</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <p style={{ marginBottom: 12, color: "#374151" }}>
            Are you sure you want to cancel the admission for{" "}
            <strong>{admission.firstName} {admission.lastName}</strong> (
            {admission.uhid})?
          </p>
          <Label>Cancellation Reason (optional)</Label>
          <TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for cancellation..."
            style={{ width: "100%", marginTop: 6 }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
            <Button secondary type="button" onClick={onClose}>No, Keep It</Button>
            <Button
              type="button"
              style={{ background: "#ef4444", color: "#fff", border: "none" }}
              onClick={() => onConfirm(reason)}
            >
              Yes, Cancel Admission
            </Button>
          </div>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

// ── Main Admission Component ─────────────────────────────────────────────────
const Admission = () => {
  const [activeTab, setActiveTab] = useState("admission");
  const [mlcVisible, setMlcVisible] = useState(false);
  const [newBornVisible, setNewBornVisible] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [admissions, setAdmissions] = useState([]);

  // Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(null); // null | "uhid" | "ip"
  const [showReceipt, setShowReceipt] = useState(null); // null | admissionData
  const [cancelTarget, setCancelTarget] = useState(null); // null | admission

  const [editingId, setEditingId] = useState(null);

  // Filter state for the top bar
  const [filterDoctor, setFilterDoctor] = useState("ALL");
  const [filterFromDate, setFilterFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterToDate, setFilterToDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterStatus, setFilterStatus] = useState("All");

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const emptyForm = {
    uhid: "", ipNumber: "", salutation: "", firstName: "", middleName: "", lastName: "",
    admissionDate: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    customerType: "GENERAL", admittingDoctor: "", consultingDoctor: "",
    roomNo: "", bedNo: "", extensionNumber: "", callRelease: "Local",
    nursingStation: "", presentComplaints: "", reasonForAdmission: "",
    admissionFee: "0.0", creditLimit: "200000.00", advance: "0.0",
    expectedDischargeDate: new Date().toISOString().split("T")[0],
    packageName: "", echsPackageFromDate: new Date().toISOString().split("T")[0],
    echsPackageToDate: new Date().toISOString().split("T")[0],
    admissionRemarks: "", mlcType: "", mlcRemarks: "", uploadMLCDoc: null,
    passAlertToAuthority: false, birthTime: "", weight: "", mothersUHIDNo: "",
    pediatricianResponsible: "", age: "", gender: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchDoctors();
    fetchAdmissions();
    fetchNextIPNumber();
  }, []);

  const fetchNextIPNumber = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}get-next-ip-number/`, "GET");
      if (response.success) {
        setFormData((prev) => ({ ...prev, ipNumber: response.data.next_ipNumber }));
      }
    } catch (err) {
      console.error("Could not fetch next IP number", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (response.success) setDoctors(response.data || []);
    } catch (err) {
      toast.error("Error fetching doctors");
    }
  };

  const fetchAdmissions = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}admission/`, "GET");
      if (response.success) setAdmissions(response.data || []);
    } catch (err) {
      toast.error("Error fetching admissions");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  // When patient is selected from UHID search modal
  const handlePatientSelect = (patient) => {
    setFormData((prev) => ({
      ...prev,
      uhid: patient.uhid || prev.uhid,
      salutation: patient.salutation || "",
      firstName: patient.firstName || "",
      middleName: patient.middleName || "",
      lastName: patient.lastName || "",
      age: patient.age || "",
      gender: patient.gender || "",
    }));
    setShowPatientSearchModal(null);
    toast.success("Patient details loaded");
  };

  // When admission is selected from IP search modal
  const handleIPAdmissionSelect = (admission) => {
    handleEdit(admission);
    setShowPatientSearchModal(null);
  };

  // Room + bed selected
  const handleRoomBedSelect = (room, bed) => {
    setFormData((prev) => ({
      ...prev,
      roomNo: room.room_number,
      bedNo: String(bed),
      extensionNumber: room.phone_extension || prev.extensionNumber,
      nursingStation: room.nursing_station || prev.nursingStation,
      admissionFee: room.admission_fee || prev.admissionFee,
    }));
    setShowRoomModal(false);
    toast.success(`Room ${room.room_number} / Bed ${bed} selected`);
  };

  const handleReset = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
    fetchNextIPNumber();
  };

  const handleEdit = (admission) => {
    setEditingId(admission._id || admission.id || admission.uhid);
    setFormData({
      ...emptyForm,
      ...admission,
      admissionDate: admission.admissionDate ? admission.admissionDate.split("T")[0] : "",
      echsPackageFromDate: admission.echsPackageFromDate ? admission.echsPackageFromDate.split("T")[0] : "",
      echsPackageToDate: admission.echsPackageToDate ? admission.echsPackageToDate.split("T")[0] : "",
      expectedDischargeDate: admission.expectedDischargeDate ? admission.expectedDischargeDate.split("T")[0] : "",
    });
    setActiveTab("admission");
    window.scrollTo(0, 0);
    toast.info("Editing admission record");
  };

  const handleCancelAdmission = async (reason) => {
    if (!cancelTarget) return;
    const id = cancelTarget._id || cancelTarget.id;
    try {
      const response = await apiRequest(`${HmsBaseUrl}admission/${id}/`, "DELETE", { cancellationReason: reason });
      if (response.success) {
        toast.success("Admission cancelled successfully");
        fetchAdmissions();
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      toast.error("Failed to cancel admission");
    } finally {
      setCancelTarget(null);
    }
  };

  // Validation
  const validateForm = () => {
    const required = [
      { field: "uhid", label: "UHID" },
      { field: "admissionDate", label: "Admission Date" },
      { field: "time", label: "Time" },
      { field: "customerType", label: "Customer Type" },
      { field: "admittingDoctor", label: "Admitting Doctor" },
      { field: "consultingDoctor", label: "Consulting Doctor" },
      { field: "roomNo", label: "Room No." },
      { field: "bedNo", label: "Bed No." },
    ];
    for (const { field, label } of required) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        toast.error(`${label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        formPayload.append(key, formData[key]);
      }
    });

    try {
      let response;
      if (editingId) {
        response = await apiRequest(`${HmsBaseUrl}admission/${editingId}/`, "PUT", formPayload);
      } else {
        response = await apiRequest(`${HmsBaseUrl}admission/`, "POST", formPayload);
      }

      if (response.success) {
        toast.success(editingId ? "Admission updated!" : "Admission saved!");
        // Show receipt only for new admissions
        if (!editingId) {
          setShowReceipt({ ...formData, ...(response.data || {}) });
        }
        setEditingId(null);
        handleReset();
        fetchAdmissions();
      } else {
        throw new Error(response.error || "Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save admission. " + err.message);
    }
  };

  // Filter admissions
  const filteredAdmissions = admissions.filter((a) => {
    if (filterDoctor !== "ALL" && a.admittingDoctor !== filterDoctor) return false;
    if (filterStatus === "Admitted" && !a.is_active) return false;
    if (filterStatus === "Discharged" && a.is_active) return false;
    if (filterStatus === "Cancelled" && a.is_active !== false) return false;
    return true;
  });

  return (
    <PageWrapper>
      {/* ── Top Filter Bar ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "12px 24px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Label style={{ margin: 0 }}>Admitting Doctor</Label>
          <Select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            style={{ width: 160 }}
          >
            <option value="ALL">ALL</option>
            {doctors.map((d) => (
              <option key={d.employeeId} value={d.employeeName}>{d.employeeName}</option>
            ))}
          </Select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Label style={{ margin: 0 }}>From Date</Label>
          <Input type="date" value={filterFromDate} onChange={(e) => setFilterFromDate(e.target.value)} style={{ width: 140 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Label style={{ margin: 0 }}>To Date</Label>
          <Input type="date" value={filterToDate} onChange={(e) => setFilterToDate(e.target.value)} style={{ width: 140 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Label style={{ margin: 0 }}>Status</Label>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 120 }}>
            <option>All</option>
            <option>Admitted</option>
            <option>Discharged</option>
            <option>Cancelled</option>
          </Select>
        </div>
        <Button type="button" onClick={fetchAdmissions} style={{ marginLeft: "auto" }}>🔍 Search</Button>
        <Button
          type="button"
          style={{ background: "#f97316", border: "none", color: "#fff" }}
          onClick={() => { handleReset(); setActiveTab("admission"); }}
        >
          + New Admission
        </Button>
      </div>

      <Container>
        <TabContainer>
          <Tab active={activeTab === "admission"} onClick={() => setActiveTab("admission")}>
            Admission
          </Tab>
          <Tab active={activeTab === "basicDetails"} onClick={() => setActiveTab("basicDetails")}>
            Basic Details
          </Tab>
        </TabContainer>

        {/* ── Admission Tab ── */}
        {activeTab === "admission" && (
          <FormContent>
            <form onSubmit={handleSubmit}>

              {/* Row 1: UHID, IP Number, First Name, Middle Name */}
              <FormRow>
                <InputWrapper>
                  <Label required>UHID <span style={{ color: "red" }}>*</span></Label>
                  <Input
                    type="text"
                    name="uhid"
                    value={formData.uhid}
                    onChange={handleInputChange}
                    placeholder="UHID"
                  />
                  <SearchButton
                    type="button"
                    title="Search patient by UHID (min 4 chars)"
                    onClick={() => setShowPatientSearchModal("uhid")}
                  >🔍</SearchButton>
                </InputWrapper>

                <InputWrapper>
                  <Label>IP Number</Label>
                  <Input
                    type="text"
                    name="ipNumber"
                    value={formData.ipNumber}
                    readOnly
                    style={{ background: "#f1f5f9" }}
                  />
                  <SearchButton
                    type="button"
                    title="Search admission by IP Number (min 4 chars)"
                    onClick={() => setShowPatientSearchModal("ip")}
                  >🔍</SearchButton>
                </InputWrapper>

                <InputWrapper>
                  <Select
                    name="salutation"
                    value={formData.salutation}
                    onChange={handleInputChange}
                    style={{ width: 80, flexShrink: 0 }}
                  >
                    <option value=""></option>
                    <option>Mr.</option><option>Mrs.</option><option>Ms.</option>
                    <option>Dr.</option><option>Baby</option>
                  </Select>
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

              {/* Row 2: Last Name, Admission Date, Time, Customer Type */}
              <FormRow>
                <InputWrapper>
                  <Label>Last Name</Label>
                  <Input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                </InputWrapper>

                <InputWrapper>
                  <Label>Admission Date <span style={{ color: "red" }}>*</span></Label>
                  <Input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} required />
                </InputWrapper>

                <InputWrapper>
                  <Label>Time <span style={{ color: "red" }}>*</span></Label>
                  <Input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
                </InputWrapper>

                <InputWrapper>
                  <Label>Customer Type <span style={{ color: "red" }}>*</span></Label>
                  <Select name="customerType" value={formData.customerType} onChange={handleInputChange} required>
                    <option value="GENERAL">GENERAL</option>
                    <option value="Insurance">Insurance</option>
                    <option value="ECHS">ECHS</option>
                    <option value="CGHS">CGHS</option>
                    <option value="ESI">ESI</option>
                  </Select>
                </InputWrapper>
              </FormRow>

              {/* Row 3: Admitting Doctor, Consulting Doctor, Room No, Bed No */}
              <FormRow>
                <InputWrapper>
                  <Label>Admitting Doctor <span style={{ color: "red" }}>*</span></Label>
                  <Select name="admittingDoctor" value={formData.admittingDoctor} onChange={handleInputChange} required>
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.employeeId} value={d.employeeName}>{d.employeeName}</option>
                    ))}
                  </Select>
                </InputWrapper>

                <InputWrapper>
                  <Label>Consulting Doctor <span style={{ color: "red" }}>*</span></Label>
                  <Select name="consultingDoctor" value={formData.consultingDoctor} onChange={handleInputChange} required>
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.employeeId} value={d.employeeName}>{d.employeeName}</option>
                    ))}
                  </Select>
                </InputWrapper>

                <InputWrapper>
                  <Label>Room No. <span style={{ color: "red" }}>*</span></Label>
                  <Input
                    type="text"
                    name="roomNo"
                    value={formData.roomNo}
                    readOnly
                    style={{ background: "#f1f5f9" }}
                    placeholder="Select from search"
                  />
                  <SearchButton type="button" onClick={() => setShowRoomModal(true)}>🔍</SearchButton>
                </InputWrapper>

                <InputWrapper>
                  <Label>Bed No. <span style={{ color: "red" }}>*</span></Label>
                  <Input
                    type="text"
                    name="bedNo"
                    value={formData.bedNo}
                    readOnly
                    style={{ background: "#f1f5f9" }}
                    placeholder="Select from Room"
                  />
                </InputWrapper>
              </FormRow>

              {/* Row 4: Extension, Call Release, Nursing Station */}
              <FormRow>
                <InputWrapper>
                  <Label>Extension Number</Label>
                  <Input type="text" name="extensionNumber" value={formData.extensionNumber} onChange={handleInputChange} />
                </InputWrapper>

                <InputWrapper>
                  <Label>Call Release</Label>
                  <Select name="callRelease" value={formData.callRelease} onChange={handleInputChange}>
                    <option value="Local">Local</option>
                    <option value="STD">STD</option>
                    <option value="ISD">ISD</option>
                  </Select>
                </InputWrapper>

                <InputWrapper span={2}>
                  <Label>Nursing Station</Label>
                  <Input type="text" name="nursingStation" value={formData.nursingStation} onChange={handleInputChange} />
                </InputWrapper>
              </FormRow>

              {/* Row 5: Complaints, Reason */}
              <FormRow columns="1fr 1fr">
                <InputWrapper>
                  <Label>Present Complaints</Label>
                  <TextArea name="presentComplaints" value={formData.presentComplaints} onChange={handleInputChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label>Reason for Admission</Label>
                  <TextArea name="reasonForAdmission" value={formData.reasonForAdmission} onChange={handleInputChange} />
                </InputWrapper>
              </FormRow>

              {/* Row 6: Fee, Credit, Advance, Discharge Date */}
              <FormRow>
                <InputWrapper>
                  <Label>Admission Fee</Label>
                  <Input type="number" step="0.01" name="admissionFee" value={formData.admissionFee} onChange={handleInputChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label>Credit Limit</Label>
                  <Input type="number" step="0.01" name="creditLimit" value={formData.creditLimit} onChange={handleInputChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label>Advance</Label>
                  <Input type="number" step="0.01" name="advance" value={formData.advance} onChange={handleInputChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label>Expected Discharge Date</Label>
                  <Input type="date" name="expectedDischargeDate" value={formData.expectedDischargeDate} onChange={handleInputChange} />
                </InputWrapper>
              </FormRow>

              {/* Row 7: Package, ECHS dates */}
              <FormRow>
                <InputWrapper span={2}>
                  <Label>Package Name</Label>
                  <Input type="text" name="packageName" value={formData.packageName} onChange={handleInputChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label>ECHS Package From Date</Label>
                  <Input type="date" name="echsPackageFromDate" value={formData.echsPackageFromDate} onChange={handleInputChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label>ECHS Package To Date</Label>
                  <Input type="date" name="echsPackageToDate" value={formData.echsPackageToDate} onChange={handleInputChange} />
                </InputWrapper>
              </FormRow>

              {/* Row 8: Remarks */}
              <FormRow columns="1fr">
                <InputWrapper>
                  <Label>Admission Remarks</Label>
                  <TextArea name="admissionRemarks" value={formData.admissionRemarks} onChange={handleInputChange} />
                </InputWrapper>
              </FormRow>

              {/* Collapsible: MLC + New Born */}
              <FormRow columns="1fr 1fr">
                <CollapsibleSection>
                  <SectionHeader onClick={() => setMlcVisible(!mlcVisible)}>
                    <SectionTitle>MLC</SectionTitle>
                    <span>{mlcVisible ? "▲" : "▼"}</span>
                  </SectionHeader>
                  <SectionContent visible={mlcVisible}>
                    <InputWrapper>
                      <Label>MLC Type</Label>
                      <Select name="mlcType" value={formData.mlcType} onChange={handleInputChange}>
                        <option value="">Select</option>
                        <option value="Accident">Accident</option>
                        <option value="Assault">Assault</option>
                        <option value="Other">Other</option>
                      </Select>
                    </InputWrapper>
                    <InputWrapper style={{ marginTop: 12 }}>
                      <Label>Upload MLC Doc <InfoIcon>?</InfoIcon></Label>
                      <FileInput type="file" name="uploadMLCDoc" onChange={handleInputChange} />
                    </InputWrapper>
                    <CheckboxWrapper>
                      <Checkbox type="checkbox" name="passAlertToAuthority" checked={formData.passAlertToAuthority} onChange={handleInputChange} />
                      <Label style={{ margin: 0 }}>Pass alert to authority</Label>
                    </CheckboxWrapper>
                    <InputWrapper style={{ marginTop: 12 }}>
                      <Label>MLC Remarks</Label>
                      <TextArea name="mlcRemarks" value={formData.mlcRemarks} onChange={handleInputChange} />
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
                        <Input type="time" name="birthTime" value={formData.birthTime} onChange={handleInputChange} />
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Weight <InfoIcon>?</InfoIcon></Label>
                        <Input type="text" name="weight" value={formData.weight} onChange={handleInputChange} />
                      </InputWrapper>
                    </FormRow>
                    <FormRow columns="1fr 1fr" style={{ marginTop: 12 }}>
                      <InputWrapper>
                        <Label>Mother's UHID No</Label>
                        <Input type="text" name="mothersUHIDNo" value={formData.mothersUHIDNo} onChange={handleInputChange} />
                        <SearchButton type="button">🔍</SearchButton>
                      </InputWrapper>
                      <InputWrapper>
                        <Label>Pediatrician Responsible</Label>
                        <Select name="pediatricianResponsible" value={formData.pediatricianResponsible} onChange={handleInputChange}>
                          <option value="">Select</option>
                          {doctors.map((d) => (
                            <option key={d.employeeId} value={d.employeeName}>{d.employeeName}</option>
                          ))}
                        </Select>
                      </InputWrapper>
                    </FormRow>
                  </SectionContent>
                </CollapsibleSection>
              </FormRow>

              <ButtonContainer>
                <Button secondary type="button" onClick={handleReset}>🔄 Reset</Button>
                <Button type="submit">
                  {editingId ? "💾 Update Admission" : "💾 Save Admission"}
                </Button>
              </ButtonContainer>
            </form>
          </FormContent>
        )}

        {/* ── Basic Details Tab ── */}
        {activeTab === "basicDetails" && (
          <FormContent>
            <FormRow columns="1fr 1fr">
              <div>
                <p style={{ fontWeight: 600, marginBottom: 12, color: "#0d9488" }}>Present Address</p>
                <InputWrapper><Label>LINE 1</Label><Input type="text" name="presentAddressLine1" value={formData.presentAddressLine1 || ""} onChange={handleInputChange} /></InputWrapper>
                <InputWrapper style={{ marginTop: 8 }}><Label>LINE 2</Label><Input type="text" name="presentAddressLine2" value={formData.presentAddressLine2 || ""} onChange={handleInputChange} /></InputWrapper>
                <InputWrapper style={{ marginTop: 8 }}><Label>LINE 3</Label><Input type="text" name="presentAddressLine3" value={formData.presentAddressLine3 || ""} onChange={handleInputChange} /></InputWrapper>
              </div>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 12, color: "#0d9488" }}>Permanent Address</p>
                <InputWrapper><Label>LINE 1</Label><Input type="text" name="permanentAddressLine1" value={formData.permanentAddressLine1 || ""} onChange={handleInputChange} /></InputWrapper>
                <InputWrapper style={{ marginTop: 8 }}><Label>LINE 2</Label><Input type="text" name="permanentAddressLine2" value={formData.permanentAddressLine2 || ""} onChange={handleInputChange} /></InputWrapper>
                <InputWrapper style={{ marginTop: 8 }}><Label>LINE 3</Label><Input type="text" name="permanentAddressLine3" value={formData.permanentAddressLine3 || ""} onChange={handleInputChange} /></InputWrapper>
              </div>
            </FormRow>
            <FormRow>
              <InputWrapper><Label>Area <span style={{ color: "red" }}>*</span></Label><Input type="text" name="area" value={formData.area || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>City / Town</Label><Input type="text" name="city" value={formData.city || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>State</Label><Input type="text" name="state" value={formData.state || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>Country</Label><Input type="text" name="country" value={formData.country || ""} onChange={handleInputChange} /></InputWrapper>
            </FormRow>
            <FormRow>
              <InputWrapper><Label>Guardian</Label><Input type="text" name="guardian" value={formData.guardian || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>DOB</Label><Input type="date" name="dob" value={formData.dob || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>Age</Label>
                <div style={{ display: "flex", gap: 4 }}>
                  <Input type="number" placeholder="Year" name="ageYear" value={formData.ageYear || ""} onChange={handleInputChange} style={{ width: 60 }} />
                  <Input type="number" placeholder="Month" name="ageMonth" value={formData.ageMonth || ""} onChange={handleInputChange} style={{ width: 70 }} />
                  <Input type="number" placeholder="Days" name="ageDays" value={formData.ageDays || ""} onChange={handleInputChange} style={{ width: 60 }} />
                </div>
              </InputWrapper>
              <InputWrapper><Label>Gender</Label>
                <Select name="gender" value={formData.gender || ""} onChange={handleInputChange}>
                  <option value=""></option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </Select>
              </InputWrapper>
            </FormRow>
            <FormRow>
              <InputWrapper><Label>Blood Group</Label>
                <Select name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleInputChange}>
                  <option value=""></option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g}>{g}</option>)}
                </Select>
              </InputWrapper>
              <InputWrapper><Label>Marital Status</Label>
                <Select name="maritalStatus" value={formData.maritalStatus || ""} onChange={handleInputChange}>
                  <option value=""></option>
                  <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                </Select>
              </InputWrapper>
              <InputWrapper><Label>Spouse Name</Label><Input type="text" name="spouseName" value={formData.spouseName || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>Nationality</Label>
                <Select name="nationality" value={formData.nationality || ""} onChange={handleInputChange}>
                  <option value=""></option><option>Indian</option><option>Other</option>
                </Select>
              </InputWrapper>
            </FormRow>
            <FormRow>
              <InputWrapper><Label>Religion</Label>
                <Select name="religion" value={formData.religion || ""} onChange={handleInputChange}>
                  <option value=""></option>
                  <option>Hindu</option><option>Muslim</option><option>Christian</option><option>Other</option>
                </Select>
              </InputWrapper>
              <InputWrapper><Label>Passport Number</Label><Input type="text" name="passportNumber" value={formData.passportNumber || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>Passport Issue Date</Label><Input type="date" name="passportIssueDate" value={formData.passportIssueDate || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>Visa Number</Label><Input type="text" name="visaNumber" value={formData.visaNumber || ""} onChange={handleInputChange} /></InputWrapper>
            </FormRow>
            <FormRow>
              <InputWrapper><Label>Visa Issue Date</Label><Input type="date" name="visaIssueDate" value={formData.visaIssueDate || ""} onChange={handleInputChange} /></InputWrapper>
              <InputWrapper><Label>Visa Issued Place</Label><Input type="text" name="visaIssuedPlace" value={formData.visaIssuedPlace || ""} onChange={handleInputChange} /></InputWrapper>
            </FormRow>
            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>🔄 Reset</Button>
              <Button type="button" onClick={handleSubmit}>💾 Save</Button>
            </ButtonContainer>
          </FormContent>
        )}

        {/* ── Admissions Table ── */}
        <div style={{ padding: "24px", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#0d9488", margin: 0 }}>Admitted Patients</h3>
            <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
              {filteredAdmissions.length} record(s)
            </span>
          </div>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Status</Th>
                  <Th>Adm Date</Th>
                  <Th>Time</Th>
                  <Th>UHID</Th>
                  <Th>Name</Th>
                  <Th>Age</Th>
                  <Th>Gender</Th>
                  <Th>Admitting Dr.</Th>
                  <Th>Room/Bed</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length === 0 ? (
                  <Tr>
                    <Td colSpan="10" style={{ textAlign: "center", padding: 40 }}>
                      No admission records found
                    </Td>
                  </Tr>
                ) : (
                  filteredAdmissions.map((admission, idx) => {
                    const fmtDate = (d) => {
                      if (!d) return "-";
                      const dt = new Date(d);
                      return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
                    };
                    const isActive = admission.is_active !== false;
                    return (
                      <Tr key={idx}>
                        <Td>
                          <span style={{
                            padding: "4px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600,
                            background: isActive ? "#dcfce7" : "#fee2e2",
                            color: isActive ? "#166534" : "#991b1b",
                          }}>
                            {isActive ? "Admitted" : "Cancelled"}
                          </span>
                        </Td>
                        <Td>{fmtDate(admission.admissionDate)}</Td>
                        <Td>{admission.time || "-"}</Td>
                        <Td>{admission.uhid}</Td>
                        <Td>{`${admission.firstName || ""} ${admission.middleName || ""} ${admission.lastName || ""}`.trim()}</Td>
                        <Td>{admission.age || "-"}</Td>
                        <Td>{admission.gender || "-"}</Td>
                        <Td>{admission.admittingDoctor || "-"}</Td>
                        <Td>{`${admission.roomNo || "-"}/${admission.bedNo || "-"}`}</Td>
                        <Td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <Button
                              type="button"
                              style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                              onClick={() => handleEdit(admission)}
                              disabled={!isActive}
                              title="Edit Admission"
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              type="button"
                              style={{
                                padding: "4px 10px", fontSize: "0.8rem",
                                background: !isActive ? "#d1d5db" : "#ef4444",
                                color: "white", border: "none",
                              }}
                              onClick={() => setCancelTarget(admission)}
                              disabled={!isActive}
                              title="Cancel Admission"
                            >
                              🚫 Cancel
                            </Button>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </Container>

      {/* ── Modals ── */}

      {showPatientSearchModal && (
        <PatientSearchModal
          mode={showPatientSearchModal}
          HmsBaseUrl={HmsBaseUrl}
          onClose={() => setShowPatientSearchModal(null)}
          onSelect={showPatientSearchModal === "ip" ? handleIPAdmissionSelect : handlePatientSelect}
        />
      )}

      {showRoomModal && (
        <RoomBedModal
          HmsBaseUrl={HmsBaseUrl}
          onClose={() => setShowRoomModal(false)}
          onSelect={handleRoomBedSelect}
        />
      )}

      {showReceipt && (
        <PrintReceipt
          data={showReceipt}
          onClose={() => setShowReceipt(null)}
        />
      )}

      {cancelTarget && (
        <CancelModal
          admission={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelAdmission}
        />
      )}
    </PageWrapper>
  );
};

export default Admission;