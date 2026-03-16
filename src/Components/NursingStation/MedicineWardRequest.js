import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

// --- Color Palette matching the screenshot ---
// ─── Color palette (mirrors Radiology/Lab pattern) ──────────────────────
const colors = {
  primary: "#136A63", // Teal for Medicine
  primaryDark: "#0B4C47",
  orange: "#F88C22",
  orangeHover: "#E67D1E",
  yellow: "#FFA000",
  dark: "#37474F",
  border: "#CFD8DC",
  background: "#F5F7F8",
  textMain: "#263238",
  textMuted: "#78909C",
  white: "#FFFFFF",
  rowHighlight: "#E0F2F1",
  headerBg: "#546E7A",
  // Legend Colors
  legPending: "#FFC107",
  legSubstituted: "#B366CC",
  legBilled: "#28A745",
  legCancelled: "#6C757D",
  legStopped: "#FA6680",
  legEmergency: "#DC3545",
  legInsurance: "#007BFF",
  legDischarge: "#48D1CC",
  legRegular: "#136A63"
};

// ─── Styled Components ────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  background: ${colors.background};
  width: 96%;
  max-width: 1500px;
  height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  font-family: 'Inter', -apple-system, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background: ${colors.primary};
  color: white;
  button {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const PatientPanel = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 15px 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px 16px;
  @media (max-width: 1300px) {
    grid-template-columns: repeat(4, 2fr);
  }
`;

const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FieldValue = styled.div`
  background: #F1F5F7;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.85rem;
  color: ${colors.textMain};
  min-height: 32px;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;

const RequestBtn = styled.button`
  background: ${colors.orange};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
  box-shadow: 0 4px 6px rgba(248, 140, 34, 0.2);
  &:hover { background: ${colors.orangeHover}; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

const RequestFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 0;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 25px;
  background: ${colors.white};
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const FormPanel = styled.div`
  padding: 24px;
  border-right: 1px solid ${colors.border};
`;

const SidePanel = styled.div`
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
`;

const SidePanelHeader = styled.div`
  background: #f1f5f7;
  padding: 12px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${colors.dark};
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
`;

const SidePanelContent = styled.div`
  flex: 1;
  padding: 10px 20px;
  max-height: 500px;
  overflow-y: auto;
`;

const SidePanelFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${colors.border};
  background: #f9fbfc;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px 20px;
  margin-bottom: 20px;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMuted};
`;

const StyledInput = styled.input`
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 2px rgba(19, 106, 99, 0.1); }
`;

const StyledSelect = styled.select`
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  width: 100%;
  background-color: white;
  &:focus { outline: none; border-color: ${colors.primary}; }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 0.85rem;
  color: ${colors.textMain};
  margin-bottom: 5px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${colors.textMain};
  cursor: pointer;
  user-select: none;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const AddBtn = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: ${colors.primaryDark}; }
`;

const CancelBtn = styled.button`
  background: ${colors.textMuted};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: 600;
  cursor: pointer;
`;

const TabsBar = styled.div`
  display: flex;
  gap: 15px;
  margin: 30px 0 15px 0;
  border-bottom: 2px solid ${colors.border};
  padding-bottom: 0;
`;

const Tab = styled.div`
  padding: 8px 25px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  color: ${props => props.active ? colors.primary : colors.textMuted};
  border-bottom: 3px solid ${props => props.active ? colors.primary : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.2s;
  &:hover { color: ${colors.primary}; }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  th {
    background: ${colors.headerBg};
    color: white;
    padding: 12px 15px;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 600;
  }
  td {
    padding: 12px 15px;
    font-size: 0.88rem;
    border-bottom: 1px solid #edf2f4;
    color: ${colors.textMain};
  }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: #f8fafb; }
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${props => props.color};
  color: white;
`;

// ─── Searchable Dropdown Helper ───────────────────────────────────────────────

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
`;

const SearchableDropdown = ({ value, onChange, options, placeholder = "Select...", displayKey = "name", valueKey = "id" }) => {
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
      <StyledInput
        type="text"
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
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

const MedicineWardRequest = ({ patient, onClose }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Map incoming patient prop to display fields
  const pd = patient?.patient_details || {};
  const resolvedPatient = {
    ipNo: patient?.ipNumber || pd.ipNumber || "-",
    ipBadge: patient?.ipserial_number || pd.ipserial_number || "",
    uhid: patient?.uhid || pd.uhid || "-",
    name: [
      patient?.salutation ?? pd.salutation,
      patient?.firstName ?? pd.firstName,
      patient?.middleName ?? pd.middleName,
      patient?.lastName ?? pd.lastName,
    ].filter(Boolean).join(" ") || "Unknown Patient",
    address: patient?.address || pd.permanent_address || "-",
    admitting: patient?.admissionDateTime
      ? new Date(patient.admissionDateTime).toLocaleString("en-GB", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
      : "-",
    roomBed: `${patient?.roomNo || "-"} | ${patient?.bedNo || "-"}`,
    customerType: patient?.customerType || pd.customer_type || "-",
    companyName: patient?.companyName || pd.company_code || "-",
  };

  // Data Arrays
  const [requests, setRequests] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [billTypeOptions, setBillTypeOptions] = useState([]);
  
  // UI States
  const [showForm, setShowForm] = useState(false);
  
  // Form Fields
  const [billTypeNo, setBillTypeNo] = useState("");
  const [billtype, setBilltype] = useState(""); 
  const [billTypeName, setBillTypeName] = useState("");
  const [drugType, setDrugType] = useState("Drug");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [doctor, setDoctor] = useState("");
  const [dosage, setDosage] = useState("");
  const [noOfDays, setNoOfDays] = useState("");
  const [qty, setQty] = useState("");
  const [dose, setDose] = useState("");
  const [doseUnit, setDoseUnit] = useState("");
  const [route, setRoute] = useState("");
  const [remark, setRemark] = useState("");
  const [isRegular, setIsRegular] = useState(true);
  const [isDischarge, setIsDischarge] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchDoctors();
    fetchBillTypes();
  }, []);

  const fetchBillTypes = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}bill-types/`, "GET");
      if (res.success) {
        const list = res.data?.billTypes || (Array.isArray(res.data) ? res.data : []);
        setBillTypeOptions(list);
        if (list.length === 1) {
          const opt = list[0];
          setBillTypeNo(opt.billTypeNo);
          setBilltype(opt.bill_type);
          setBillTypeName(opt.bill_name);
        }
      }
    } catch (e) { console.error("Error fetching bill types:", e); }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_medicine_ward_requests/?uhid=${resolvedPatient.uhid}&ipNumber=${resolvedPatient.ipNo}`, "GET");
      if (res.success) setRequests(res.data?.data || []);
    } catch (e) { console.error("Error fetching requests:", e); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      if (res.success) {
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setDoctors(list);
      }
    } catch (e) { console.error("Error fetching doctors:", e); }
  };

  const handleMedicineSearch = async (val) => {
    if (val.length > 2) {
      try {
        const res = await apiRequest(`${HmsBaseUrl}get_oppharmacy_stock/`, "GET");
        // For search results, we manually filter since the endpoint might return full inventory
        const filtered = (res || []).filter(item => 
          item.item_name?.toLowerCase().includes(val.toLowerCase())
        ).map(item => ({ id: item.id, name: item.item_name, price: item.price }));
        setSearchResults(filtered);
      } catch (e) { console.error("Search error", e); }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMedicine = () => {
    if (!selectedDrug) return alert("Select a drug from search.");
    if (!billtype) return alert("Select Medicine Bill Type.");
    if (!dosage) return alert("Enter Dosage.");
    if (!noOfDays) return alert("Enter No.of days.");
    if (!qty) return alert("Enter Quantity.");

    const newMed = {
      ...selectedDrug,
      itemName: selectedDrug.name,
      quantity: Number(qty),
      billType: billtype,
      billTypeNo,
      billTypeName,
      doctor,
      dosage,
      noOfDays,
      dose,
      doseUnit,
      route,
      remark,
      isRegular,
      isDischarge
    };

    setSelectedMedicines([...selectedMedicines, newMed]);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDrug(null);
    setNoOfDays("");
    setQty("");
    setDose("");
    setRoute("");
    setRemark("");
  };

  const handleConfirm = async () => {
    if (selectedMedicines.length === 0) return alert("No medicines added to confirm.");

    const payload = {
      uhid: resolvedPatient.uhid,
      ipNumber: resolvedPatient.ipNo,
      bill_type: billtype,
      billTypeNo,
      billTypeName,
      doctor: doctor || selectedMedicines[0]?.doctor || "General", 
      wardName: resolvedPatient.roomBed.split("|")[0].trim(),
      selectedMedicines: selectedMedicines,
      total_amount: selectedMedicines.reduce((acc, m) => acc + ( (m.price || 0) * m.quantity), 0)
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}save_medicine_ward_request/`, "POST", payload);
      if (res.success) {
        alert("Medication Order Saved!");
        setSelectedMedicines([]);
        setShowForm(false);
        fetchRequests();
      } else {
        alert("Failed to save: " + res.error);
      }
    } catch (e) { console.error(e); }
  };

  const removeSelectedMed = (index) => {
    setSelectedMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status, isDischarge) => {
    if (isDischarge) return colors.legDischarge;
    if (status === "Pending") return colors.legPending;
    if (status === "Cancelled") return colors.legCancelled;
    if (status === "Billed") return colors.legBilled;
    return colors.legRegular; 
  };

  return (
    <div style={{ padding: "20px" }}>
          <PatientPanel>
            <PatientGrid>
              <FieldBox>
                <FieldLabel>IP No</FieldLabel>
                <FieldValue>{resolvedPatient.ipNo} {resolvedPatient.ipBadge && `(${resolvedPatient.ipBadge})`}</FieldValue>
              </FieldBox>
              <FieldBox>
                <FieldLabel>UHID</FieldLabel>
                <FieldValue>{resolvedPatient.uhid}</FieldValue>
              </FieldBox>
              <FieldBox>
                <FieldLabel>Name</FieldLabel>
                <FieldValue>{resolvedPatient.name}</FieldValue>
              </FieldBox>
              <FieldBox>
                <FieldLabel>Address</FieldLabel>
                <FieldValue>{resolvedPatient.address}</FieldValue>
              </FieldBox>
              <FieldBox>
                <FieldLabel>Admitting Date & Time</FieldLabel>
                <FieldValue>{resolvedPatient.admitting}</FieldValue>
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
                <FieldLabel>Company</FieldLabel>
                <FieldValue>{resolvedPatient.companyName}</FieldValue>
              </FieldBox>
            </PatientGrid>
          </PatientPanel>

          <TopActionBar>
            <RequestBtn onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Close Form" : "＋ New Medicine Request"}
            </RequestBtn>
          </TopActionBar>

          {showForm && (
            <RequestFormWrapper>
              <FormPanel>
                <FormGrid>
                  <FormItem>
                    <FormLabel>Medicine Bill Type</FormLabel>
                    <SearchableDropdown
                      value={billTypeNo}
                      onChange={(val) => {
                        const opt = billTypeOptions.find(o => String(o.billTypeNo) === String(val));
                        if(opt) {
                          setBillTypeNo(val);
                          setBilltype(opt.bill_type);
                          setBillTypeName(opt.bill_name);
                        }
                      }}
                      options={billTypeOptions.map(o => ({ id: o.billTypeNo, name: o.bill_name }))}
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Drug Name</FormLabel>
                    <SearchableDropdown
                      value={selectedDrug?.id}
                      onChange={(val) => {
                        const drug = searchResults.find(r => r.id === val);
                        if(drug) setSelectedDrug(drug);
                      }}
                      options={searchResults}
                      placeholder="Search Medicine..."
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <SearchableDropdown
                      value={doctor}
                      onChange={setDoctor}
                      options={doctors.map(d => d.employeeName)}
                    />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <StyledSelect value={dosage} onChange={e => setDosage(e.target.value)}>
                      <option value="">Select Dosage</option>
                      <option value="1-0-0">1-0-0 (Morning)</option>
                      <option value="0-1-0">0-1-0 (Noon)</option>
                      <option value="0-0-1">0-0-1 (Night)</option>
                      <option value="1-0-1">1-0-1 (Morn-Night)</option>
                      <option value="1-1-1">1-1-1 (Thrice)</option>
                    </StyledSelect>
                  </FormItem>

                  <FormItem>
                    <FormLabel>No. of Days</FormLabel>
                    <StyledInput type="number" value={noOfDays} onChange={e => setNoOfDays(e.target.value)} />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <StyledInput type="number" value={qty} onChange={e => setQty(e.target.value)} />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Dose</FormLabel>
                    <StyledInput value={dose} onChange={e => setDose(e.target.value)} />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Dose Unit</FormLabel>
                    <StyledSelect value={doseUnit} onChange={e => setDoseUnit(e.target.value)}>
                      <option value="">Select Unit</option>
                      <option value="mg">mg</option>
                      <option value="ml">ml</option>
                      <option value="tab">Tablet</option>
                      <option value="cap">Capsule</option>
                    </StyledSelect>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <StyledInput value={route} onChange={e => setRoute(e.target.value)} />
                  </FormItem>
                </FormGrid>
                
                <FormItem style={{marginBottom: "20px"}}>
                  <FormLabel>Remark</FormLabel>
                  <StyledInput value={remark} onChange={e => setRemark(e.target.value)} />
                </FormItem>

                <div style={{display: "flex", gap: "30px", marginBottom: "20px"}}>
                  <CheckboxGroup onClick={() => setIsRegular(!isRegular)}>
                    <input type="checkbox" checked={isRegular} readOnly /> Regular Medicine
                  </CheckboxGroup>
                  <CheckboxGroup onClick={() => setIsDischarge(!isDischarge)}>
                    <input type="checkbox" checked={isDischarge} readOnly /> Discharge Medicine
                  </CheckboxGroup>
                </div>

                <ActionButtons>
                  <CancelBtn onClick={resetForm}>✕ Reset</CancelBtn>
                  <AddBtn onClick={handleAddMedicine}>＋ Add Medicine</AddBtn>
                </ActionButtons>
              </FormPanel>

              <SidePanel>
                <SidePanelHeader>Selected Items ({selectedMedicines.length})</SidePanelHeader>
                <SidePanelContent>
                  {selectedMedicines.length === 0 ? (
                    <div style={{textAlign: "center", color: colors.textMuted, marginTop: "40px", fontSize: "0.85rem"}}>
                      No medicines added yet.
                    </div>
                  ) : (
                    selectedMedicines.map((m, idx) => (
                      <div key={idx} style={{padding: "12px 0", borderBottom: "1px solid #F0F0F0", position: "relative"}}>
                        <div style={{fontWeight: "600", fontSize: "0.85rem", color: colors.primary}}>{m.itemName}</div>
                        <div style={{fontSize: "0.75rem", color: colors.textMuted, marginTop: "4px"}}>
                          {m.dosage} | {m.noOfDays} Days | Qty: {m.quantity}
                        </div>
                        <button 
                          onClick={() => removeSelectedMed(idx)}
                          style={{position: "absolute", right: "0", top: "12px", background: "none", border: "none", color: "#e53935", cursor: "pointer"}}
                        >✕</button>
                      </div>
                    ))
                  )}
                </SidePanelContent>
                <SidePanelFooter>
                  <AddBtn style={{width: "100%", padding: "12px"}} onClick={handleConfirm}>Confirm Request</AddBtn>
                </SidePanelFooter>
              </SidePanel>
            </RequestFormWrapper>
          )}

          <TabsBar>
            <Tab active={true}>Request History</Tab>
          </TabsBar>

          <StyledTable>
            <thead>
              <tr>
                <th>Req Date & Time</th>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>No Of Days</th>
                <th>Qty.</th>
                <th>Route</th>
                <th>Doctor</th>
                <th>Bill Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="9" style={{textAlign: "center", padding: "30px", color: colors.textMuted}}>No request history found.</td></tr>
              ) : (
                requests.map((req, i) => (
                  req.medicines?.map((m, j) => (
                    <tr key={`${i}-${j}`}>
                      <td>{new Date(req.created_at || req.reqDate + ' ' + req.reqTime).toLocaleString("en-GB")}</td>
                      <td>{m.itemName || m.name}</td>
                      <td>{m.dosage}</td>
                      <td>{m.noOfDays}</td>
                      <td>{m.quantity}</td>
                      <td>{m.route}</td>
                      <td>{req.doctor || req.doctorName}</td>
                      <td>{req.billTypeName || m.billType}</td>
                      <td>
                        <LegendItem color={getStatusColor(req.status || m.status, m.isDischarge)}>
                          {m.isDischarge ? "Discharge" : (req.status || m.status || "Pending")}
                        </LegendItem>
                      </td>
                    </tr>
                  ))
                ))
              )}
            </tbody>
          </StyledTable>

          <LegendContainer>
            <LegendItem color={colors.legPending}>Pending</LegendItem>
            <LegendItem color={colors.legSubstituted}>Substituted</LegendItem>
            <LegendItem color={colors.legBilled}>Billed</LegendItem>
            <LegendItem color={colors.legCancelled}>Cancelled</LegendItem>
            <LegendItem color={colors.legStopped}>Stopped</LegendItem>
            <LegendItem color={colors.legEmergency}>Emergency</LegendItem>
            <LegendItem color={colors.legInsurance}>Insurance Item</LegendItem>
            <LegendItem color={colors.legDischarge}>Discharge Med</LegendItem>
            <LegendItem color={colors.legRegular}>Regular Med</LegendItem>
          </LegendContainer>
        </div>
  );
};

export default MedicineWardRequest;
