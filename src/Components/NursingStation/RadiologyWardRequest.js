import React, { useState, useEffect, useRef } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled from "styled-components";
import {
  PageWrapper,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  Input,
  Label,
  InputWrapper,
  colors as globalColors,
} from "../GlobalStyles";

// ─── Color palette (mirrors LabWardRequest/GlobalStyles) ──────────────────────
const colors = {
  primary: "#00897B",
  primaryDark: "#00695C",
  orange: "#F57C00",
  orangeHover: "#E65100",
  yellow: "#FFA000",
  dark: "#37474F",
  border: "#CFD8DC",
  background: "#F5F7F8",
  textMain: "#263238",
  textMuted: "#78909C",
  white: "#FFFFFF",
  rowHighlight: "#E0F2F1",
  headerBg: "#546E7A",
};

// ─── Styled Components ────────────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: ${colors.primaryDark};
  color: white;
  border-radius: 8px 8px 0 0;
  margin: -10px -10px 20px -10px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PatientPanel = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 18px;
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px 16px;
  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FieldValue = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.88rem;
  color: ${colors.textMain};
  min-height: 34px;
  display: flex;
  align-items: center;
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const RequestBtn = styled.button`
  background: ${colors.orange};
  color: ${colors.white};
  border: none;
  border-radius: 5px;
  padding: 8px 18px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: ${colors.orangeHover};
  }
`;

// ─── Table Controls ───────────────────────────────────────────────────────────

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ShowUpTo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: ${colors.textMain};
  select {
    border: 1px solid ${colors.border};
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 0.85rem;
    background: ${colors.white};
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: ${colors.textMain};
  input {
    border: 1px solid ${colors.border};
    border-radius: 4px;
    padding: 5px 12px;
    font-size: 0.85rem;
    width: 200px;
    background: ${colors.white};
    &:focus {
      outline: none;
      border-color: ${colors.primary};
    }
  }
`;

// ─── Table Styling ────────────────────────────────────────────────────────────

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
`;

const StyledTh = styled.th`
  background: ${colors.headerBg};
  color: ${colors.white};
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
`;

const StyledTd = styled.td`
  padding: 10px 14px;
  border-bottom: 1px solid ${colors.border};
  vertical-align: middle;
  color: ${colors.textMain};
`;

const StyledTr = styled.tr`
  background: ${({ highlight }) => (highlight ? colors.rowHighlight : colors.white)};
  &:hover {
    background: #f0f4f4;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  background: ${({ status }) =>
    status === "Cancelled"
      ? "#e53935"
      : status === "Result Pending"
        ? colors.yellow
        : colors.primary};
  color: ${colors.white};
  border-radius: 14px;
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
`;

const ExpandBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.headerBg};
  font-size: 1.2rem;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
  &:hover {
    background: ${colors.border};
  }
`;

// ─── Expand: History Details (SubTable) ───────────────────────────────────────

const ExpandedRow = styled.tr``;

const ExpandedCell = styled.td`
  padding: 0;
  background: #f9fbfc;
  border-bottom: 2px solid ${colors.primary};
`;

const SubTableWrapper = styled.div`
  padding: 15px 25px 20px 65px;
`;

const SubTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const SubTh = styled.th`
  background: #f1f5f7;
  color: ${colors.textMuted};
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid ${colors.border};
`;

const SubTd = styled.td`
  padding: 10px 12px;
  font-size: 0.85rem;
  border-bottom: 1px dotted ${colors.border};
`;

// ─── Form Components (Sidebar Pattern) ────────────────────────────────────────

const RequestFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 0;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  background: ${colors.white};
`;

const FormPanel = styled.div`
  padding: 20px 24px;
  border-right: 1px solid ${colors.border};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin-bottom: 5px;
  display: block;
`;

const FormSelect = styled.select`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 0.88rem;
  background: ${colors.white};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const FormInput = styled.input`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 0.88rem;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const SidePanel = styled.div`
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
  padding: 0;
`;

const SidePanelHeader = styled.div`
  background: #f1f5f7;
  padding: 12px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${colors.dark};
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
`;

const SidePanelContent = styled.div`
  flex: 1;
  padding: 10px 16px;
  max-height: 400px;
  overflow-y: auto;
`;

const SidePanelFooter = styled.div`
  padding: 16px;
  border-top: 1px solid ${colors.border};
  background: #f9fbfc;
`;

const SelectedItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  align-items: center;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: #e53935;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 4px;
  display: flex;
  align-items: center;
`;

const SaveBtn = styled.button`
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

const CancelBtn = styled.button`
  background: ${colors.textMuted};
  color: ${colors.white};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;
  &:hover {
    opacity: 0.9;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 0 0 4px 4px;
`;

const DropdownItem = styled.li`
  padding: 10px 15px;
  font-size: 0.88rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  &:hover {
    background: ${colors.background};
    color: ${colors.primaryDark};
    font-weight: 600;
  }
  &:last-child {
    border-bottom: none;
  }
`;

// ─── Searchable Dropdown Helper ───────────────────────────────────────────────

const SearchableDropdown = ({ value, onChange, options, placeholder = "Select...", displayKey = "name", valueKey = "id", disabled = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const selected = options.find(opt => (typeof opt === 'string' ? opt === value : opt[valueKey] === value));
      if (selected) setSearchTerm(typeof selected === 'string' ? selected : selected[displayKey]);
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  const filtered = options.filter(opt => {
    const txt = typeof opt === 'string' ? opt : opt[displayKey];
    return txt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <SearchWrapper ref={wrapperRef}>
      <FormInput
        type="text"
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {isOpen && filtered.length > 0 && (
        <DropdownList>
          {filtered.map((opt, idx) => (
            <DropdownItem key={idx} onClick={() => {
              const val = typeof opt === 'string' ? opt : opt[valueKey];
              const txt = typeof opt === 'string' ? opt : opt[displayKey];
              onChange(val);
              setSearchTerm(txt);
              setIsOpen(false);
            }}>
              {typeof opt === 'string' ? opt : opt[displayKey]}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RadiologyWardRequest({ patient, onClose }) {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [investigationItems, setInvestigationItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  // Form states
  const [doctor, setDoctor] = useState("");
  const [billTypeNo, setBillTypeNo] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [packageSearch, setPackageSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [showUpTo, setShowUpTo] = useState(10);

  const pd = patient?.patient_details || {};
  const resolvedPatient = {
    ipNo: patient?.ipNumber || pd.ipNumber || "-",
    uhid: patient?.uhid || pd.uhid || "-",
    name: [patient?.salutation ?? pd.salutation, patient?.firstName ?? pd.firstName, patient?.lastName ?? pd.lastName].filter(Boolean).join(" ") || "Unknown Patient",
    address: patient?.address || pd.permanent_address || "-",
    admitting: patient?.admissionDateTime ? new Date(patient.admissionDateTime).toLocaleString("en-GB") : "-",
    roomBed: `${patient?.roomNo || "-"} | ${patient?.bedNo || "-"}`,
    customerType: patient?.customerType || pd.customer_type || "-",
    wardName: patient?.wardName || "-",
  };

  useEffect(() => {
    fetchBillTypes();
    fetchDoctors();
    fetchRequests();
  }, []);

  const fetchBillTypes = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}bill-types/`, "GET");
      if (res.success) setBillTypes(res.data?.billTypes || []);
    } catch (e) { console.error(e); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (res.success) {
        // InvestigationBilling uses a flat array or data.data
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setDoctors(list);
      }
    } catch (e) { console.error("Error fetching doctors:", e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_radiology_ward_requests/?uhid=${resolvedPatient.uhid}&ipNumber=${resolvedPatient.ipNo}`, "GET");
      if (res.success) setRequests(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  const handleBillTypeChange = async (val) => {
    setBillTypeNo(val);
    setSelectedTests([]);
    setTestSearch("");
    setPackageSearch("");

    if (val === "PACK") {
      const res = await apiRequest(`${HmsBaseUrl}packages/`, "GET");
      if (res.success) setPackages(res.data?.packages || []);
      setInvestigationItems([]);
    } else {
      const selectedBT = billTypes.find(bt => bt.billTypeNo === val);
      const bType = selectedBT?.bill_type || "";
      const res = await apiRequest(`${HmsBaseUrl}investigation-items/?billTypeNo=${val}&billType=${bType}`, "GET");
      if (res.success) setInvestigationItems(res.data?.items || []);
      setPackages([]);
    }
  };

  const addTestToList = (item) => {
    if (!item) return;
    if (selectedTests.find(t => t.test_id === item.test_id)) return;
    setSelectedTests([...selectedTests, { ...item, type: "individual" }]);
    setTestSearch("");
    setShowItemDropdown(false);
  };

  const addPackageToList = async (pkg) => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}package-items/?packageNo=${pkg.packageNo}`, "GET");
      if (res.success) {
        const pkgItems = (res.data?.items || []).map(i => ({ ...i, type: "package", packageName: pkg.packageName }));
        const newTests = [...selectedTests];
        pkgItems.forEach(item => {
          if (!newTests.find(t => t.test_id === item.test_id)) newTests.push(item);
        });
        setSelectedTests(newTests);
      }
    } catch (e) { console.error(e); }
    setPackageSearch("");
    setShowPackageDropdown(false);
  };

  const handleSave = async () => {
    if (!doctor || selectedTests.length === 0) {
      alert("Please select doctor and at least one test");
      return;
    }
    const selectedBT = billTypes.find(bt => bt.billTypeNo === billTypeNo);
    const payload = {
      uhid: resolvedPatient.uhid,
      ipNumber: resolvedPatient.ipNo,
      patientName: resolvedPatient.name,
      doctor: doctor,
      billtype: selectedBT?.bill_type,
      billTypeNo: billTypeNo,
      billTypeName: selectedBT?.bill_name,
      selectedTests: selectedTests.map(t => ({
        itemName: t.itemName,
        price: t.price,
        test_id: t.test_id,
        packageName: t.packageName || null,
        type: t.type || "individual"
      })),
      wardName: resolvedPatient.wardName,
      total_amount: selectedTests.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0)
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}save_radiology_ward_request/`, "POST", payload);
      if (res.success) {
        alert("Radiology request saved successfully");
        setShowRequestForm(false);
        setSelectedTests([]);
        fetchRequests();
      }
    } catch (e) { console.error(e); }
  };

  const handleCancelRequest = async (billId) => {
    if (!window.confirm("Are you sure you want to cancel this entire request?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}cancel_radiology_ward_request/`, "POST", { id: billId });
      if (res.success) {
        alert("Request cancelled successfully");
        fetchRequests();
      }
    } catch (e) { console.error(e); }
  };

  const handleRemoveIndividualTest = async (billId, test) => {
    if (!window.confirm(`Are you sure you want to remove ${test.name}?`)) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}remove_individual_radiology/`, "POST", { 
        id: billId, 
        test_id: test.test_id 
      });
      if (res.success) {
        alert("Test removed from request");
        fetchRequests();
      }
    } catch (e) { console.error(e); }
  };

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  const filteredRequests = requests.filter(req => 
    req.wardName.toLowerCase().includes(search.toLowerCase()) || 
    req.doctorName.toLowerCase().includes(search.toLowerCase()) || 
    req.billNo.toLowerCase().includes(search.toLowerCase())
  ).slice(0, showUpTo);

  return (
    <PageWrapper style={{ padding: "10px", minHeight: "600px" }}>
      <Header>
        <Title>Radiology / Other Service Request</Title>
        <SecondaryButton onClick={onClose}>Close</SecondaryButton>
      </Header>

      <PatientPanel>
        <PatientGrid>
          <FieldBox><FieldLabel>UHID</FieldLabel><FieldValue>{resolvedPatient.uhid}</FieldValue></FieldBox>
          <FieldBox><FieldLabel>IP No</FieldLabel><FieldValue>{resolvedPatient.ipNo}</FieldValue></FieldBox>
          <FieldBox><FieldLabel>Patient Name</FieldLabel><FieldValue>{resolvedPatient.name}</FieldValue></FieldBox>
          <FieldBox><FieldLabel>Room | Bed</FieldLabel><FieldValue>{resolvedPatient.roomBed}</FieldValue></FieldBox>
          <FieldBox><FieldLabel>Admitting Date</FieldLabel><FieldValue>{resolvedPatient.admitting}</FieldValue></FieldBox>
          <FieldBox><FieldLabel>Customer Type</FieldLabel><FieldValue>{resolvedPatient.customerType}</FieldValue></FieldBox>
        </PatientGrid>
      </PatientPanel>

      <ActionsBar>
        <div />
        <RequestBtn onClick={() => { setShowRequestForm(!showRequestForm); if(!showRequestForm) setExpandedRow(null); }}>
          {showRequestForm ? "View History" : "+ New Other Request"}
        </RequestBtn>
      </ActionsBar>

      {showRequestForm ? (
        <RequestFormWrapper>
          <FormPanel>
            <FormRow>
              <div>
                <FormLabel>Bill Type</FormLabel>
                <FormSelect value={billTypeNo} onChange={(e) => handleBillTypeChange(e.target.value)}>
                  <option value="">Select Bill Type</option>
                  {billTypes.map(o => <option key={o.billTypeNo} value={o.billTypeNo}>{o.bill_name}</option>)}
                </FormSelect>
              </div>
              <div>
                <FormLabel>Doctor</FormLabel>
                <SearchableDropdown
                  value={doctor}
                  onChange={setDoctor}
                  options={doctors.map(d => ({ id: d.employeeName, name: d.employeeName }))}
                  displayKey="name"
                  valueKey="id"
                  placeholder="Select Doctor"
                />
              </div>
            </FormRow>
            
            <FormRow style={{ gridTemplateColumns: "1fr" }}>
              <div style={{ marginTop: 2 }}>
                <FormLabel>Search Item (Investigations / Packages)</FormLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <SearchWrapper>
                    <FormInput 
                      placeholder="Investigations (CT, MRI...)" 
                      value={testSearch}
                      onChange={(e) => { setTestSearch(e.target.value); setShowItemDropdown(true); }}
                      onFocus={() => setShowItemDropdown(true)}
                      disabled={!billTypeNo || billTypeNo === "PACK"}
                    />
                    {showItemDropdown && testSearch && (
                      <DropdownList>
                        {investigationItems.filter(i => i.itemName.toLowerCase().includes(testSearch.toLowerCase())).map((item, idx) => (
                          <DropdownItem key={idx} onClick={() => addTestToList(item)}>
                            {item.itemName} - <span style={{ color: colors.primary }}>₹{item.price}</span>
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    )}
                  </SearchWrapper>

                  <SearchWrapper>
                    <FormInput 
                      placeholder="Health Packages..." 
                      value={packageSearch}
                      onChange={(e) => { setPackageSearch(e.target.value); setShowPackageDropdown(true); }}
                      onFocus={() => setShowPackageDropdown(true)}
                      disabled={billTypeNo !== "PACK"}
                    />
                    {showPackageDropdown && packageSearch && (
                      <DropdownList>
                        {packages.filter(p => p.packageName.toLowerCase().includes(packageSearch.toLowerCase())).map((pkg, idx) => (
                          <DropdownItem key={idx} onClick={() => addPackageToList(pkg)}>
                            {pkg.packageName}
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    )}
                  </SearchWrapper>
                </div>
              </div>
            </FormRow>
            {!billTypeNo && (
              <div style={{ marginTop: "20px", padding: "15px", background: "#FFF3E0", color: "#E65100", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 500 }}>
                💡 Select a Bill Type to begin searching for investigations or packages.
              </div>
            )}
          </FormPanel>

          <SidePanel>
            <SidePanelHeader>
              <span>Selected Items</span>
              <span>Cost</span>
              <span></span>
            </SidePanelHeader>
            <SidePanelContent>
              {selectedTests.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: colors.textMuted }}>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📋</div>
                  No items selected
                </div>
              ) : (
                selectedTests.map((t, idx) => (
                  <SelectedItem key={idx}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t.itemName}</span>
                      {t.type === "package" && <small style={{ color: colors.primary }}>Pkg: {t.packageName}</small>}
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>₹{parseFloat(t.price).toFixed(2)}</span>
                    <RemoveBtn onClick={() => setSelectedTests(selectedTests.filter((_, i) => i !== idx))}>✕</RemoveBtn>
                  </SelectedItem>
                ))
              )}
            </SidePanelContent>
            <SidePanelFooter>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderTop: "1px solid #ccc", paddingTop: "12px" }}>
                <strong style={{ color: colors.dark }}>Total Amount:</strong>
                <strong style={{ color: colors.primaryDark, fontSize: "1.05rem" }}>
                  ₹{selectedTests.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0).toFixed(2)}
                </strong>
              </div>
              <SaveBtn onClick={handleSave}>💾 Save Request</SaveBtn>
              <CancelBtn onClick={() => setShowRequestForm(false)}>✕ Cancel</CancelBtn>
            </SidePanelFooter>
          </SidePanel>
        </RequestFormWrapper>
      ) : (
        <>
          <TableControls>
            <ShowUpTo>
              Show up to
              <select value={showUpTo} onChange={(e) => setShowUpTo(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </ShowUpTo>
            <SearchBox>
              Search:
              <input placeholder="Search History..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </SearchBox>
          </TableControls>

          <TableWrapper>
            <StyledTable>
              <thead>
                <Tr>
                  <StyledTh>Status</StyledTh>
                  <StyledTh>Req Date</StyledTh>
                  <StyledTh>Req Time</StyledTh>
                  <StyledTh>User</StyledTh>
                  <StyledTh>Bill No</StyledTh>
                  <StyledTh>Bill Type</StyledTh>
                  <StyledTh>Ward</StyledTh>
                  <StyledTh>Doctor</StyledTh>
                  <StyledTh style={{ width: 60 }} />
                </Tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <Tr><Td colSpan="9" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>No investigation history available</Td></Tr>
                ) : (
                  filteredRequests.map((req) => (
                    <React.Fragment key={req.id}>
                      <StyledTr highlight={req.id % 2 === 1}>
                        <StyledTd><StatusBadge status={req.status}>{req.status}</StatusBadge></StyledTd>
                        <StyledTd>{req.reqDate}</StyledTd>
                        <StyledTd>{req.reqTime}</StyledTd>
                        <StyledTd>{req.userName}</StyledTd>
                        <StyledTd><strong>{req.billNo}</strong></StyledTd>
                        <StyledTd>{req.billTypeName || '-'}</StyledTd>
                        <StyledTd>{req.wardName}</StyledTd>
                        <StyledTd 
                          style={{ cursor: "pointer", color: colors.primary, fontWeight: 600 }}
                          onClick={() => toggleRow(req.id)}
                        >
                          {req.doctorName}
                        </StyledTd>
                        <StyledTd>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <ExpandBtn onClick={() => toggleRow(req.id)}>
                              {expandedRow === req.id ? "⌃" : "⌄"}
                            </ExpandBtn>
                            {req.status === "Result Pending" && (
                              <button onClick={() => handleCancelRequest(req.id)} style={{ background: "none", border: "none", color: "#e53935", cursor: "pointer", fontSize: "1rem" }} title="Cancel Entire Request">✕</button>
                            )}
                          </div>
                        </StyledTd>
                      </StyledTr>

                      {expandedRow === req.id && (
                        <ExpandedRow>
                          <ExpandedCell colSpan={9}>
                            <SubTableWrapper>
                              <SubTable>
                                <thead>
                                  <tr>
                                    <SubTh>Test Name</SubTh>
                                    <SubTh>Type</SubTh>
                                    <SubTh>Action</SubTh>
                                  </tr>
                                </thead>
                                <tbody>
                                  {req.tests.map((t, idx) => (
                                    <tr key={idx}>
                                      <SubTd>{t.name}</SubTd>
                                      <SubTd>{t.packageName ? `Package (${t.packageName})` : "Individual"}</SubTd>
                                      <SubTd>
                                        {req.status === "Result Pending" && (
                                          <button onClick={() => handleRemoveIndividualTest(req.id, t)} style={{ background: "none", border: "none", color: "#e53935", cursor: "pointer" }}>✕ Remove</button>
                                        )}
                                      </SubTd>
                                    </tr>
                                  ))}
                                </tbody>
                              </SubTable>
                            </SubTableWrapper>
                          </ExpandedCell>
                        </ExpandedRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </StyledTable>
          </TableWrapper>
        </>
      )}
    </PageWrapper>
  );
}
