import React, { useState, useEffect } from "react";
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
  Header,
  Title,
  Section,
  PrimaryButton,
  SecondaryButton,
  ButtonGroup,
  LoadingIndicator,
} from "../GlobalStyles";

// ─── Color palette (mirrors GlobalStyles conventions) ───────────────────────
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

// ─── Patient Info Panel ───────────────────────────────────────────────────────
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

const PatientRow2 = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 220px));
  gap: 12px 16px;
  margin-top: 12px;
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

const IPBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${colors.dark};
  color: ${colors.white};
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 7px;
  margin-left: 8px;
`;

// ─── Legend & Actions bar ─────────────────────────────────────────────────────
const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const LegendGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const LegendBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: default;
  background: ${({ bg }) => bg || colors.dark};
  color: ${colors.white};
`;

const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${({ color }) => color || colors.white};
  opacity: 0.85;
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

// ─── Table controls ───────────────────────────────────────────────────────────
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

// ─── Main Table ───────────────────────────────────────────────────────────────
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
  cursor: pointer;
  user-select: none;
  &:after {
    content: " ⇅";
    font-size: 0.7rem;
    opacity: 0.7;
  }
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
    status === "Result Pending"
      ? colors.yellow
      : status === "Result Entered"
        ? colors.primary
        : colors.dark};
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

// ─── Expand: Sub-table (tests) ────────────────────────────────────────────────
const SubTableWrapper = styled.div`
  padding: 14px 20px 16px;
`;

const SubTableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const SubTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.87rem;
`;

const SubTh = styled.th`
  background: ${colors.background};
  color: ${colors.textMain};
  padding: 9px 14px;
  text-align: left;
  font-weight: 700;
  border-bottom: 2px solid ${colors.border};
  cursor: pointer;
  user-select: none;
  &:after {
    content: " ⇅";
    font-size: 0.7rem;
    opacity: 0.5;
  }
`;

const SubTd = styled.td`
  padding: 9px 14px;
  border-bottom: 1px solid ${colors.border};
  color: ${colors.textMain};
`;

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 0.83rem;
  color: ${colors.textMuted};
`;

const PaginationBtns = styled.div`
  display: flex;
  gap: 4px;
`;

const PageBtn = styled.button`
  border: 1px solid ${colors.border};
  background: ${({ active }) => (active ? colors.primary : colors.white)};
  color: ${({ active }) => (active ? colors.white : colors.textMain)};
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.83rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  &:hover:not(:disabled) {
    background: ${({ active }) => (active ? colors.primaryDark : colors.background)};
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

    const payload = {
      uhid: resolvedPatient.uhid,
      ipNumber: resolvedPatient.ipNo,
      bill_type: billtype,
      billTypeNo: billTypeNo,
      billTypeName: billTypeName,
      doctor: doctor,
      wardName: resolvedPatient.roomBed.split("|")[0].trim() || "SUITE",
      selectedTests: selectedTests.map(t => ({
        test_id: t.test_id || "",
        itemCode: t.itemCode || "",
        itemName: t.itemName,
        price: t.price,
        is_emergency: emergency
      })),
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
        <PatientGrid>
          <FieldBox>
            <FieldLabel>IP No</FieldLabel>
            <FieldValue>
              {resolvedPatient.ipNo}
              <IPBadge>{resolvedPatient.ipBadge}</IPBadge>
            </FieldValue>
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
            <FieldLabel>Admitting Date &amp; Time</FieldLabel>
            <FieldValue>{resolvedPatient.admitting}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Room No | Bed</FieldLabel>
            <FieldValue>{resolvedPatient.roomBed}</FieldValue>
          </FieldBox>
        </PatientGrid>
        <PatientRow2>
          <FieldBox>
            <FieldLabel>Customer Type</FieldLabel>
            <FieldValue>{resolvedPatient.customerType}</FieldValue>
          </FieldBox>
          <FieldBox>
            <FieldLabel>Company Name</FieldLabel>
            <FieldValue>{resolvedPatient.companyName}</FieldValue>
          </FieldBox>
        </PatientRow2>
      </PatientPanel>

      {/* ── Actions Bar ── */}
      <ActionsBar>
        <LegendGroup>
          <LegendBadge bg={colors.yellow}>
            <LegendDot color={colors.white} />
            Result Pending
          </LegendBadge>
          <LegendBadge bg={colors.primary}>
            <LegendDot color={colors.white} />
            Result Entered
          </LegendBadge>
          <LegendBadge bg={colors.dark}>
            <LegendDot color={colors.white} />
            Cancelled Request
          </LegendBadge>
        </LegendGroup>
        <RequestBtn onClick={() => setShowRequestForm((v) => !v)}>
          {showRequestForm ? "− Request" : "+ Request"}
        </RequestBtn>
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
                      {investigationItems.map((item, index) => (
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
      <TableControls>
        <ShowUpTo>
          Show up to
          <select value={showUpTo} onChange={(e) => setShowUpTo(e.target.value)}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </ShowUpTo>
        <SearchBox>
          Search:
          <input
            placeholder="Search By Ward"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBox>
      </TableControls>

      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              <StyledTh>Status</StyledTh>
              <StyledTh>Request Date</StyledTh>
              <StyledTh>Request Time</StyledTh>
              <StyledTh>User Name</StyledTh>
              <StyledTh>Bill No</StyledTh>
              <StyledTh>Bill Type</StyledTh>
              <StyledTh>Ward Name</StyledTh>
              <StyledTh>Doctor Name</StyledTh>
              <th style={{ background: colors.headerBg, width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req) => (
              <React.Fragment key={req.id}>
                <StyledTr highlight={req.id % 2 === 1}>
                  <StyledTd>
                    <StatusBadge status={req.status}>{req.status}</StatusBadge>
                  </StyledTd>
                  <StyledTd>{req.reqDate}</StyledTd>
                  <StyledTd>{req.reqTime}</StyledTd>
                  <StyledTd>{req.userName}</StyledTd>
                  <StyledTd>{req.billNo}</StyledTd>
                  <StyledTd>{req.billType}</StyledTd>
                  <StyledTd>{req.wardName}</StyledTd>
                  <StyledTd
                    style={{ cursor: "pointer", color: colors.primary, fontWeight: 600 }}
                    onClick={() => toggleRow(req.id)}
                  >
                    {req.doctorName}
                  </StyledTd>
                  <StyledTd style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <ExpandBtn onClick={() => toggleRow(req.id)} title="View Tests">
                        {expandedRow === req.id ? "⌃" : "⌄"}
                      </ExpandBtn>
                      {req.status === "Result Pending" && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e53935",
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
                  </StyledTd>
                </StyledTr>

                {expandedRow === req.id && (
                  <ExpandedRow>
                    <ExpandedCell colSpan={9}>
                      <SubTableWrapper>
                        <SubTableControls>
                          <ShowUpTo>
                            Show up to
                            <select defaultValue="10">
                              <option>10</option>
                              <option>25</option>
                            </select>
                          </ShowUpTo>
                          <SearchBox>
                            Search:
                            <input placeholder="Search By Test Name" />
                          </SearchBox>
                        </SubTableControls>
                        <SubTable>
                          <thead>
                            <tr>
                              <SubTh>Test Name</SubTh>
                              <SubTh>Collection Time</SubTh>
                              <SubTh>Action</SubTh>
                            </tr>
                          </thead>
                          <tbody>
                            {req.tests.length === 0 ? (
                              <tr>
                                <SubTd
                                  colSpan={3}
                                  style={{ textAlign: "center", color: colors.textMuted }}
                                >
                                  No tests found
                                </SubTd>
                              </tr>
                            ) : (
                              req.tests.map((t, i) => (
                                <tr key={i}>
                                  <SubTd>{t.name}</SubTd>
                                  <SubTd>{t.collectionTime}</SubTd>
                                  <SubTd style={{ textAlign: "center" }}>
                                    {req.status === "Result Pending" && (
                                      <button
                                        onClick={() => handleRemoveIndividualTest(req.id, t)}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#e53935",
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
                                  </SubTd>
                                </tr>
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
                    </ExpandedCell>
                  </ExpandedRow>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </StyledTable>
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