import React, { useState, useEffect, useRef } from "react";
import apiRequest from "../../Auth/apiRequest";
import styled from "styled-components";
import {
  colors,
  PageWrapper,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  Input,
  Select,
  Label,
  InputWrapper,
  Button
} from "../GlobalStyles";

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
  background: ${colors.surface}80;
  backdrop-filter: blur(8px);
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${colors.primary};
  }
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed ${colors.border};
`;

const PatientAvatar = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, ${colors.primary}20, ${colors.primary}40);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  font-size: 1.4rem;
  font-weight: 800;
  border: 1px solid ${colors.primary}30;
`;

const PatientIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: ${colors.textMain};
  }

  .sub-text {
    font-size: 0.85rem;
    color: ${colors.textMuted};
    font-weight: 500;
  }
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 24px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const FieldValue = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.textMain};
`;

const StatusBadge = styled.span`
  display: inline-block;
  background: ${({ status }) =>
    status === "Cancelled"
      ? colors.danger + "20"
      : status === "Result Pending"
        ? colors.secondary + "15"
        : "#136A6315"};
  color: ${({ status }) =>
    status === "Cancelled"
      ? colors.danger
      : status === "Result Pending"
        ? colors.secondary
        : "#136A63"};
  border: 1px solid currentColor;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`;

const SubTable = styled(Table)`
  font-size: 0.82rem;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  overflow: hidden;

  th {
    background: ${colors.background};
    padding: 10px 14px;
    color: ${colors.textMuted};
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
  }

  td {
    padding: 10px 14px;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: ${colors.surface};
  padding: 12px 16px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
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

  const testDropdownRef = useRef(null);
  const packageDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (testDropdownRef.current && !testDropdownRef.current.contains(event.target)) {
        setShowItemDropdown(false);
      }
      if (packageDropdownRef.current && !packageDropdownRef.current.contains(event.target)) {
        setShowPackageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    admittingDr: patient?.admittingDoctor || pd?.admittingDoctor || "-",
    roomBed: `${patient?.roomNo || "-"} | ${patient?.bedNo || "-"}`,
    customerType: patient?.customerType || pd.customer_type || "-",
    wardName: patient?.wardName || "-",
  };

  useEffect(() => {
    if (patient?.admittingDoctor) {
      setDoctor(patient.admittingDoctor);
    }
  }, [patient]);

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
    if (selectedTests.find(t => (item.item_id && t.item_id === item.item_id) || (item.test_id && t.test_id === item.test_id) || t.itemName === item.itemName)) return;
    setSelectedTests(prev => [...prev, { ...item, type: "individual" }]);
  };

  const addPackageToList = async (pkg) => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}package-items/?packageNo=${pkg.packageNo}`, "GET");
      if (res.success) {
        const pkgItems = (res.data?.items || []).map(i => ({ ...i, type: "package", packageName: pkg.packageName }));
        const newTests = [...selectedTests];
        pkgItems.forEach(item => {
          if (!newTests.find(t => (item.item_id && t.item_id === item.item_id) || (item.test_id && t.test_id === item.test_id) || t.itemName === item.itemName)) {
            newTests.push(item);
          }
        });
        setSelectedTests(newTests);
      }
    } catch (e) { console.error(e); }
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
        item_id: t.item_id,
        // billTypeNo: billTypeNo,
        billtype: selectedBT?.bill_type,
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
      <PatientPanel>
        <PatientHeader>
          <PatientAvatar>
            {resolvedPatient.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </PatientAvatar>
          <PatientIdentity>
            <h3>{resolvedPatient.name}</h3>
            <div className="sub-text">
              UHID: {resolvedPatient.uhid} | IP No: {resolvedPatient.ipNo}
            </div>
          </PatientIdentity>
        </PatientHeader>
        <PatientGrid>
          <FieldBox>
            <FieldLabel>Admitting Dr</FieldLabel>
            <FieldValue>{resolvedPatient.admittingDr}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Room | Bed</FieldLabel>
            <FieldValue>{resolvedPatient.roomBed}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Customer Type</FieldLabel>
            <FieldValue>{resolvedPatient.customerType}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Admitting Date</FieldLabel>
            <FieldValue>{resolvedPatient.admitting}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Ward Name</FieldLabel>
            <FieldValue>{resolvedPatient.wardName}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Address</FieldLabel>
            <FieldValue style={{ fontSize: '0.85rem' }}>{resolvedPatient.address}</FieldValue>
          </FieldBox>
        </PatientGrid>
      </PatientPanel>

      <ActionsBar>
        <div />
        <Button onClick={() => { setShowRequestForm(!showRequestForm); if (!showRequestForm) setExpandedRow(null); }}>
          {showRequestForm ? "View History" : "+ New Other Request"}
        </Button>
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
                  <SearchWrapper ref={testDropdownRef}>
                    <FormInput
                      placeholder="Investigations (CT, MRI...)"
                      value={testSearch}
                      onChange={(e) => { setTestSearch(e.target.value); setShowItemDropdown(true); }}
                      onFocus={() => setShowItemDropdown(true)}
                      disabled={!billTypeNo || billTypeNo === "PACK"}
                    />
                    {showItemDropdown && (
                      <DropdownList>
                        {Array.isArray(investigationItems) && investigationItems.filter(i => i.itemName.toLowerCase().includes(testSearch.toLowerCase())).map((item, idx) => (
                          <DropdownItem key={idx} onClick={() => addTestToList(item)}>
                            {item.itemName} - <span style={{ color: colors.primary }}>₹{item.price}</span>
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    )}
                  </SearchWrapper>

                  <SearchWrapper ref={packageDropdownRef}>
                    <FormInput
                      placeholder="Health Packages..."
                      value={packageSearch}
                      onChange={(e) => { setPackageSearch(e.target.value); setShowPackageDropdown(true); }}
                      onFocus={() => setShowPackageDropdown(true)}
                      disabled={billTypeNo !== "PACK"}
                    />
                    {showPackageDropdown && (
                      <DropdownList>
                        {Array.isArray(packages) && packages.filter(p => p.packageName.toLowerCase().includes(packageSearch.toLowerCase())).map((pkg, idx) => (
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: colors.textMain }}>
              Show up to
              <Select value={showUpTo} onChange={(e) => setShowUpTo(Number(e.target.value))} style={{ width: "70px", padding: "4px 8px" }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </Select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
              <Input
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "200px", padding: "6px 12px" }}
              />
            </div>
          </div>

          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th>Status</Th>
                  <Th>Date & Time</Th>
                  <Th>User</Th>
                  <Th>Bill No</Th>
                  <Th>Bill Type</Th>
                  <Th>Ward</Th>
                  <Th>Doctor</Th>
                  <Th style={{ width: "60px" }} />
                </Tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <Tr><Td colSpan="9" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>No investigation history available</Td></Tr>
                ) : (
                  Array.isArray(filteredRequests) && filteredRequests.map((req) => (
                    <React.Fragment key={req.id}>
                      <Tr>
                        <Td><StatusBadge status={req.status}>{req.status}</StatusBadge></Td>
                        <Td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 500 }}>{req.reqDate}</span>
                            <small style={{ color: colors.textMuted }}>{req.reqTime}</small>
                          </div>
                        </Td>
                        <Td>{req.userName}</Td>
                        <Td><strong>{req.billNo}</strong></Td>
                        <Td>{req.billTypeName || '-'}</Td>
                        <Td>{req.wardName}</Td>
                        <Td
                          style={{ cursor: "pointer", color: colors.primary, fontWeight: 600 }}
                          onClick={() => toggleRow(req.id)}
                        >
                          {req.doctorName}
                        </Td>
                        <Td>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              onClick={() => toggleRow(req.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: colors.primary, fontSize: "1.2rem" }}
                            >
                              {expandedRow === req.id ? "▴" : "▾"}
                            </button>
                            {req.status === "Result Pending" && (
                              <button onClick={() => handleCancelRequest(req.id)} style={{ background: "none", border: "none", color: colors.danger, cursor: "pointer", fontSize: "1rem" }} title="Cancel Entire Request">✕</button>
                            )}
                          </div>
                        </Td>
                      </Tr>

                      {expandedRow === req.id && (
                        <ExpandedRow>
                          <ExpandedCell colSpan={9}>
                            <SubTableWrapper>
                              <SubTable>
                                <thead>
                                  <Tr>
                                    <Th>Test Name</Th>
                                    <Th>Type</Th>
                                    <Th>Action</Th>
                                  </Tr>
                                </thead>
                                <tbody>
                                  {req.tests.map((t, idx) => (
                                    <Tr key={idx}>
                                      <Td>{t.name}</Td>
                                      <Td>{t.packageName ? `Package (${t.packageName})` : "Individual"}</Td>
                                      <Td>
                                        {req.status === "Result Pending" && (
                                          <button
                                            onClick={() => handleRemoveIndividualTest(req.id, t)}
                                            style={{ background: "none", border: "none", color: colors.danger, cursor: "pointer" }}
                                          >
                                            ✕ Remove
                                          </button>
                                        )}
                                      </Td>
                                    </Tr>
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
            </Table>
          </TableWrapper>
        </>
      )}
    </PageWrapper>
  );
}
