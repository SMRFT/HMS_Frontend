import React, { useState, useEffect } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

// --- Color Palette matching the screenshot ---
const colors = {
  headerTeal: "#136A63", // Dark teal for main header
  buttonTeal: "#187771", // Teal for Add Medicine button
  buttonOrange: "#F88C22", // Orange for New Request button
  buttonGrey: "#5A6268", // Grey for Cancel
  bgLightGrey: "#EEEEEE", // Background for patient info
  bgWhite: "#FFFFFF",
  borderLight: "#DDDDDD",
  textDark: "#333333",
  textMuted: "#666666",
  textRed: "#DC3545", // For asterisks
  // Legends
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${colors.bgWhite};
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  font-family: Arial, sans-serif;
`;

const ModalHeader = styled.div`
  background: ${colors.headerTeal};
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: bold;

  button {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
  }
`;

const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 15px;
  background: #F8F9FA;
`;

const PatientInfoBar = styled.div`
  background: ${colors.bgLightGrey};
  border: 1px solid ${colors.borderLight};
  border-radius: 4px;
  padding: 10px 15px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  label {
    font-size: 0.75rem;
    color: ${colors.textDark};
    font-weight: bold;
  }
  
  div.value-box {
    background: #E2E2E2;
    padding: 6px 10px;
    font-size: 0.85rem;
    color: ${colors.textDark};
    border-radius: 2px;
    min-height: 28px;
    display: flex;
    align-items: center;
  }
  
  .flex-row {
    display: flex;
    gap: 5px;
  }
  .flex-row .value-box { flex: 1; }
  .flex-row .small-box { flex: 0 0 40px; justify-content: center;}
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
  border-top: 1px solid ${colors.borderLight};
  border-bottom: 2px solid #E0E0E0;
  margin-bottom: 10px;
`;

const OrangeBtn = styled.button`
  background: ${colors.buttonOrange};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  &:hover { background: #E67D1E; }
`;

const FormSection = styled.div`
  background: ${colors.bgWhite};
  border: 1px solid ${colors.borderLight};
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
`;

const FormGridRow1 = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 3fr 2fr 1.5fr 0.8fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 15px;
  align-items: end;
`;

const FormGridRow2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 3fr auto auto auto;
  gap: 12px;
  align-items: end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  
  label {
    font-size: 0.75rem;
    font-weight: bold;
    color: ${colors.textDark};
  }
  .req { color: ${colors.textRed}; }
  
  .radio-group {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.75rem;
    position: absolute;
    top: -20px;
    right: 0;
  }
  .radio-group input { margin-right: 3px; }
  
  .search-wrapper { display: flex; }
  .search-wrapper input { border-radius: 3px 0 0 3px; flex: 1; }
  .search-wrapper button { 
    background: #11625B; color: white; border: none; 
    border-radius: 0 3px 3px 0; width: 32px; cursor: pointer;
  }

  .add-wrapper { display: flex; gap: 5px; }
  .add-wrapper select { flex: 1; }
  .add-wrapper button { border: 1px solid #CCC; background: #F8F9FA; padding: 0 8px; border-radius: 3px; cursor: pointer; }
`;

const StyledInput = styled.input`
  border: 1px solid #CCCCCC;
  padding: 6px 10px;
  border-radius: 3px;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${colors.headerTeal}; }
`;

const StyledSelect = styled.select`
  border: 1px solid #CCCCCC;
  padding: 6px 10px;
  border-radius: 3px;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  &:focus { outline: none; border-color: ${colors.headerTeal}; }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: bold;
  color: ${colors.textMuted};
  height: 30px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  height: 30px;
  
  button {
    border: none;
    border-radius: 3px;
    color: white;
    font-size: 0.85rem;
    padding: 0 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .cancel-btn { background: ${colors.buttonGrey}; }
  .add-btn { background: ${colors.headerTeal}; }
`;

const TabsBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  
  .tab {
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
    cursor: pointer;
  }
  .active-discharge { background: ${colors.legDischarge}; color: white; border: 1px solid ${colors.legDischarge}; }
  .active-regular { background: ${colors.legRegular}; color: white; border: 1px solid ${colors.legRegular}; }
`;

const GridTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid ${colors.borderLight};
  margin-bottom: 10px;
  
  th {
    background: #F8F9FA;
    padding: 8px 10px;
    text-align: left;
    font-size: 0.75rem;
    color: ${colors.textDark};
    border-bottom: 2px solid ${colors.borderLight};
    white-space: nowrap;
  }
  
  td {
    padding: 8px 10px;
    font-size: 0.85rem;
    border-bottom: 1px solid ${colors.borderLight};
    color: ${colors.textDark};
  }
  
  .empty-row td {
    text-align: center;
    color: ${colors.textMuted};
    padding: 15px;
  }
`;

const InfoText = styled.div`
  font-size: 0.8rem;
  color: ${colors.textMuted};
  margin-bottom: 10px;
`;

const ConfirmBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  border-bottom: 2px solid ${colors.borderLight};
  padding-bottom: 15px;
  
  button {
    background: #6C9F9A;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 7px 20px;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    &:hover { background: ${colors.headerTeal}; }
  }
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  background: ${props => props.color};
`;

const SearchDropdown = styled.div`
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: white;
  border: 1px solid ${colors.borderLight};
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  .item {
    padding: 8px 10px;
    font-size: 0.85rem;
    cursor: pointer;
    border-bottom: 1px solid #EEE;
    &:hover { background: #F5F5F5; }
  }
`;

const MedicineWardRequest = ({ patient, onClose }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Map incoming patient prop to display fields (matching LabWardRequest patterns)
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
  const [billtype, setBilltype] = useState(""); 
  const [billTypeNo, setBillTypeNo] = useState("");
  const [billTypeName, setBillTypeName] = useState("");
  const [drugType, setDrugType] = useState("Drug");
  const [drugSearch, setDrugSearch] = useState("");
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
      const res = await apiRequest(`${HmsBaseUrl}get_LabBillType_list/`, "GET");
      if (res.success) {
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
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
      if (res.success) setDoctors(res.data || []);
    } catch (e) { console.error("Error fetching doctors:", e); }
  };

  const searchMedicine = async (term) => {
    setDrugSearch(term);
    setSelectedDrug(null);
    if (term.length > 2) {
      try {
        const res = await apiRequest(`${HmsBaseUrl}get_oppharmacy_stock/`, "GET");
        const filtered = (res || []).filter(item => 
          item.item_name?.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (e) { console.error("Search error", e); }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectMedicine = (med) => {
    setSelectedDrug(med);
    setDrugSearch(med.item_name);
    setSearchResults([]);
  };

  const handleAddMedicine = () => {
    if (!selectedDrug) return alert("Select a drug from search.");
    if (!billtype) return alert("Select Medicine Bill Type.");
    if (!dosage) return alert("Enter Dosage.");
    if (!noOfDays) return alert("Enter No.of days.");
    if (!qty) return alert("Enter Quantity.");

    const newMed = {
      ...selectedDrug,
      itemName: selectedDrug.item_name,
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
    setDrugSearch("");
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
      total_amount: selectedMedicines.reduce((acc, m) => acc + (m.price * m.quantity), 0)
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

  const cancelMedicineDraft = (index) => {
    const updated = [...selectedMedicines];
    updated.splice(index, 1);
    setSelectedMedicines(updated);
  };

  // Helper to get status color
  const getStatusColor = (status, isDischarge) => {
    if (isDischarge) return colors.legDischarge;
    if (status === "Pending") return colors.legPending;
    if (status === "Cancelled") return colors.legCancelled;
    if (status === "Billed") return colors.legBilled;
    // ... map others as needed
    return colors.legRegular; 
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          Medication Order
          <button onClick={onClose}>×</button>
        </ModalHeader>

        <ContentBody>
          {/* Top Info Grid */}
          <PatientInfoBar>
            <InfoGroup>
              <label>IP No</label>
              <div className="flex-row">
                <div className="value-box">{resolvedPatient.ipNo}</div>
                <div className="value-box small-box">{resolvedPatient.ipBadge}</div> 
              </div>
            </InfoGroup>
            <InfoGroup>
              <label>UHID</label>
              <div className="value-box">{resolvedPatient.uhid}</div>
            </InfoGroup>
            <InfoGroup>
              <label>Name</label>
              <div className="value-box">{resolvedPatient.name}</div>
            </InfoGroup>
            <InfoGroup>
              <label>Address</label>
              <div className="value-box">{resolvedPatient.address}</div>
            </InfoGroup>
            <InfoGroup>
              <label>Admitting Date & Time</label>
              <div className="value-box">{resolvedPatient.admitting}</div>
            </InfoGroup>
            <InfoGroup>
              <label>Room No | Bed</label>
              <div className="value-box">{resolvedPatient.roomBed}</div>
            </InfoGroup>
            <InfoGroup>
              <label>Customer Type</label>
              <div className="value-box">{resolvedPatient.customerType}</div>
            </InfoGroup>
            <InfoGroup>
              <label>Company Name</label>
              <div className="value-box">{resolvedPatient.companyName}</div>
            </InfoGroup>
          </PatientInfoBar>

          <TopActionBar>
            <OrangeBtn onClick={() => setShowForm(!showForm)}>
              {showForm ? "- Close Form" : "− New Medicine Request"}
            </OrangeBtn>
          </TopActionBar>

          {/* Form Area */}
          {showForm && (
            <FormSection>
              <FormGridRow1>
                <FormGroup>
                  <label>Medicine Bill Type <span className="req">*</span></label>
                  <StyledSelect 
                    value={billTypeNo && billtype ? `${billTypeNo}|${billtype}` : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setBillTypeNo("");
                        setBilltype("");
                        setBillTypeName("");
                        return;
                      }
                      const [no, type] = val.split("|");
                      setBillTypeNo(no);
                      setBilltype(type);
                      setBillTypeName(billTypeOptions.find(opt => opt.billTypeNo === no && String(opt.bill_type) === type)?.bill_name || "");
                    }}
                  >
                    <option value="">Select Bill Type</option>
                    {billTypeOptions.map((opt) => (
                      <option key={opt.billTypeNo} value={`${opt.billTypeNo}|${opt.bill_type}`}>
                        {opt.bill_name}
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>

                <FormGroup>
                  <div className="radio-group">
                    <input type="radio" checked={drugType === "Drug"} onChange={() => setDrugType("Drug")} /> Drug
                    <input type="radio" checked={drugType === "Chemical"} onChange={() => setDrugType("Chemical")} /> Chemical
                  </div>
                  <label>Drug Name <span className="req">*</span></label>
                  <div className="search-wrapper">
                    <StyledInput value={drugSearch} onChange={e => searchMedicine(e.target.value)} />
                    <button>🔍</button>
                  </div>
                  {searchResults.length > 0 && (
                    <SearchDropdown>
                      {searchResults.map((m, i) => (
                        <div key={i} className="item" onClick={() => handleSelectMedicine(m)}>
                          {m.item_name}
                        </div>
                      ))}
                    </SearchDropdown>
                  )}
                </FormGroup>

                <FormGroup>
                  <label>Doctor <span className="req">*</span></label>
                  <StyledSelect value={doctor} onChange={e => setDoctor(e.target.value)}>
                    <option value="">Select Doctor</option>
                    {doctors.map((dr, idx) => (
                      <option key={idx} value={dr.employeeName}>
                        {dr.employeeName}
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>

                <FormGroup>
                  <label>Dosage <span className="req">*</span></label>
                  <div className="add-wrapper">
                    <StyledSelect value={dosage} onChange={e => setDosage(e.target.value)}>
                      <option value=""></option>
                      <option value="1-0-1">1-0-1</option>
                      <option value="1-1-1">1-1-1</option>
                      <option value="0-0-1">0-0-1</option>
                    </StyledSelect>
                    <button>+</button>
                  </div>
                </FormGroup>

                <FormGroup>
                  <label>No.of days <span className="req">*</span></label>
                  <StyledInput type="number" value={noOfDays} onChange={e => setNoOfDays(e.target.value)} />
                </FormGroup>

                <FormGroup>
                  <label>Quantity <span className="req">*</span></label>
                  <StyledInput type="number" value={qty} onChange={e => setQty(e.target.value)} />
                </FormGroup>

                <FormGroup>
                  <label>Dose</label>
                  <StyledInput value={dose} onChange={e => setDose(e.target.value)} />
                </FormGroup>
              </FormGridRow1>

              <FormGridRow2>
                <FormGroup>
                  <label>Dose Unit</label>
                  <StyledSelect value={doseUnit} onChange={e => setDoseUnit(e.target.value)}>
                    <option value=""></option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                  </StyledSelect>
                </FormGroup>

                <FormGroup>
                  <label>Route</label>
                  <StyledInput value={route} onChange={e => setRoute(e.target.value)} />
                </FormGroup>

                <FormGroup>
                  <label>Remark</label>
                  <StyledInput value={remark} onChange={e => setRemark(e.target.value)} />
                </FormGroup>

                <CheckboxGroup>
                  <input type="checkbox" checked={isRegular} onChange={e => setIsRegular(e.target.checked)} /> Regular Medicine
                </CheckboxGroup>

                <CheckboxGroup>
                  <input type="checkbox" checked={isDischarge} onChange={e => setIsDischarge(e.target.checked)} /> Discharge Medicine
                </CheckboxGroup>

                <ActionButtons>
                  <button className="cancel-btn" onClick={resetForm}>✕ Cancel</button>
                  <button className="add-btn" onClick={handleAddMedicine}>+ Add Medicine</button>
                </ActionButtons>
              </FormGridRow2>
            </FormSection>
          )}

          {/* Drafts Section */}
          <TabsBar>
            <div className="tab active-discharge">Discharge Med</div>
            <div className="tab active-regular">Regular Med</div>
          </TabsBar>

          <GridTable>
            <thead>
              <tr>
                <th>Req Date & Time</th><th>Medicine Name</th><th>Info</th><th>Dosage</th><th>Dose</th>
                <th>No Of Days</th><th>Qty.</th><th>Route</th><th>Remark</th><th>Doctor</th>
                <th>Ordered By</th><th>Bill Name</th><th>Wardname</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedMedicines.length === 0 ? (
                <tr className="empty-row"><td colSpan="14">No data available in table</td></tr>
              ) : (
                selectedMedicines.map((m, i) => (
                  <tr key={i}>
                    <td>-</td>
                    <td>{m.itemName}</td>
                    <td>-</td>
                    <td>{m.dosage}</td>
                    <td>{m.dose} {m.doseUnit}</td>
                    <td>{m.noOfDays}</td>
                    <td>{m.quantity}</td>
                    <td>{m.route}</td>
                    <td>{m.remark}</td>
                    <td>{m.doctor}</td>
                    <td>-</td>
                    <td>{m.billType}</td>
                    <td>{patient.roomNo}</td>
                    <td>
                      <button onClick={() => cancelMedicineDraft(i)} style={{background:"none", border:"none", color:"red", cursor:"pointer"}}>✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </GridTable>

          <InfoText>Showing 0 to 0 of 0 entries</InfoText>
          
          <ConfirmBar>
            <button onClick={handleConfirm}>✓ Confirm</button>
          </ConfirmBar>

          {/* Legends */}
          <LegendContainer>
            <LegendItem color={colors.legPending}>■ Pending</LegendItem>
            <LegendItem color={colors.legSubstituted}>■ Substituted</LegendItem>
            <LegendItem color={colors.legBilled}>■ Billed</LegendItem>
            <LegendItem color={colors.legCancelled}>■ Cancelled</LegendItem>
            <LegendItem color={colors.legStopped}>■ Stopped</LegendItem>
            <LegendItem color={colors.legEmergency} style={{marginLeft: 'auto'}}>■ Emergency</LegendItem>
            <LegendItem color={colors.legInsurance}>■ Insurance Item</LegendItem>
            <LegendItem color={colors.legDischarge}>■ Discharge Med</LegendItem>
            <LegendItem color={colors.legRegular}>■ Regular Med</LegendItem>
          </LegendContainer>

          {/* History Section */}
          <GridTable>
            <thead>
              <tr>
                <th>Status</th><th>Req Date & Time</th><th>Medicine Name</th><th>Substitute</th>
                <th>Dosage</th><th>Dose</th><th>No Of Days</th><th>Qty.</th><th>Route</th>
                <th>Remark</th><th>Doctor</th><th>Ordered By</th><th>Bill Name</th><th>Wardname</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr className="empty-row"><td colSpan="15">No historical requests found</td></tr>
              ) : (
                requests.map(req => 
                  req.medicines.map((m, mIdx) => (
                    <tr key={`${req.id}-${mIdx}`}>
                      <td>
                        <div style={{
                          background: getStatusColor(req.status, m.isDischarge),
                          color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', textAlign: 'center'
                        }}>
                          {req.status}
                        </div>
                      </td>
                      <td>{req.reqDate} {req.reqTime}</td>
                      <td>{m.name}</td>
                      <td>-</td>
                      <td>{m.dosage}</td>
                      <td>{m.dose} {m.doseUnit}</td>
                      <td>{m.noOfDays}</td>
                      <td>{m.quantity}</td>
                      <td>{m.route}</td>
                      <td>{m.remark}</td>
                      <td>{m.doctor || req.doctorName}</td>
                      <td>{req.userName}</td>
                      <td>{m.billType}</td>
                      <td>{req.wardName}</td>
                      <td>-</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </GridTable>

        </ContentBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default MedicineWardRequest;
