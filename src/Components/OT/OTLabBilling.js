import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import PrintModal from "../InvestigationBilling/PrintModal";
import {
  PageWrapper,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Select,
  Button,
  SectionHeader,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ButtonContainer,
  colors,
} from "../GlobalStyles";

// ─── Page Layout ──────────────────────────────────────────────────────────────
const PageContainer = styled(PageWrapper)`
  background: #f0f2f5;
  padding: 12px;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;
`;

const PageTitle = styled.h1`
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.primary};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid ${colors.primary};
  padding-bottom: 6px;
`;

const NavigationLinks = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
`;

const NavLink = styled.span`
  color: ${colors.primary};
  font-weight: 600;
  cursor: pointer;
  font-size: 0.78rem;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid ${colors.primary};
  transition: all 0.2s;
  &:hover {
    background: ${colors.primary};
    color: white;
  }
`;

const SurgeryRefBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #1e40af;
  strong {
    white-space: nowrap;
  }
`;

const SectionLabel = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${colors.primary};
`;

// ─── Searchable Dropdown ──────────────────────────────────────────────────────
const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 100%;
  width: max-content;
  max-width: min(650px, 90vw);
  max-height: 240px;
  overflow-y: auto;
  background: white;
  border: 1px solid ${colors.primary};
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 2px;
`;

const DropdownItem = styled.div`
  padding: 5px 8px;
  cursor: pointer;
  font-size: 0.82rem;
  color: ${colors.textMain};
  &:hover {
    background: ${colors.tabBg};
  }
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.border};
  }
`;

const ProductSection = styled(ContentCard)`
  background: #fafbfc;
  padding: 8px 12px;
`;

// ─── Responsive Grid Rows for Billing Details & Items ────────────────────────

const BillingDetailsGrid = styled(FormRow)`
  grid-template-columns: minmax(130px, 1fr) minmax(120px, 1fr) minmax(240px, 2fr) minmax(200px, 1.5fr) minmax(200px, 1.5fr);
  gap: 10px 14px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ItemSelectionGrid = styled(FormRow)`
  grid-template-columns: minmax(300px, 3.5fr) minmax(100px, 1fr) minmax(120px, 1fr) auto;
  gap: 10px 14px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px 10px;

    /* Item Name takes full width on mobile */
    > div:first-child {
      grid-column: 1 / -1;
    }

    /* Add Item button takes full width on mobile */
    > button {
      grid-column: 1 / -1;
      width: 100%;
      margin-top: 6px;
    }
  }
`;

const AddBtn = styled(Button)`
  background: ${colors.success};
  margin-top: 18px;
  &:hover {
    background: #16a34a;
  }
`;

const DelBtn = styled(Button)`
  background: ${colors.danger};
  padding: 3px 8px;
  font-size: 0.72rem;
  &:hover {
    background: #dc2626;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  overflow: hidden;
  input {
    border: none;
    text-align: center;
    width: 60px;
    font-size: 0.82rem;
    padding: 5px 0;
    color: ${colors.textMain};
    &:focus {
      outline: none;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: ${colors.textMuted};
  font-size: 0.82rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-top: 8px;
`;

const SummaryGrid = styled(FormRow)`
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  margin-top: 8px;
  padding: 8px 10px;
  background: #f7f9fc;
  border-radius: 6px;
  border: 1px solid ${colors.border};
`;

const CompanyInfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 3px 0;
  span {
    font-size: 0.82rem;
    font-weight: 700;
    color: #1565c0;
  }
  small {
    font-size: 0.75rem;
    color: #1976d2;
    font-weight: 500;
  }
`;

const ActionRow = styled(ButtonContainer)`
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 8px;
`;

const ResetBtn = styled(Button)`
  background: ${colors.textMuted};
  &:hover {
    background: #475569;
  }
`;

const SubmitBtn = styled(Button)`
  background: ${colors.primary};
  &:hover {
    background: ${colors.primaryDark};
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const LAB_BILL_TYPE_NO = "LAB01";
const LAB_BILL_TYPE = 16;

// ─── Searchable Dropdown Component (matches InvestigationBilling) ─────────────
const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  displayKey = "name",
  valueKey = "id",
  disabled = false,
}) => {
  const getLabel = (val) => {
    if (!val) return "";
    const found = options.find((o) =>
      typeof o === "string" ? o === val : o[valueKey] === val,
    );
    return found
      ? typeof found === "string"
        ? found
        : found[displayKey]
      : val;
  };

  const [inputValue, setInputValue] = useState(() => getLabel(value));
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const isSearchingRef = useRef(false);

  // Only sync from outside when NOT actively typing
  useEffect(() => {
    if (!isSearchingRef.current) {
      setInputValue(getLabel(value));
    }
  }, [value, options]); // eslint-disable-line

  // Close on outside click, restore label
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        isSearchingRef.current = false;
        setIsOpen(false);
        setInputValue(getLabel(value)); // restore on blur without selection
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, options]); // eslint-disable-line

  const filtered = options.filter((o) => {
    const label = typeof o === "string" ? o : o[displayKey];
    return label.toLowerCase().includes(inputValue.toLowerCase());
  });

  const handleInputChange = (e) => {
    isSearchingRef.current = true;
    setInputValue(e.target.value);
    setIsOpen(true);
    if (e.target.value === "") {
      isSearchingRef.current = false;
      onChange(""); // clear parent
    }
  };

  const handleClear = () => {
    isSearchingRef.current = false;
    setInputValue("");
    setIsOpen(false);
    onChange(""); // clear parent
  };

  const handleSelect = (option) => {
    const sv = typeof option === "string" ? option : option[valueKey];
    const dv = typeof option === "string" ? option : option[displayKey];
    isSearchingRef.current = false;
    setInputValue(dv);
    setIsOpen(false);
    onChange(sv);
  };

  const handleFocus = () => {
    isSearchingRef.current = true;
    setInputValue(""); // clear text so user sees all options
    setIsOpen(true);
  };

  return (
    <DropdownWrapper ref={wrapperRef} style={{ position: "relative" }}>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          style={{ paddingRight: value ? "28px" : undefined }}
        />
        {value && !disabled && (
          <span
            onMouseDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            style={{
              position: "absolute",
              right: "8px",
              cursor: "pointer",
              color: "#888",
              fontSize: "14px",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            ×
          </span>
        )}
      </div>
      {isOpen && filtered.length > 0 && (
        <DropdownList>
          {filtered.map((option, index) => (
            <DropdownItem
              key={index}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option)}
            >
              {typeof option === "string" ? option : option[displayKey]}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </DropdownWrapper>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OTLabBilling = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    investBillNo: "",
    investBillDate: "",
    time: "",
    uhid: "",
    ipNumber: "",
    doctor: "", // stores employeeId (like InvestigationBilling)
    salutation: "",
    firstName: "",
    patientName: "",
    lastName: "",
    age: "",
    age_type: "",
    gender: "",
    item: JSON.stringify([]),
    referredBy: "", // stores employeeId (like InvestigationBilling)
    total: 0,
    finalPrice: 0,
    paymentMethod: "Credit",
    paymentStatus: "Pending",
    customer_type: "",
    company_name: "",
    company_code: "",
    surgeryRef: "",
    roomNo: "", // stores ot_name from navigated surgery data
    is_emergency: false,
    billType: "",
    bill_type: "",
    billTypeNo: "LAB01",
  });

  const [doctors, setDoctors] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [selectedBillTypeNo, setSelectedBillTypeNo] = useState("LAB01");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [productList, setProductList] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loadingItems, setLoadingItems] = useState(true);
  const [printJob, setPrintJob] = useState(null);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setFormData((p) => ({
        ...p,
        investBillDate: today,
        time: `${hh}:${mm}:${ss}`,
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch doctors ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET");
      if (res.success) setDoctors(res.data);
    };
    fetchDoctors();
  }, [HMSURL]);

  // ── Fetch LAB bill types (LAB01 & LAB02) ──────────────────────────────────
  useEffect(() => {
    const fetchBillTypes = async () => {
      const result = await apiRequest(`${HMSURL}bill-types/`, "GET");
      if (result.success) {
        const labTypes = (result.data.billTypes || [])
          .map((bt) => ({
            ...bt,
            billTypeNo: bt.billTypeNo ?? bt.BillTypeNo ?? 0,
          }))
          .filter((bt) =>
            ["LAB01", "LAB02"].includes(
              String(bt.billTypeNo).trim().toUpperCase(),
            ),
          );
        setBillTypes(labTypes);

        const defaultLab =
          labTypes.find(
            (b) => String(b.billTypeNo).trim().toUpperCase() === "LAB01",
          ) || labTypes[0];

        if (defaultLab) {
          setFormData((prev) => ({
            ...prev,
            billType: defaultLab.bill_name,
            bill_type: defaultLab.bill_type,
            billTypeNo: defaultLab.billTypeNo,
          }));
          setSelectedBillTypeNo(defaultLab.billTypeNo);
        }
      }
    };
    fetchBillTypes();
  }, [HMSURL]);

  // ── Fetch items when bill type changes ────────────────────────────────────
  useEffect(() => {
    if (!formData.bill_type || !selectedBillTypeNo) return;
    const fetchItems = async () => {
      setLoadingItems(true);
      const res = await apiRequest(
        `${HMSURL}investigation-items/?billTypeNo=${selectedBillTypeNo}&billType=${formData.bill_type}`,
        "GET",
      );
      if (res.success) setItems(res.data?.items || []);
      setLoadingItems(false);
    };
    fetchItems();
  }, [HMSURL, selectedBillTypeNo, formData.bill_type]);

  const handleBillTypeChange = (billName) => {
    const bt = billTypes.find((b) => b.bill_name === billName);
    if (bt) {
      const bNo = bt.billTypeNo ?? bt.BillTypeNo ?? "LAB01";
      setSelectedBillTypeNo(bNo);
      setFormData((prev) => ({
        ...prev,
        billType: bt.bill_name,
        bill_type: bt.bill_type,
        billTypeNo: bNo,
      }));
      setSelectedItem("");
      setSelectedPrice("");
      setProductList([]);
    }
  };

  // ── Populate form from navigation state ───────────────────────────────────
  // UHID and IP Number now come exclusively from navigated data (no manual
  // search). ot_name from the navigated payload is stored into roomNo.
  useEffect(() => {
    if (!location.state?.patientData) return;
    const d = location.state.patientData;
    setFormData((prev) => ({
      ...prev,
      uhid: d.uhid || "",
      ipNumber: d.ip_number || d.ipNumber || "",
      salutation: d.salutation || "",
      firstName: d.firstName || "",
      lastName: d.lastName || "",
      patientName: d.patient_name || d.firstName || "",
      age: String(d.age || ""),
      age_type: String(d.age_type || ""),
      gender: d.gender || "",
      // Store raw incoming doctor value — resolved to employeeId in next effect
      _rawDoctor: d.doctor || d.surgeon_id || "",
      doctor: "",
      referredBy: "",
      surgeryRef: d.surgeryRef || d.reference_no || "",
      roomNo: d.ot_name || "",
      customer_type: d.customer_type || "",
      company_name: d.company_name || "",
      company_code: d.company_code || "",
      is_emergency: !!d.is_emergency,
    }));
  }, [location.state]);

  // ── Resolve raw doctor to employeeId once doctors list loads ───────────────
  // Matches by employeeName, employeeId, or raw value — stores employeeId
  // (same pattern as InvestigationBilling which stores employeeId in doctor field)
  useEffect(() => {
    if (!doctors.length) return;
    const raw = formData._rawDoctor;
    if (!raw) return;

    const match = doctors.find(
      (d) =>
        d.employeeName.trim() === raw ||
        d.employeeId === raw ||
        String(d.employeeId) === String(raw),
    );

    // Store employeeId so SearchableDropdown can match it via valueKey="id"
    const resolvedId = match ? match.employeeId : raw;
    setFormData((p) => ({
      ...p,
      doctor: resolvedId,
      referredBy: resolvedId,
    }));
  }, [doctors, formData._rawDoctor]); // eslint-disable-line

  // ── Item selection ─────────────────────────────────────────────────────────
  const handleItemChange = (name) => {
    setSelectedItem(name);
    const obj = items.find((i) => i.itemName === name);
    setSelectedPrice(obj ? obj.price : "");
  };

  // ── Product list ───────────────────────────────────────────────────────────
  const addProduct = () => {
    if (!selectedItem || !selectedPrice) return;
    const obj = items.find((item) => item.itemName === selectedItem);
    const newProduct = {
      itemName: selectedItem,
      price: selectedPrice,
      quantity,
      billTypeNo: selectedBillTypeNo,
      nabh_code: obj?.nabh_code || "",
      ...(obj?.test_id && { test_id: obj.test_id }),
      ...(obj?.item_id && { item_id: obj.item_id }),
    };
    const updated = [...productList, newProduct];
    setProductList(updated);
    setFormData((p) => ({ ...p, item: JSON.stringify(updated) }));
    setSelectedItem("");
    setSelectedPrice("");
    setQuantity(1);
  };

  const deleteProduct = (idx) => {
    const updated = productList.filter((_, i) => i !== idx);
    setProductList(updated);
    setFormData((p) => ({ ...p, item: JSON.stringify(updated) }));
  };

  // ── Auto-calculations ──────────────────────────────────────────────────────
  useEffect(() => {
    const total = productList.reduce(
      (s, i) => s + Number(i.price) * Number(i.quantity),
      0,
    );
    setFormData((p) => ({ ...p, total, finalPrice: total }));
  }, [productList]);

  // ── Form actions ───────────────────────────────────────────────────────────
  const handleReset = () => {
    navigate(location.pathname, { replace: true, state: {} });
    window.location.reload();
  };

  const validateForm = () => {
    if (!formData.uhid?.trim()) {
      alert("UHID is required!");
      return false;
    }
    if (!formData.doctor?.trim()) {
      alert("Doctor is required!");
      return false;
    }
    if (!productList.length) {
      alert("Please add at least one item!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      uhid: formData.uhid,
      ipNumber: formData.ipNumber,
      doctor: formData.doctor, // employeeId
      bill_type: formData.bill_type || LAB_BILL_TYPE,
      billTypeNo: selectedBillTypeNo || LAB_BILL_TYPE_NO,
      referredBy: formData.referredBy, // employeeId
      discountPercent: 0,
      discount: 0,
      discountRemarks: "",
      total: formData.total,
      finalPrice: formData.finalPrice,
      paymentMethod: "Credit",
      paymentStatus: "Pending",
      item: productList,
      is_emergency: !!formData.is_emergency,
      roomNo: formData.roomNo || "",
      age: formData.age || "",
      age_type: formData.age_type || "",
    };

    const res = await apiRequest(`${HMSURL}investBilling/`, "POST", payload);
    if (res.success) {
      const billNo = res.data?.investBillNo;
      if (billNo) {
        setPrintJob({
          bill: {
            ...formData,
            investBillNo: billNo,
            investBillDate: formData.investBillDate,
            item: productList,
          },
          isEstimate: false,
          toastMsg: "Lab bill generated successfully!",
        });
      } else {
        alert("Bill generated but bill number not received from server!");
      }
    } else {
      alert(`Failed to save lab bill: ${res.error}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      <PageTitle style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Button
            type="button"
            onClick={() => navigate("/SurgerySchedule")}
            style={{
              background: "#475569",
              padding: "4px 10px",
              fontSize: "0.78rem",
              height: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ⬅ Back
          </Button>
          <span>🧪 Lab Request Billing</span>
        </div>
      </PageTitle>

      <NavigationLinks>
        <NavLink onClick={() => navigate("/SurgerySchedule")}>
          ⬅ Back to Surgery Schedule
        </NavLink>
        <NavLink onClick={() => navigate("/ViewBills")}>📄 View Bills</NavLink>
      </NavigationLinks>

      {formData.surgeryRef && (
        <SurgeryRefBanner>
          <span>🔗</span>
          <div>
            <strong>Surgery Ref:</strong> {formData.surgeryRef}
            {"  ·  "}
            Billing type: <strong>LAB (Credit)</strong>
          </div>
        </SurgeryRefBanner>
      )}

      <ContentCard>
        <form onSubmit={handleSubmit}>
          {/* ── Patient Information ─────────────────────────────────────── */}
          <SectionHeader>
            <SectionLabel>👤 Patient Information</SectionLabel>
          </SectionHeader>

          <FormRow>
            <InputWrapper>
              <Label required>UHID</Label>
              <Input
                type="text"
                name="uhid"
                value={formData.uhid}
                readOnly
                style={{ background: "#f1f5f9", color: "#475569" }}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>IP Number</Label>
              <Input
                type="text"
                name="ipNumber"
                value={formData.ipNumber}
                readOnly
                style={{ background: "#f1f5f9", color: "#475569" }}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Patient Name</Label>
              <Input
                type="text"
                value={
                  formData.patientName ||
                  `${formData.firstName || ""}${formData.lastName ? " " + formData.lastName : ""}`.trim()
                }
                readOnly
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Age</Label>
              <Input type="text" value={formData.age} readOnly />
            </InputWrapper>
            <InputWrapper>
              <Label>Age Type</Label>
              <Input type="text" value={formData.age_type} readOnly />
            </InputWrapper>

            <InputWrapper>
              <Label>Gender</Label>
              <Input type="text" value={formData.gender} readOnly />
            </InputWrapper>

            {/* Room No — from navigated surgery data (ot_name) */}
            {formData.roomNo && (
              <InputWrapper>
                <Label>Room No</Label>
                <Input
                  type="text"
                  name="roomNo"
                  value={formData.roomNo}
                  readOnly
                />
              </InputWrapper>
            )}

            {/* Emergency Case checkbox */}
            <InputWrapper style={{ justifyContent: "flex-end" }}>
              <Label>&nbsp;</Label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  color: "#dc2626",
                  fontWeight: 600,
                  padding: "6px 0",
                }}
              >
                <input
                  type="checkbox"
                  name="is_emergency"
                  checked={!!formData.is_emergency}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      is_emergency: e.target.checked,
                    }))
                  }
                  style={{ accentColor: "#dc2626", width: 15, height: 15 }}
                />
                Emergency Case
              </label>
            </InputWrapper>
          </FormRow>

          {/* ── Billing Details ─────────────────────────────────────────── */}
          <SectionHeader>
            <SectionLabel>📋 Billing Details</SectionLabel>
          </SectionHeader>

          <BillingDetailsGrid>
            <InputWrapper>
              <Label>Bill Date</Label>
              <Input
                type="date"
                name="investBillDate"
                value={formData.investBillDate}
                onChange={handleInputChange}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Bill Time</Label>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
              />
            </InputWrapper>

            <InputWrapper>
              <Label required>Bill Type</Label>
              <SearchableDropdown
                value={formData.billType}
                onChange={handleBillTypeChange}
                options={billTypes.map((bt) => bt.bill_name)}
                placeholder="Select bill type..."
              />
            </InputWrapper>

            <InputWrapper>
              <Label required>Doctor</Label>
              <SearchableDropdown
                value={formData.doctor}
                onChange={(value) =>
                  setFormData((p) => ({ ...p, doctor: value }))
                }
                options={[
                  { id: "SELF", name: "SELF" },
                  ...doctors.map((d) => ({
                    id: d.employeeId,
                    name: d.employeeName.trim(),
                  })),
                ]}
                displayKey="name"
                valueKey="id"
                placeholder="Select doctor..."
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Referred By</Label>
              <SearchableDropdown
                value={formData.referredBy}
                onChange={(value) =>
                  setFormData((p) => ({ ...p, referredBy: value }))
                }
                options={[
                  { id: "SELF", name: "SELF" },
                  ...doctors.map((d) => ({
                    id: d.employeeId,
                    name: d.employeeName.trim(),
                  })),
                ]}
                displayKey="name"
                valueKey="id"
                placeholder="Select doctor..."
              />
            </InputWrapper>
          </BillingDetailsGrid>

          {/* ── Lab Items ───────────────────────────────────────────────── */}
          <ProductSection>
            <SectionHeader>
              <SectionLabel>🔬 Lab Tests</SectionLabel>
            </SectionHeader>

            <ItemSelectionGrid>
              <InputWrapper>
                <Label required>Test</Label>
                <SearchableDropdown
                  value={selectedItem}
                  onChange={handleItemChange}
                  options={loadingItems ? [] : items.map((i) => i.itemName)}
                  placeholder={loadingItems ? "Loading..." : "Select test..."}
                  disabled={loadingItems}
                />
              </InputWrapper>

              <InputWrapper>
                <Label required>Quantity</Label>
                <QuantityControl>
                  <input
                    type="number"
                    value={quantity}
                    min="1"
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value)))
                    }
                    onWheel={(e) => {
                      e.preventDefault();
                      setQuantity((p) =>
                        Math.max(1, p + (e.deltaY > 0 ? -1 : 1)),
                      );
                    }}
                  />
                </QuantityControl>
              </InputWrapper>

              <InputWrapper>
                <Label>Price</Label>
                <Input type="text" value={selectedPrice} readOnly />
              </InputWrapper>

              <AddBtn type="button" onClick={addProduct}>
                + Add Test
              </AddBtn>
            </ItemSelectionGrid>

            {productList.length > 0 ? (
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>Test Name</Th>
                      <Th>Quantity</Th>
                      <Th>Amount</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map((p, i) => (
                      <Tr key={i}>
                        <Td>{p.itemName}</Td>
                        <Td>{p.quantity}</Td>
                        <Td>₹ {(p.price * p.quantity).toFixed(2)}</Td>
                        <Td>
                          <DelBtn
                            type="button"
                            onClick={() => deleteProduct(i)}
                          >
                            🗑 Delete
                          </DelBtn>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            ) : (
              <EmptyState>🔬 No lab tests added yet</EmptyState>
            )}

            {/* ── Summary ─────────────────────────────────────────────── */}
            <SummaryGrid>
              <InputWrapper>
                <Label>Total</Label>
                <Input
                  type="text"
                  value={Number(formData.total).toFixed(2)}
                  readOnly
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Discount (%)</Label>
                <Input
                  type="text"
                  value="0"
                  readOnly
                  disabled
                  style={{ background: "#f1f5f9", color: "#94a3b8" }}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Discount Amount</Label>
                <Input
                  type="text"
                  value="0.00"
                  readOnly
                  disabled
                  style={{ background: "#f1f5f9", color: "#94a3b8" }}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Discount Remarks</Label>
                <Input
                  type="text"
                  value=""
                  readOnly
                  disabled
                  placeholder="N/A for lab"
                  style={{ background: "#f1f5f9", color: "#94a3b8" }}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Net Amount</Label>
                <Input
                  type="text"
                  value={Number(formData.finalPrice).toFixed(2)}
                  readOnly
                  style={{ fontWeight: 700, color: "#16a34a" }}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Payment Method</Label>
                <Input
                  type="text"
                  value="Credit"
                  readOnly
                  style={{
                    background: "#f1f5f9",
                    color: "#16a34a",
                    fontWeight: 600,
                  }}
                />
              </InputWrapper>

              {(formData.customer_type || formData.company_name) && (
                <InputWrapper>
                  <Label>Patient Type</Label>
                  <CompanyInfoText>
                    {formData.customer_type && (
                      <span>🏷 {formData.customer_type}</span>
                    )}
                    {formData.company_name && (
                      <small>🏢 {formData.company_name}</small>
                    )}
                  </CompanyInfoText>
                </InputWrapper>
              )}

              {formData.is_emergency && (
                <InputWrapper>
                  <Label>Case Type</Label>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#dc2626",
                    }}
                  >
                    <span
                      style={{
                        animation: "emergencyBlink 1s step-start infinite",
                        display: "inline-block",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#dc2626",
                      }}
                    />
                    EMERGENCY
                    <style>{`@keyframes emergencyBlink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
                  </div>
                </InputWrapper>
              )}
            </SummaryGrid>

            <ActionRow>
              <ResetBtn type="button" onClick={handleReset}>
                🔄 Reset
              </ResetBtn>
              <SubmitBtn type="submit">💾 Save Lab Bill</SubmitBtn>
            </ActionRow>
          </ProductSection>
        </form>
      </ContentCard>

      {/* ── Print Modal ──────────────────────────────────────────────────── */}
      {printJob && (
        <PrintModal
          bill={printJob.bill}
          doctors={doctors}
          isEstimate={printJob.isEstimate}
          toastMsg={printJob.toastMsg}
          onClose={() => {
            setPrintJob(null);
            navigate(-1);
          }}
        />
      )}
    </PageContainer>
  );
};

export default OTLabBilling;
