import React, { useState, useEffect } from "react";
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

// ─── Patient Info Panel ───────────────────────────────────────────────────────
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

// ─── Legend & Actions bar ─────────────────────────────────────────────────────
const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  background: ${({ status }) =>
    status === "Result Pending"
      ? colors.secondary + "15"
      : status === "Result Entered"
        ? "#136A6315"
        : colors.textMuted + "10"};
  color: ${({ status }) =>
    status === "Result Pending"
      ? colors.secondary
      : status === "Result Entered"
        ? "#136A63"
        : colors.textMuted};
  border: 1px solid currentColor;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`;

const IPBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #136A63;
  color: white;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  margin-left: 8px;
`;

const LegendGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const LegendBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${colors.textMain};
  padding: 4px 10px;
  background: ${({ bg }) => bg + "15"};
  border-radius: 4px;
`;

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 16px 24px;
  background: ${colors.surface}80;
  backdrop-filter: blur(4px);
  border-radius: 12px;
  border: 1px solid ${colors.border};
  font-size: 0.85rem;
  color: ${colors.textMuted};
`;

const PaginationBtns = styled.div`
  display: flex;
  gap: 8px;
`;

const PageBtn = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid ${(props) => (props.$active ? colors.primary : colors.border)};
  background: ${(props) => (props.$active ? colors.primary : "transparent")};
  color: ${(props) => (props.$active ? "white" : colors.textMain)};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    border-color: ${colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${colors.primary}20;
    background: ${(props) => (props.$active ? colors.primaryDark : colors.primary + "10")};
  }
`;

const SubTableWrapper = styled.div`
  padding: 16px 24px;
  background: ${colors.background};
`;

const SubTableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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

// ─── Expand: Request Form ─────────────────────────────────────────────────────
const ExpandedRow = styled.tr``;

const ExpandedCell = styled.td`
  padding: 0;
  background: #f9fbfc;
  border-bottom: 2px solid ${colors.primary};
`;

const RequestFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
  padding: 0;
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

const FormRowSingle = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 0;
`;

const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin-bottom: 5px;
  display: block;
  span.required {
    color: #e53935;
    margin-left: 2px;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 0.88rem;
  background: ${colors.white};
  color: ${colors.textMain};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const FormInput = styled.input`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: 4px 0 0 4px;
  padding: 7px 10px;
  font-size: 0.88rem;
  background: ${colors.white};
  color: ${colors.textMain};
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const SearchIconBtn = styled.button`
  background: ${colors.dark};
  color: ${colors.white};
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 7px 12px;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background: ${colors.textMain};
  }
`;

const RateBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  overflow: hidden;
  background: ${colors.white};
`;

const RatePrefix = styled.span`
  background: ${colors.background};
  padding: 7px 10px;
  font-size: 0.9rem;
  color: ${colors.textMuted};
  border-right: 1px solid ${colors.border};
`;

const RateInput = styled.input`
  border: none;
  padding: 7px 10px;
  font-size: 0.88rem;
  width: 100%;
  background: ${colors.background};
  &:focus {
    outline: none;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  color: ${colors.textMain};
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: ${colors.primary};
    cursor: pointer;
  }
`;

const AddButton = styled.button`
  background: ${colors.orange};
  color: ${colors.white};
  border: none;
  border-radius: 5px;
  padding: 7px 18px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: ${colors.orangeHover};
  }
`;

// ─── Side panel: Test Name / Item Cost ───────────────────────────────────────
const SidePanel = styled.div`
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
`;

const SidePanelHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${colors.textMain};
  padding-bottom: 10px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 10px;
`;

const SidePanelActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
`;

const SaveBtn = styled.button`
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

const CancelBtn = styled.button`
  background: ${colors.dark};
  color: ${colors.white};
  border: none;
  border-radius: 4px;
  padding: 8px 14px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: ${colors.textMain};
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LabWardRequest({ patient: patientProp, onClose }) {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Map incoming patient prop (from WardRequest row) to display fields
  const pd = patientProp?.patient_details || {};
  const resolvedPatient = {
    ipNo: patientProp?.ipNumber || pd.ipNumber || "-",
    ipBadge: patientProp?.ipserial_number || pd.ipserial_number || "",
    uhid: patientProp?.uhid || pd.uhid || "-",
    name: [
      patientProp?.salutation ?? pd.salutation,
      patientProp?.firstName ?? pd.firstName,
      patientProp?.middleName ?? pd.middleName,
      patientProp?.lastName ?? pd.lastName,
    ].filter(Boolean).join(" ") || "Unknown Patient",
    address: patientProp?.address || pd.permanent_address || "-",
    admitting: patientProp?.admissionDateTime
      ? new Date(patientProp.admissionDateTime).toLocaleString("en-GB", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
      : "-",
    admittingDr: patientProp?.admittingDoctor || pd?.admittingDoctor || "-",
    roomBed: `${patientProp?.roomNo || "-"} | ${patientProp?.bedNo || "-"}`,
    customerType: patientProp?.customerType || pd.customer_type || "-",
    companyName: patientProp?.companyName || pd.company_code || "-",
  };

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState("");
  const [showUpTo, setShowUpTo] = useState("10");
  const [requests, setRequests] = useState([]);

  // Request form state
  const [doctor, setDoctor] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [billtype, setBilltype] = useState(""); // bill_type ID (e.g. 16)
  const [billTypeNo, setBillTypeNo] = useState(""); // billTypeNo (e.g. LAB01)
  const [billTypeName, setBillTypeName] = useState("");
  const [testName, setTestName] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [rate, setRate] = useState("0.00");
  const [pkg, setPkg] = useState("ALL");

  const [investigationItems, setInvestigationItems] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [billTypeOptions, setBillTypeOptions] = useState([]);

  useEffect(() => {
    if (patientProp?.admittingDoctor) {
      setDoctor(patientProp.admittingDoctor);
    }
  }, [patientProp]);

  useEffect(() => {
    console.log("LabWardRequest mounted for patient:", resolvedPatient.uhid);
    fetchBillTypes();
    fetchDoctors();
    fetchLabRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount for this patient modal instance

  const fetchBillTypes = async () => {
    try {
      console.log("Fetching lab bill types...");
      const res = await apiRequest(`${HmsBaseUrl}get_LabBillType_list/`, "GET");
      console.log("Lab bill types response:", res);
      if (res.success) {
        // Backend returns { success: true, data: [...] }
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setBillTypeOptions(list);

        // Auto-select if exactly one option
        if (list.length === 1) {
          const opt = list[0];
          setBillTypeNo(opt.billTypeNo);
          setBilltype(opt.bill_type);
          setBillTypeName(opt.bill_name);
        }
      } else {
        console.error("Failed to fetch bill types:", res.error);
      }
    } catch (error) {
      console.error("Error fetching bill types:", error);
    }
  };

  // Automatically fetch investigation items when bill type or test name changes
  useEffect(() => {
    if (billTypeNo && billtype) {
      const timer = setTimeout(() => {
        fetchInvestigationItems();
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    }
  }, [billTypeNo, billtype, testName]);

  const fetchDoctors = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}doctor_list_diagnostics/`, "GET");
      console.log("Doctors list response:", response);
      if (response.success) {
        // Backend returns list directly: [...]
        const list = Array.isArray(response.data) ? response.data : [];
        setDoctors(list);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error.message);
    }
  };


  const fetchLabRequests = async () => {
    const uhid = resolvedPatient.uhid;
    const ipNo = resolvedPatient.ipNo;
    if (!uhid || uhid === "-" || !ipNo || ipNo === "-") {
      console.warn("Skipping fetchLabRequests due to missing identifiers:", { uhid, ipNo });
      return;
    }
    try {
      console.log(`Fetching lab requests for UHID: ${uhid}, IP: ${ipNo}`);
      const res = await apiRequest(
        `${HmsBaseUrl}get_lab_ward_requests/?uhid=${uhid}&ipNumber=${ipNo}`,
        "GET"
      );
      console.log("Lab requests response:", res);

      if (res.success) {
        const list = res.data?.data || res.data || [];
        setRequests(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error("Lab Request API Error", error);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.wardName.toLowerCase().includes(search.toLowerCase()) ||
      r.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  const fetchInvestigationItems = async () => {
    if (!billTypeNo || !billtype) {
      alert("Please select a Bill Type first.");
      return;
    }
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}investigation-items/?billTypeNo=${billTypeNo}&billType=${billtype}&itemName=${testName}`,
        "GET"
      );
      if (res.success) {
        // Backend returns { items: [...] } or { data: [...] }
        const list = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setInvestigationItems(list);
      }
    } catch (error) {
      console.error("Investigation Items API Error", error);
    }
  };

  const addTest = (test) => {
    if (!test) return;
    // Unique check based on test_id or itemName (if test_id missing)
    const exists = selectedTests.find((t) =>
      (test.test_id && t.test_id === test.test_id) ||
      (t.itemName === test.itemName)
    );
    if (exists) {
      alert("This test is already added.");
      return;
    }

    setSelectedTests((prev) => [...prev, test]);
    setTestName("");
    setInvestigationItems([]);
    setRate(test.price || "0.00");
  };

  const removeTest = (index) => {
    setSelectedTests((prev) => prev.filter((_, i) => i !== index));
    if (selectedTests.length === 1) {
      setRate("0.00");
    }
  };

  const handleSave = async () => {
    if (selectedTests.length === 0) {
      alert("Please add at least one test.");
      return;
    }
    if (!doctor) {
      alert("Please select a doctor.");
      return;
    }

    const mappedTests = selectedTests.map(t => ({
      test_id: t.test_id || "",
      itemCode: t.itemCode || "",
      itemName: t.itemName,
      price: t.price,
      is_emergency: emergency
    }));

    const payload = {
      uhid: resolvedPatient.uhid,
      ipNumber: resolvedPatient.ipNo,
      bill_type: billtype,
      doctor: doctor,
      wardName: resolvedPatient.roomBed.split("|")[0].trim() || "SUITE",
      item: mappedTests,
      total_amount: selectedTests.reduce((acc, t) => acc + (parseFloat(t.price) || 0), 0),
    };

    try {
      const res = await apiRequest(`${HmsBaseUrl}save_lab_ward_request/`, "POST", payload);
      if (res.success) {
        alert("Lab Ward Request Saved Successfully!");
        setSelectedTests([]);
        setShowRequestForm(false);
        fetchLabRequests();
      } else {
        alert("Failed to save: " + (res.error || res.data?.message));
      }
    } catch (error) {
      console.error("Save Lab Request Error:", error);
      alert("An error occurred while saving.");
    }
  };
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}cancel_lab_ward_request/`, "POST", { id: requestId });
      if (res.success) {
        alert("Request cancelled successfully!");
        fetchLabRequests();
      } else {
        alert("Failed to cancel: " + (res.data?.error || res.error || res.data?.message));
      }
    } catch (error) {
      console.error("Cancel Request Error:", error);
      alert("An error occurred while cancelling.");
    }
  };


  const handleRemoveIndividualTest = async (requestId, test) => {
    if (!window.confirm(`Are you sure you want to remove the test "${test.name}"?`)) return;
    try {
      const payload = {
        id: requestId,
        test_id: test.test_id,
        test_name: test.name
      };
      const res = await apiRequest(`${HmsBaseUrl}remove_individual_test/`, "POST", payload);
      if (res.success) {
        alert("Test removed successfully!");
        fetchLabRequests();
      } else {
        alert("Failed to remove test: " + (res.data?.error || res.data?.message || res.error));
      }
    } catch (error) {
      console.error("Remove Individual Test Error:", error);
      alert("An error occurred while removing the test.");
    }
  };


  return (
    <PageWrapper>
      {/* ── Patient Info ── */}
      <PatientPanel>
        <PatientHeader>
          <PatientAvatar>
            {resolvedPatient.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </PatientAvatar>
          <PatientIdentity>
            <h3>{resolvedPatient.name}</h3>
            <div className="sub-text">
              UHID: {resolvedPatient.uhid} | IP No: {resolvedPatient.ipNo} ({resolvedPatient.ipBadge})
            </div>
          </PatientIdentity>
        </PatientHeader>
        <PatientGrid>
          <FieldBox>
            <FieldLabel>Admitting Dr</FieldLabel>
            <FieldValue>{resolvedPatient.admittingDr}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Room No | Bed</FieldLabel>
            <FieldValue>{resolvedPatient.roomBed}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Customer Type</FieldLabel>
            <FieldValue>{resolvedPatient.customerType}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Admitting Date & Time</FieldLabel>
            <FieldValue>{resolvedPatient.admitting}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Company Name</FieldLabel>
            <FieldValue>{resolvedPatient.companyName}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Address</FieldLabel>
            <FieldValue style={{ fontSize: '0.85rem' }}>{resolvedPatient.address}</FieldValue>
          </FieldBox>
        </PatientGrid>
      </PatientPanel>

      {/* ── Actions Bar ── */}
      <ActionsBar>
        <LegendGroup>
          <LegendBadge bg={colors.secondary}>
            <LegendDot color={colors.secondary} />
            Result Pending
          </LegendBadge>
          <LegendBadge bg={colors.primary}>
            <LegendDot color={colors.primary} />
            Result Entered
          </LegendBadge>
          <LegendBadge bg={colors.textMuted}>
            <LegendDot color={colors.textMuted} />
            Cancelled Request
          </LegendBadge>
        </LegendGroup>
        <Button onClick={() => setShowRequestForm((v) => !v)}>
          {showRequestForm ? "− Request" : "+ Request"}
        </Button>
      </ActionsBar>

      {/* ── Request Form (inline expand) ── */}
      {showRequestForm && (
        <div
          style={{
            background: "#f9fbfc",
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            marginBottom: 18,
          }}
        >
          <RequestFormWrapper>
            <FormPanel>
              <FormRow>
                <div>
                  <FormLabel>
                    Doctor<span className="required">*</span>
                  </FormLabel>
                  <FormSelect value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                    <option value="">Select Doctor</option>
                    {doctors.map((dr, idx) => (
                      <option key={idx} value={dr.employeeName}>
                        {dr.employeeName}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div>
                  <FormLabel>
                    Billtype<span className="required">*</span>
                  </FormLabel>
                  <div>

                    <FormSelect
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
                    </FormSelect>

                  </div>
                </div>
              </FormRow>

              <FormRowSingle>
                <div style={{ position: "relative" }}>
                  <FormLabel>Test Name</FormLabel>
                  <div style={{ display: "flex" }}>
                    <FormInput
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          fetchInvestigationItems();
                        }
                      }}
                      placeholder="Search for a test..."
                    />
                    <SearchIconBtn type="button" onClick={fetchInvestigationItems}>
                      🔍
                    </SearchIconBtn>
                  </div>
                  {investigationItems.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        border: "1px solid #CFD8DC",
                        borderRadius: 4,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        maxHeight: 200,
                        overflowY: "auto",
                        background: "#fff",
                      }}
                    >
                      {Array.isArray(investigationItems) && investigationItems.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => addTest(item)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                            fontSize: "0.85rem",
                          }}
                        >
                          {item.itemName} — ₹{item.price}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <FormLabel>Emergency Test</FormLabel>
                  <CheckboxRow style={{ marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={emergency}
                      onChange={(e) => setEmergency(e.target.checked)}
                    />
                  </CheckboxRow>
                </div>
                <div>
                  <FormLabel>Rate</FormLabel>
                  <RateBox>
                    <RatePrefix>₹</RatePrefix>
                    <RateInput
                      type="number"
                      value={rate}
                      readOnly
                    />
                  </RateBox>
                </div>
              </FormRowSingle>

              <div style={{ marginTop: 14 }}>
                <FormLabel>Package</FormLabel>
                <FormSelect
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  style={{ width: 200 }}
                >
                  <option>ALL</option>
                  <option>BASIC</option>
                  <option>ADVANCED</option>
                </FormSelect>
              </div>
            </FormPanel>

            <SidePanel>
              <SidePanelHeader>
                <span>Test Name</span>
                <span style={{ textAlign: "right", paddingRight: "30px" }}>Cost | Action</span>
              </SidePanelHeader>
              {selectedTests.map((test, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 0",
                    borderBottom: "1px solid #CFD8DC",
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{test.itemName}</span>
                  <span style={{ color: colors.headerBg, fontWeight: 600 }}>₹ {test.price}</span>
                  <button
                    onClick={() => removeTest(index)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e53935",
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "0 4px",
                      display: "flex",
                      alignItems: "center"
                    }}
                    title="Remove Test"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <SidePanelActions>
                <SaveBtn type="button" onClick={handleSave}>💾 Save</SaveBtn>
                <CancelBtn type="button" onClick={() => setShowRequestForm(false)}>
                  ✕ Cancel
                </CancelBtn>
              </SidePanelActions>
            </SidePanel>
          </RequestFormWrapper>
        </div>
      )}

      {/* ── Main Table ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: colors.textMain }}>
          Show up to
          <Select value={showUpTo} onChange={(e) => setShowUpTo(e.target.value)} style={{ width: "70px", padding: "4px 8px" }}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </Select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
          <Input
            placeholder="Search by Ward..."
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
              <Th>User Name</Th>
              <Th>Bill No</Th>
              <Th>Bill Type</Th>
              <Th>Ward Name</Th>
              <Th>Doctor Name</Th>
              <Th style={{ width: "48px" }}></Th>
            </Tr>
          </thead>
          <tbody>
            {Array.isArray(filteredRequests) && filteredRequests.map((req) => (
              <React.Fragment key={req.id}>
                <Tr>
                  <Td>
                    <StatusBadge status={req.status}>{req.status}</StatusBadge>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 500 }}>{req.reqDate}</span>
                      <small style={{ color: colors.textMuted }}>{req.reqTime}</small>
                    </div>
                  </Td>
                  <Td>{req.userName}</Td>
                  <Td>{req.billNo}</Td>
                  <Td>{req.billType}</Td>
                  <Td>{req.wardName}</Td>
                  <Td
                    style={{ cursor: "pointer", color: colors.primary, fontWeight: 600 }}
                    onClick={() => toggleRow(req.id)}
                  >
                    {req.doctorName}
                  </Td>
                  <Td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <button
                        onClick={() => toggleRow(req.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: colors.primary, fontSize: "1.2rem" }}
                      >
                        {expandedRow === req.id ? "▴" : "▾"}
                      </button>
                      {req.status === "Result Pending" && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: colors.danger,
                            cursor: "pointer",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Cancel Request"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>

                {expandedRow === req.id && (
                  <Tr>
                    <Td colSpan={8} style={{ padding: 0 }}>
                      <SubTableWrapper>
                        <SubTableControls>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                            Show up to
                            <Select defaultValue="10" style={{ width: "70px", padding: "4px 8px" }}>
                              <option>10</option>
                              <option>25</option>
                            </Select>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                            Search:
                            <Input placeholder="Search By Test Name" style={{ width: "200px", padding: "4px 12px" }} />
                          </div>
                        </SubTableControls>
                        <SubTable>
                          <thead>
                            <Tr>
                              <Th>Test Name</Th>
                              <Th>Collection Time</Th>
                              <Th>Action</Th>
                            </Tr>
                          </thead>
                          <tbody>
                            {req.tests.length === 0 ? (
                              <Tr>
                                <Td
                                  colSpan={3}
                                  style={{ textAlign: "center", color: colors.textMuted }}
                                >
                                  No tests found
                                </Td>
                              </Tr>
                            ) : (
                              req.tests.map((t, i) => (
                                <Tr key={i}>
                                  <Td>{t.name}</Td>
                                  <Td>{t.collectionTime}</Td>
                                  <Td style={{ textAlign: "center" }}>
                                    {req.status === "Result Pending" && (
                                      <button
                                        onClick={() => handleRemoveIndividualTest(req.id, t)}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: colors.danger,
                                          cursor: "pointer",
                                          fontSize: "0.9rem",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          width: "100%"
                                        }}
                                        title="Remove this test"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </Td>
                                </Tr>
                              ))
                            )}
                          </tbody>
                        </SubTable>
                        <Pagination>
                          <span>
                            Showing 1 to {req.tests.length} of {req.tests.length} entries
                          </span>
                          <PaginationBtns>
                            <PageBtn disabled>Previous</PageBtn>
                            <PageBtn active>1</PageBtn>
                            <PageBtn disabled>Next</PageBtn>
                          </PaginationBtns>
                        </Pagination>
                      </SubTableWrapper>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      <Pagination>
        <span>Showing 1 to {filteredRequests.length} of {filteredRequests.length} entries</span>
        <PaginationBtns>
          <PageBtn disabled>Previous</PageBtn>
          <PageBtn active>1</PageBtn>
          <PageBtn disabled>Next</PageBtn>
        </PaginationBtns>
      </Pagination>
    </PageWrapper>
  );
}