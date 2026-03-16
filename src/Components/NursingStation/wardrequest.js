import React, { useEffect, useRef, useState } from "react";
import apiRequest from "../../Auth/apiRequest";
import LabWardRequest from "./LabWardRequest";
import MedicineWardRequest from "./MedicineWardRequest";



import {
  PageWrapper,
  Container,
  ControlsContainer,
  SearchContainer,
  InputWrapper,
  Input,
  Label,
  Button,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  colors,
} from "../GlobalStyles";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── helper: safely pull a field from top-level OR patient_details ───────────
const getField = (item, field) => {
  // top-level wins if non-null
  if (item[field] !== null && item[field] !== undefined) return item[field];
  // fall back to nested patient_details
  if (item.patient_details && item.patient_details[field] !== null && item.patient_details[field] !== undefined)
    return item.patient_details[field];
  return null;
};

const WardRequest = () => {
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [nursingStation, setNursingStation] = useState("ALL");
  const [roomCategory, setRoomCategory] = useState("ALL");
  const [block, setBlock] = useState("ALL");
  const [wards, setWards] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUpTo, setShowUpTo] = useState(15);
  const [loading, setLoading] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showLabModal, setShowLabModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const menuRef = useRef(null);

  // ── fetch helpers ────────────────────────────────────────────────────────────
  const fetchWards = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_wards_list/`, "GET");
      if (res.success) {
        const wardList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setWards(wardList);
      }
    } catch (err) {
      console.error("Ward fetch failed", err);
    }
  };

  const fetchBlocks = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}block/`, "GET");
      if (res) {
        const blockList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setBlocks(blockList);
      }
    } catch (err) {
      console.error("Block fetch failed", err);
    }
  };

  const fetchRoomCategories = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
      if (res) {
        const categoryList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setRoomCategories(categoryList);
      }
    } catch (err) {
      console.error("Room category fetch failed", err);
    }
  };

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const url = `${HmsBaseUrl}wardrequest/?from_date=${fromDate}&to_date=${toDate}`;
      const res = await apiRequest(url, "GET");
      if (res.success) {
        setAdmissions(res.data.data || []);
      }
    } catch (err) {
      console.error("Admission fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
    fetchWards();
    fetchBlocks();
    fetchRoomCategories();
  }, []);

  // close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── client-side filters ──────────────────────────────────────────────────────
  const filteredAdmissions = admissions.filter((item) => {
    // resolve patient fields from nested or flat structure
    const patientName = [
      getField(item, "salutation"),
      getField(item, "firstName"),
      getField(item, "middleName"),
      getField(item, "lastName"),
    ]
      .filter(Boolean)
      .join(" ");

    const uhid = getField(item, "uhid") || "";
    const ipNumber = item.ipNumber || "";

    const matchesSearch =
      !search ||
      ipNumber.toLowerCase().includes(search.toLowerCase()) ||
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      uhid.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const isDischarged = getField(item, "is_discharged");
    if (statusFilter === "admitted") return isDischarged === false || isDischarged === null;
    if (statusFilter === "discharged") return isDischarged === true;
    return true;
  });

  const displayedAdmissions = filteredAdmissions.slice(0, showUpTo);

  // ── format date ──────────────────────────────────────────────────────────────
  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        <h2 style={{ padding: "20px", color: colors.primary }}>Ward Request</h2>

        {/* ── Top filter bar ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            padding: "12px 20px",
            alignItems: "flex-end",
            backgroundColor: "#f9f9f9",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <InputWrapper>
            <Label>Nursing Station</Label>
            <select
              style={selectStyle}
              value={nursingStation}
              onChange={(e) => setNursingStation(e.target.value)}
            >
              <option value="ALL">ALL</option>
              {wards.map((ward, i) => (
                <option key={i} value={ward.ward_name}>
                  {ward.ward_name}
                </option>
              ))}
            </select>
          </InputWrapper>

          <InputWrapper>
            <Label>Room Category</Label>
            <select
              style={selectStyle}
              value={roomCategory}
              onChange={(e) => setRoomCategory(e.target.value)}
            >
              <option value="ALL">ALL</option>
              {roomCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </InputWrapper>

          <InputWrapper>
            <Label>Block</Label>
            <select
              style={selectStyle}
              value={block}
              onChange={(e) => setBlock(e.target.value)}
            >
              <option value="ALL">ALL</option>
              {blocks.map((blk, i) => (
                <option key={i} value={blk.block_name}>
                  {blk.block_name}
                </option>
              ))}
            </select>
          </InputWrapper>

          <InputWrapper>
            <Label>From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </InputWrapper>

          <InputWrapper>
            <Label>To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </InputWrapper>

          <Button onClick={fetchAdmissions} disabled={loading}>
            {loading ? "⏳ Loading…" : "🔍 Search"}
          </Button>
        </div>

        {/* ── Controls row ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* Show up to */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Label style={{ margin: 0 }}>Show up to</Label>
            <select
              style={{ ...selectStyle, minWidth: "70px" }}
              value={showUpTo}
              onChange={(e) => setShowUpTo(Number(e.target.value))}
            >
              {[10, 15, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span style={{ fontSize: "13px", color: "#666" }}>
              ({filteredAdmissions.length} total)
            </span>
          </div>

          {/* Status toggles + search */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setStatusFilter(statusFilter === "admitted" ? "all" : "admitted")}
              style={{
                ...toggleBtn,
                backgroundColor: statusFilter === "admitted" ? "#0d9488" : "#e0e0e0",
                color: statusFilter === "admitted" ? "#fff" : "#555",
                boxShadow: statusFilter === "admitted" ? "0 2px 6px rgba(13,148,136,0.4)" : "none",
              }}
            >
              <span style={{
                display: "inline-block",
                width: 9,
                height: 9,
                borderRadius: "50%",
                backgroundColor: statusFilter === "admitted" ? "#fff" : "#999",
                marginRight: 7,
              }} />
              Admitted
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "discharged" ? "all" : "discharged")}
              style={{
                ...toggleBtn,
                backgroundColor: statusFilter === "discharged" ? "#e07d3a" : "#e0e0e0",
                color: statusFilter === "discharged" ? "#fff" : "#555",
                boxShadow: statusFilter === "discharged" ? "0 2px 6px rgba(224,125,58,0.4)" : "none",
              }}
            >
              <span style={{
                display: "inline-block",
                width: 9,
                height: 9,
                borderRadius: "50%",
                backgroundColor: statusFilter === "discharged" ? "#fff" : "#999",
                marginRight: 7,
              }} />
              Discharged
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Label style={{ margin: 0 }}>Search:</Label>
              <Input
                type="text"
                placeholder="IP No, Patient, UHID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "220px" }}
              />
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Admission Date &amp; Time</Th>
                <Th>Status</Th>
                <Th>Patient</Th>
                <Th>IP No. | IP Serial No</Th>
                <Th>Age</Th>
                <Th>Gender</Th>
                <Th>Admitting Dr</Th>
                <Th>Cons Doctor</Th>
                <Th>Room | Bed</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <Tr>
                  <Td colSpan="10" style={{ textAlign: "center", padding: "30px" }}>
                    Loading...
                  </Td>
                </Tr>
              ) : displayedAdmissions.length > 0 ? (
                displayedAdmissions.map((item, index) => {
                  // ── resolve all fields (flat OR nested patient_details) ──────
                  const pd = item.patient_details || {};

                  const salutation = item.salutation ?? pd.salutation ?? "";
                  const firstName = item.firstName ?? pd.firstName ?? "";
                  const middleName = item.middleName ?? pd.middleName ?? "";
                  const lastName = item.lastName ?? pd.lastName ?? "";
                  const uhid = item.uhid ?? pd.uhid ?? "-";
                  const age = item.age ?? pd.age ?? "-";
                  const gender = item.gender ?? pd.gender ?? "-";
                  const isDischarged = item.is_discharged ?? pd.is_discharged ?? false;

                  const fullName = [salutation, firstName, middleName, lastName]
                    .filter(Boolean)
                    .join(" ") || "Unknown Patient";

                  return (
                    <Tr key={index}>
                      <Td>{formatDateTime(item.admissionDateTime)}</Td>

                      <Td>
                        {!isDischarged ? (
                          <span style={badgeStyle(colors.primary || "#0d9488")}>Admitted</span>
                        ) : (
                          <span style={badgeStyle(colors.danger || "#f97316", true)}>Discharged</span>
                        )}
                      </Td>

                      <Td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={avatarStyle}>👤</div>
                          <div>
                            <strong>{fullName}</strong>
                            <br />
                            <small style={{ color: "#888" }}>{uhid}</small>
                          </div>
                        </div>
                      </Td>

                      <Td>{item.ipNumber || "-"} | {item.ipserial_number || "-"}</Td>
                      <Td>{age}</Td>
                      <Td>{gender}</Td>
                      <Td>{item.admittingDoctor || "-"}</Td>
                      <Td>{item.consultingDoctor || "-"}</Td>
                      <Td>{item.roomNo || "-"} | {item.bedNo || "-"}</Td>
                      <Td>
                        <div style={{ position: "relative" }}>
                          <button
                            style={actionBtn}
                            title="Actions"
                            onClick={(e) => {
                              if (openMenuIndex === index) {
                                setOpenMenuIndex(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPosition({
                                  top: rect.bottom + window.scrollY + 4,
                                  left: rect.right + window.scrollX - 210,
                                });
                                setOpenMenuIndex(index);
                              }
                            }}
                          >
                            ⋮
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan="10" style={{ textAlign: "center", padding: "30px" }}>
                    No Records Found
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        </TableWrapper>

        {/* ── Fixed-position action dropdown (renders outside scroll) ── */}
        {openMenuIndex !== null && (
          <div
            ref={menuRef}
            style={{
              ...dropdownMenu,
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <div 
              style={menuItem} 
              onClick={() => {
                const item = displayedAdmissions[openMenuIndex];
                setSelectedPatient(item);
                setShowMedicineModal(true);
                setOpenMenuIndex(null);
              }}
            >
              <span style={menuIcon}>℞</span> Add Medicine Usage
            </div>

            <div
              style={menuItem}
              onClick={() => {
                const item = displayedAdmissions[openMenuIndex];
                setSelectedPatient(item);
                setShowLabModal(true);
                setOpenMenuIndex(null);
              }}
            >
              <span style={menuIcon}>🧪</span> Add Lab Request
            </div>
            <div style={menuItem} onClick={() => setOpenMenuIndex(null)}>
              <span style={menuIcon}>📋</span> Add Other Service Req
            </div>
            <div style={menuItem} onClick={() => setOpenMenuIndex(null)}>
              <span style={menuIcon}>📋</span> View Pending Medicine List
            </div>
          </div>
        )}
        {/* ── Lab Request Modal ── */}
        {showLabModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLabModal(false);
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                width: "95%",
                maxWidth: "1200px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 24px",
                  borderBottom: "1px solid #e0e0e0",
                  backgroundColor: "#546E7A",
                  borderRadius: "10px 10px 0 0",
                  flexShrink: 0,
                }}
              >
                <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 700 }}>
                  🧪 Add Lab Request
                  {selectedPatient && (
                    <span style={{ fontWeight: 400, marginLeft: 12, fontSize: "14px", opacity: 0.85 }}>
                      — {[
                        selectedPatient.salutation ?? selectedPatient.patient_details?.salutation,
                        selectedPatient.firstName ?? selectedPatient.patient_details?.firstName,
                        selectedPatient.lastName ?? selectedPatient.patient_details?.lastName,
                      ].filter(Boolean).join(" ")}
                      {selectedPatient.ipNumber ? ` | IP: ${selectedPatient.ipNumber}` : ""}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowLabModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "0", flex: 1 }}>
                <LabWardRequest patient={selectedPatient} onClose={() => setShowLabModal(false)} />
              </div>
            </div>
          </div>
        )}

        {/* ── Medicine Request Modal ── */}
        {showMedicineModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowMedicineModal(false);
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                width: "95%",
                maxWidth: "1200px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 24px",
                  borderBottom: "1px solid #e0e0e0",
                  backgroundColor: "#00897B",
                  borderRadius: "10px 10px 0 0",
                  flexShrink: 0,
                }}
              >
                <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 700 }}>
                  ℞ Add Medicine Usage
                  {selectedPatient && (
                    <span style={{ fontWeight: 400, marginLeft: 12, fontSize: "14px", opacity: 0.85 }}>
                      — {[
                        selectedPatient.salutation ?? selectedPatient.patient_details?.salutation,
                        selectedPatient.firstName ?? selectedPatient.patient_details?.firstName,
                        selectedPatient.lastName ?? selectedPatient.patient_details?.lastName,
                      ].filter(Boolean).join(" ")}
                      {selectedPatient.ipNumber ? ` | IP: ${selectedPatient.ipNumber}` : ""}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowMedicineModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "0", flex: 1 }}>
                <MedicineWardRequest patient={selectedPatient} onClose={() => setShowMedicineModal(false)} />
              </div>
            </div>
          </div>
        )}

      </Container>
    </PageWrapper>
  );
};

// ── style constants ──────────────────────────────────────────────────────────
const selectStyle = {
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
  backgroundColor: "#fff",
  cursor: "pointer",
  minWidth: "120px",
};

const toggleBtn = {
  display: "flex",
  alignItems: "center",
  padding: "6px 16px",
  borderRadius: "20px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "13px",
  transition: "background 0.2s",
};

const dotStyle = (active) => ({
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#fff",
  marginRight: 6,
  opacity: active ? 1 : 0.5,
});

const badgeStyle = (bg, rounded = false) => ({
  backgroundColor: bg,
  color: "#fff",
  padding: "3px 12px",
  borderRadius: rounded ? "12px" : "4px",
  fontSize: "12px",
  fontWeight: 600,
});

const avatarStyle = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: "#e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  flexShrink: 0,
};

const actionBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "20px",
  color: "#555",
  fontWeight: "bold",
  lineHeight: 1,
  padding: "2px 6px",
};

const dropdownMenu = {
  backgroundColor: "#2d3748",
  borderRadius: "8px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  zIndex: 9999,
  minWidth: "210px",
  overflow: "hidden",
  padding: "6px 0",
};

const menuItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 16px",
  color: "#fff",
  fontSize: "13.5px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background 0.15s",
};

const menuIcon = {
  fontSize: "15px",
  minWidth: "18px",
  textAlign: "center",
};

export default WardRequest;