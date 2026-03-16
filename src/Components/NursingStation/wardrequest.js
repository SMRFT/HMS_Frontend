import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import LabWardRequest from "./LabWardRequest";
import MedicineWardRequest from "./MedicineWardRequest";
import RadiologyWardRequest from "./RadiologyWardRequest";
import { PageWrapper, Container, colors, Table, Th, Td, Tr, Button, Input, Select, ModalOverlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody } from "../GlobalStyles";

// Modern Icons
import {
  FiSearch,
  FiMoreVertical,
  FiX,
  FiActivity,
  FiPlusCircle,
  FiFileText,
  FiUser,
  FiClock,
  FiFilter
} from "react-icons/fi";
import { MdOutlineScience, MdOutlineMedication } from "react-icons/md";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalSlideUp = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

// ─── Styled Components ───────────────────────────────────────────────────────
const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0 16px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid ${colors.border};

  h2 {
    margin: 0;
    color: ${colors.textMain};
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const Card = styled.div`
  background: ${colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid ${colors.border};
  padding: 20px;
  margin-bottom: 24px;
`;

const FilterGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 160px;

  label {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

// const StyledInput = styled.input`...`
// const StyledSelect = styled.select`...`
// const PrimaryButton = styled.button`...`

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SegmentedControl = styled.div`
  display: flex;
  background: ${colors.background};
  padding: 4px;
  border-radius: 10px;
  border: 1px solid ${colors.border};
`;

const SegmentButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: ${(props) => (props.$active ? colors.surface : "transparent")};
  color: ${(props) => (props.$active ? props.$activeColor || colors.textMain : colors.textMuted)};
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${(props) => (props.$active ? "0 2px 4px rgba(0,0,0,0.05)" : "none")};
  display: flex;
  align-items: center;
  gap: 6px;

  span.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(props) => (props.$active ? props.$activeColor || colors.primary : "#cbd5e1")};
  }
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 12px;
    color: ${colors.textMuted};
  }

  input {
    padding: 10px 14px 10px 36px;
    border: 1px solid ${colors.border};
    border-radius: 8px;
    font-size: 0.9rem;
    width: 250px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px "rgba(13, 148, 136, 0.1)";
    }
  }
`;

// const ModernTable = styled.table`...`

const PatientCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: ${colors.primary}15;
    color: ${colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    border: 1px solid ${colors.primary}30;
  }

  .info {
    display: flex;
    flex-direction: column;
    strong { font-weight: 600; color: ${colors.textMain}; }
    small { font-size: 0.75rem; color: ${colors.textMuted}; }
  }
`;

const StatusBadge = styled.span`
  background: ${(props) => (props.$isDischarged ? "#fff7ed" : "#f0fdfa")};
  color: ${(props) => (props.$isDischarged ? colors.secondary : colors.primary)};
  border: 1px solid ${(props) => (props.$isDischarged ? "#ffedd5" : "#ccfbf1")};
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textMuted};
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${colors.background};
    color: ${colors.textMain};
  }
`;

const DropdownMenu = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  padding: 8px;
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease-out;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    color: ${colors.textMain};
    font-size: 0.85rem;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;

    svg {
      color: ${colors.textMuted};
      font-size: 1.1rem;
    }

    &:hover {
      background: ${colors.background};
      color: ${colors.primary};
      svg { color: ${colors.primary}; }
    }
  }
`;

// const ModalOverlay = styled.div`...`
// const ModalContainer = styled.div`...`
// const ModalHeader = styled.div`...`

// ─── Helper Functions ────────────────────────────────────────────────────────
const getField = (item, field) => {
  if (item[field] !== null && item[field] !== undefined) return item[field];
  if (item.patient_details && item.patient_details[field] !== null && item.patient_details[field] !== undefined)
    return item.patient_details[field];
  return null;
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
};

// ─── Main Component ──────────────────────────────────────────────────────────
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
  const [showRadiologyModal, setShowRadiologyModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const menuRef = useRef(null);

  const [showActionModal, setShowActionModal] = useState(false);

  const fetchWards = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_wards_list/`, "GET");
      if (res.success) {
        const wardList = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setWards(wardList);
      }
    } catch (err) { console.error("Ward fetch failed", err); }
  };

  const fetchBlocks = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}block/`, "GET");
      if (res) {
        const blockList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setBlocks(blockList);
      }
    } catch (err) { console.error("Block fetch failed", err); }
  };

  const fetchRoomCategories = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
      if (res) {
        const categoryList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setRoomCategories(categoryList);
      }
    } catch (err) { console.error("Room category fetch failed", err); }
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAdmissions = admissions.filter((item) => {
    const patientName = [
      getField(item, "salutation"), getField(item, "firstName"),
      getField(item, "middleName"), getField(item, "lastName"),
    ].filter(Boolean).join(" ");

    const uhid = getField(item, "uhid") || "";
    const ipNumber = item.ipNumber || "";

    const matchesSearch =
      !search ||
      ipNumber.toLowerCase().includes(search.toLowerCase()) ||
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      uhid.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const isDischarged = getField(item, "is_discharged");
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "admitted" && (isDischarged === false || isDischarged === null)) ||
                         (statusFilter === "discharged" && isDischarged === true);
    if (!matchesStatus) return false;

    const matchesStation = nursingStation === "ALL" || String(getField(item, "nursing_station_id")) === nursingStation;
    if (!matchesStation) return false;

    const matchesCategory = roomCategory === "ALL" || String(getField(item, "room_category_id")) === roomCategory;
    if (!matchesCategory) return false;

    const matchesBlock = block === "ALL" || String(getField(item, "block_id")) === block;
    if (!matchesBlock) return false;

    return true;
  });

  const displayedAdmissions = filteredAdmissions.slice(0, showUpTo);

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <PageWrapper>
      <Container>
        <div style={{ padding: "0 24px" }}>
          <PageHeader>
            <h2><FiActivity color={colors.primary} /> Ward Request Management</h2>
          </PageHeader>

          <Card>
            <FilterGrid>
              <FormGroup>
                <label>Nursing Station</label>
                <Select value={nursingStation} onChange={(e) => setNursingStation(e.target.value)}>
                  <option value="ALL">All Stations</option>
                  {wards.map((ward, i) => <option key={i} value={ward.id}>{ward.ward_name}</option>)}
                </Select>
              </FormGroup>

              <FormGroup>
                <label>Room Category</label>
                <Select value={roomCategory} onChange={(e) => setRoomCategory(e.target.value)}>
                  <option value="ALL">All Categories</option>
                  {roomCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Select>
              </FormGroup>

              <FormGroup>
                <label>Block</label>
                <Select value={block} onChange={(e) => setBlock(e.target.value)}>
                  <option value="ALL">All Blocks</option>
                  {blocks.map((blk, i) => <option key={i} value={blk.id}>{blk.block_name}</option>)}
                </Select>
              </FormGroup>

              <FormGroup>
                <label>From Date</label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </FormGroup>

              <FormGroup>
                <label>To Date</label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </FormGroup>

              <Button primary onClick={fetchAdmissions} disabled={loading} style={{ height: "40px" }}>
                <FiSearch /> {loading ? "Searching..." : "Search"}
              </Button>
            </FilterGrid>
          </Card>

          <Toolbar>
            <SegmentedControl>
              <SegmentButton
                $active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              >
                All Admissions
              </SegmentButton>
              <SegmentButton
                $active={statusFilter === "admitted"}
                $activeColor={colors.primary}
                onClick={() => setStatusFilter("admitted")}
              >
                <span className="dot" /> Admitted
              </SegmentButton>
              <SegmentButton
                $active={statusFilter === "discharged"}
                $activeColor={colors.secondary}
                onClick={() => setStatusFilter("discharged")}
              >
                <span className="dot" /> Discharged
              </SegmentButton>
            </SegmentedControl>

            <div style={{ display: "flex", gap: "12px" }}>
              <SearchBox>
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search by name, UHID or IP No..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </SearchBox>
              <Select
                value={showUpTo}
                onChange={(e) => setShowUpTo(Number(e.target.value))}
                style={{ width: "80px" }}
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </div>
          </Toolbar>

          <Card style={{ padding: 0, overflow: "visible" }}>
            <Table>
              <thead>
                <Tr>
                  <Th>Patient Info</Th>
                  <Th>UHID / IP No</Th>
                  <Th>Admitted On</Th>
                  <Th>Room & Bed</Th>
                  <Th>Doctor</Th>
                  <Th>Status</Th>
                  <Th style={{ textAlign: "center" }}>Actions</Th>
                </Tr>
              </thead>
              <tbody>
                {displayedAdmissions.length === 0 ? (
                  <Tr>
                    <Td colSpan="7" style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted }}>
                      No admissions found matching your criteria.
                    </Td>
                  </Tr>
                ) : (
                  displayedAdmissions.map((item, index) => {
                    const fullName = [
                      getField(item, "salutation"), getField(item, "firstName"),
                      getField(item, "middleName"), getField(item, "lastName")
                    ].filter(Boolean).join(" ");

                    const isDischarged = getField(item, "is_discharged");

                    return (
                      <Tr key={item.id || index}>
                        <Td>
                          <PatientCell>
                            <div className="avatar">{getInitials(fullName)}</div>
                            <div className="info">
                              <strong>{fullName || "Unknown"}</strong>
                              <small>{getField(item, "gender")} • {getField(item, "age") || "-"} yrs</small>
                            </div>
                          </PatientCell>
                        </Td>
                        <Td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontWeight: 500 }}>{getField(item, "uhid") || "-"}</span>
                            <span style={{ fontSize: "0.8rem", color: colors.textMuted }}>{item.ipNumber || "-"}</span>
                          </div>
                        </Td>
                        <Td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
                            <FiClock /> {formatDateTime(getField(item, "admissionDateTime"))}
                          </div>
                        </Td>
                        <Td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <strong style={{ color: colors.textMain }}>{getField(item, "roomNo") || "-"}</strong>
                            <small style={{ color: colors.textMuted }}>Bed: {getField(item, "bedNo") || "-"}</small>
                          </div>
                        </Td>
                        <Td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FiUser color={colors.primary} />
                            {getField(item, "doctorName") || "-"}
                          </div>
                        </Td>
                        <Td>
                          <StatusBadge $isDischarged={isDischarged}>
                            {isDischarged ? "Discharged" : "Admitted"}
                          </StatusBadge>
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <Button 
                            style={{ margin: "0 auto", padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", background: colors.primary + "15", color: colors.primary, border: `1px solid ${colors.primary}30` }}
                            onClick={() => {
                              setSelectedPatient(item);
                              setShowActionModal(true);
                            }}
                          >
                            Add Ward Request
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      </Container>

      {/* ─── Modals ───────────────────────────────────────────────────────────── */}

      {showActionModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowActionModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", padding: "30px" }}>
            <ModalHeader style={{ background: "transparent", borderBottom: "none", padding: "0 0 20px 0" }}>
              <ModalTitle style={{ fontSize: "1.4rem" }}>Select Request Type</ModalTitle>
              <CloseButton onClick={() => setShowActionModal(false)}><FiX /></CloseButton>
            </ModalHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <div 
                style={{ 
                  padding: "24px 16px", background: colors.background, borderRadius: "12px", border: `1px solid ${colors.border}`, textAlign: "center", cursor: "pointer", transition: "all 0.2s" 
                }}
                className="action-card"
                onClick={() => { setShowLabModal(true); setShowActionModal(false); }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <MdOutlineScience size={40} color={colors.primary} style={{ marginBottom: "12px" }} />
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Lab Request</div>
              </div>
              <div 
                style={{ 
                  padding: "24px 16px", background: colors.background, borderRadius: "12px", border: `1px solid ${colors.border}`, textAlign: "center", cursor: "pointer", transition: "all 0.2s" 
                }}
                className="action-card"
                onClick={() => { setShowMedicineModal(true); setShowActionModal(false); }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <MdOutlineMedication size={40} color={colors.primary} style={{ marginBottom: "12px" }} />
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Medicine Request</div>
              </div>
              <div 
                style={{ 
                  padding: "24px 16px", background: colors.background, borderRadius: "12px", border: `1px solid ${colors.border}`, textAlign: "center", cursor: "pointer", transition: "all 0.2s" 
                }}
                className="action-card"
                onClick={() => { setShowRadiologyModal(true); setShowActionModal(false); }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <FiFileText size={40} color={colors.primary} style={{ marginBottom: "12px" }} />
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Radiology Request</div>
              </div>
            </div>
            <div style={{ marginTop: "25px", padding: "15px", borderRadius: "8px", background: colors.primary + "10", display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: colors.primary + "20", color: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {getInitials(selectedPatient.firstName + " " + selectedPatient.lastName)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{selectedPatient.salutation} {selectedPatient.firstName} {selectedPatient.lastName}</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>UHID: {getField(selectedPatient, "uhid")} | IP: {selectedPatient.ipNumber}</div>
              </div>
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showLabModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowLabModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1200px", width: "95%" }}>
            <ModalHeader $bg="#136A63">
              <h3 style={{ color: "#fff" }}>
                <MdOutlineScience size={22} />
                Lab Ward Request
                <span className="subtitle" style={{ color: "rgba(255,255,255,0.8)" }}>| {getField(selectedPatient, "firstName")} {getField(selectedPatient, "lastName")}</span>
              </h3>
              <button onClick={() => setShowLabModal(false)} style={{ color: "#fff" }}><FiX /></button>
            </ModalHeader>
            <div style={{ flex: 1, overflowY: "auto", background: colors.background }}>
              <LabWardRequest patient={selectedPatient} onClose={() => setShowLabModal(false)} />
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showMedicineModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowMedicineModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1200px", width: "95%" }}>
            <ModalHeader $bg="#136A63">
              <h3 style={{ color: "#fff" }}>
                <MdOutlineMedication size={22} />
                Medicine Ward Request
                <span className="subtitle" style={{ color: "rgba(255,255,255,0.8)" }}>| {getField(selectedPatient, "firstName")} {getField(selectedPatient, "lastName")}</span>
              </h3>
              <button onClick={() => setShowMedicineModal(false)} style={{ color: "#fff" }}><FiX /></button>
            </ModalHeader>
            <div style={{ flex: 1, overflowY: "auto", background: colors.background }}>
              <MedicineWardRequest patient={selectedPatient} onClose={() => setShowMedicineModal(false)} />
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showRadiologyModal && selectedPatient && (
        <ModalOverlay onClick={() => setShowRadiologyModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()} style={{ maxWidth: "1200px", width: "95%" }}>
            <ModalHeader $bg="#136A63">
              <h3 style={{ color: "#fff" }}>
                <FiFileText size={22} />
                Radiology Ward Request
                <span className="subtitle" style={{ color: "rgba(255,255,255,0.8)" }}>| {getField(selectedPatient, "firstName")} {getField(selectedPatient, "lastName")}</span>
              </h3>
              <button onClick={() => setShowRadiologyModal(false)} style={{ color: "#fff" }}><FiX /></button>
            </ModalHeader>
            <div style={{ flex: 1, overflowY: "auto", background: colors.background }}>
              <RadiologyWardRequest patient={selectedPatient} onClose={() => setShowRadiologyModal(false)} />
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default WardRequest;
