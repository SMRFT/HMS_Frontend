import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
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
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid ${colors.primary};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
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
const InlineSearchBtn = styled(Button)`
  margin-top: 3px;
  padding: 3px 10px;
  font-size: 0.75rem;
  height: auto;
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

// ─── Searchable Dropdown Component ───────────────────────────────────────────
const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  displayKey = "name",
  valueKey = "id",
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const isFocused = useRef(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        isFocused.current = false;
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isFocused.current) return;
    if (value) {
      const sel = options.find((o) =>
        typeof o === "string" ? o === value : o[valueKey] === value,
      );
      setSearchTerm(
        sel ? (typeof sel === "string" ? sel : sel[displayKey]) : value,
      );
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  const filtered = options.filter((o) => {
    const dv = typeof o === "string" ? o : o[displayKey];
    return dv.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (option) => {
    const sv = typeof option === "string" ? option : option[valueKey];
    const dv = typeof option === "string" ? option : option[displayKey];
    onChange(sv);
    setSearchTerm(dv);
    setIsOpen(false);
    isFocused.current = false;
  };

  return (
    <DropdownWrapper ref={wrapperRef}>
      <Input
        type="text"
        value={searchTerm}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          isFocused.current = true;
          setIsOpen(true);
        }}
        onBlur={() => {
          isFocused.current = false;
          if (!searchTerm.trim()) onChange("");
        }}
      />
      {isOpen && filtered.length > 0 && (
        <DropdownList>
          {filtered.map((o, i) => (
            <DropdownItem
              key={i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(o)}
            >
              {typeof o === "string" ? o : o[displayKey]}
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
    doctor: "",
    salutation: "",
    firstName: "",
    patientName: "",
    lastName: "",
    age: "",
    gender: "",
    item: JSON.stringify([]),
    referredBy: "",
    total: 0,
    finalPrice: 0,
    paymentMethod: "Credit", // always Credit for lab
    paymentStatus: "Pending",
    customer_type: "",
    company_name: "",
    company_code: "",
    surgeryRef: "", // originating surgery schedule reference
    is_emergency: false,
  });

  const [doctors, setDoctors] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [productList, setProductList] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loadingItems, setLoadingItems] = useState(true);

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
    const fetch = async () => {
      const res = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET");
      if (res.success) setDoctors(res.data);
    };
    fetch();
  }, [HMSURL]);

  // ── Fetch LAB items once on mount (fixed billTypeNo + billType) ────────────
  useEffect(() => {
    const fetch = async () => {
      setLoadingItems(true);
      const res = await apiRequest(
        `${HMSURL}investigation-items/?billTypeNo=${LAB_BILL_TYPE_NO}&billType=${LAB_BILL_TYPE}`,
        "GET",
      );
      if (res.success) setItems(res.data?.items || []);
      setLoadingItems(false);
    };
    fetch();
  }, [HMSURL]);

  // ── Populate form from navigation state ───────────────────────────────────
  useEffect(() => {
    if (!location.state?.patientData) return;
    const d = location.state.patientData;
    setFormData((prev) => ({
      ...prev,
      uhid: d.uhid || "",
      ipNumber: d.ipNumber || "",
      salutation: d.salutation || "",
      firstName: d.firstName || "",
      lastName: d.lastName || "",
      // patient_name from enriched schedule data (full resolved name)
      patientName: d.patient_name || d.firstName || "",
      age: String(d.age || ""),
      gender: d.gender || "",
      // Store raw incoming doctor value (may be a name or an ID)
      // The second effect resolves it against the loaded doctors list
      _rawDoctor: d.doctor || "",
      doctor: "", // resolved by second effect
      referredBy: "", // resolved by second effect
      surgeryRef: d.surgeryRef || "",
      customer_type: d.customer_type || "",
      company_name: d.company_name || "",
      company_code: d.company_code || "",
      is_emergency: !!d.is_emergency,
    }));
  }, [location.state]);

  // ── Resolve doctor name once doctors list loads ────────────────────────────
  // Handles race: location.state fires before doctor_list_diagnostics returns.
  // Also handles the case where surgeon_id (e.g. "60380") was passed instead
  // of surgeon_name — we match against employeeId too.
  useEffect(() => {
    if (!doctors.length) return;
    const raw = formData._rawDoctor;
    if (!raw) return;

    // Try to find by name first, then by employeeId
    const match = doctors.find(
      (d) =>
        d.employeeName.trim() === raw ||
        d.employeeId === raw ||
        String(d.employeeId) === String(raw),
    );

    const resolved = match ? match.employeeName.trim() : raw;
    setFormData((p) => ({ ...p, doctor: resolved, referredBy: resolved }));
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
      billTypeNo: LAB_BILL_TYPE_NO,
      ...(obj?.test_id && { test_id: obj.test_id }),
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

  // ── Patient search ─────────────────────────────────────────────────────────
  const fetchPatientDetails = async () => {
    if (!formData.uhid) {
      alert("Please enter UHID");
      return;
    }
    const res = await apiRequest(
      `${HMSURL}op-patient/${encodeURIComponent(formData.uhid)}/`,
      "GET",
    );
    if (res.success) {
      const d = res.data;
      setFormData((p) => ({
        ...p,
        salutation: d.salutation || "",
        firstName: d.firstName || "",
        lastName: d.lastName || "",
        patientName:
          `${d.salutation || ""} ${d.firstName || ""} ${d.lastName || ""}`.trim(),
        age: String(d.age || ""),
        gender: d.gender || "",
        customer_type: d.customer_type || "",
        company_name: d.company_name || "",
        company_code: d.company_code || "",
      }));
    } else alert(res.error || "Patient not found");
  };

  const fetchIpPatient = async () => {
    if (!formData.ipNumber) {
      alert("Please enter IP Number");
      return;
    }
    const res = await apiRequest(
      `${HMSURL}ip-patient/${encodeURIComponent(formData.ipNumber)}/`,
      "GET",
    );
    if (res.success) {
      const d = res.data;
      setFormData((p) => ({
        ...p,
        uhid: d.uhid || "",
        salutation: d.salutation || "",
        firstName: d.firstName || "",
        lastName: d.lastName || "",
        patientName:
          `${d.salutation || ""} ${d.firstName || ""} ${d.lastName || ""}`.trim(),
        age: String(d.age || ""),
        gender: d.gender || "",
        customer_type: d.customer_type || "",
        company_name: d.company_name || "",
        company_code: d.company_code || "",
      }));
    } else alert(res.error || "Patient not found");
  };

  // ── Auto-calculations ──────────────────────────────────────────────────────
  useEffect(() => {
    const total = productList.reduce(
      (s, i) => s + Number(i.price) * Number(i.quantity),
      0,
    );
    setFormData((p) => ({ ...p, total, finalPrice: total })); // no discount
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
      doctor: formData.doctor,
      bill_type: LAB_BILL_TYPE,
      billTypeNo: LAB_BILL_TYPE_NO,
      referredBy: formData.referredBy,
      discountPercent: 0,
      discount: 0,
      discountRemarks: "",
      total: formData.total,
      finalPrice: formData.finalPrice,
      paymentMethod: "Credit",
      paymentStatus: "Pending",
      item: productList,
      is_emergency: !!formData.is_emergency,
    };

    const res = await apiRequest(`${HMSURL}investBilling/`, "POST", payload);
    if (res.success) {
      const billNo = res.data?.investBillNo;
      if (billNo) {
        handlePrint({ ...formData, investBillNo: billNo, item: productList });
        setTimeout(() => alert("Lab bill generated successfully!"), 100);
      }
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } else {
      alert(`Failed to save lab bill: ${res.error}`);
    }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const printStyles = `
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 10px; }
    .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
    .hospital-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
    .bill-row { display: flex; margin-bottom: 5px; }
    .bill-label { font-weight: bold; width: 130px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #000; padding: 5px; text-align: left; }
    th { background-color: #f2f2f2; }
    .total-section { border-top: 1px solid #000; padding-top: 5px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .total-label { font-weight: bold; }
    .net-amount { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
    .signature { display: flex; justify-content: space-between; margin-top: 30px; }
  `;

  const handlePrint = (bill) => {
    const win = window.open("", "_blank", "height=600,width=800");
    const itemsArr = Array.isArray(bill.item)
      ? bill.item
      : JSON.parse(bill.item || "[]");
    const patName =
      `${bill.salutation || ""} ${bill.firstName || ""} ${bill.lastName || ""}`.trim();
    const itemRows =
      itemsArr
        .map(
          (it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.itemName || ""}</td>
        <td>${it.quantity || 1}</td>
        <td>${parseFloat(it.price).toFixed(2)}</td>
        <td>${(parseFloat(it.price) * parseInt(it.quantity || 1)).toFixed(2)}</td>
      </tr>`,
        )
        .join("") || '<tr><td colspan="5">No Items</td></tr>';

    win.document
      .write(`<!DOCTYPE html><html><head><title>Lab Bill</title><style>${printStyles}</style></head>
    <body>
      <div class="header">
        <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
        <div>51/24. Saradha College Road, Salem - 636007</div>
        <div style="font-weight:bold;margin-top:4px;">LAB REQUEST BILL — Credit</div>
      </div>
      <div style="margin-bottom:12px;">
        <div class="bill-row"><div class="bill-label">Bill Number</div><div>: ${bill.investBillNo || ""}</div></div>
        <div class="bill-row"><div class="bill-label">Surgery Ref</div><div>: ${bill.surgeryRef || "—"}</div></div>
        <div class="bill-row"><div class="bill-label">UHID</div><div>: ${bill.uhid || ""}</div></div>
        <div class="bill-row"><div class="bill-label">IP Number</div><div>: ${bill.ipNumber || ""}</div></div>
        <div class="bill-row"><div class="bill-label">Patient Name</div><div>: ${patName || "—"}</div></div>
        <div class="bill-row"><div class="bill-label">Age / Gender</div><div>: ${bill.age || "—"} / ${bill.gender || "—"}</div></div>
        <div class="bill-row"><div class="bill-label">Doctor</div><div>: ${bill.doctor || ""}</div></div>
        <div class="bill-row"><div class="bill-label">Date</div><div>: ${bill.investBillDate || ""}</div></div>
      </div>
      <table>
        <thead><tr><th>Sl</th><th>Test Name</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div class="total-section">
        <div class="total-row net-amount">
          <div class="total-label">Net Amount (Credit)</div>
          <div>${parseFloat(bill.finalPrice || 0).toFixed(2)}</div>
        </div>
      </div>
      <div class="signature"><div>${bill.uhid || ""}</div><div>(Authorized Signature)</div></div>
      <script>window.onload = () => window.print();</script>
    </body></html>`);
    win.document.close();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      <PageTitle>🧪 Lab Request Billing</PageTitle>

      {/* Navigation */}
      <NavigationLinks>
        <NavLink onClick={() => navigate("/ViewBills")}>📄 View Bills</NavLink>
      </NavigationLinks>

      {/* Surgery reference banner */}
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
                onChange={handleInputChange}
              />
              <InlineSearchBtn type="button" onClick={fetchPatientDetails}>
                🔍 Search
              </InlineSearchBtn>
            </InputWrapper>

            <InputWrapper>
              <Label>IP Number</Label>
              <Input
                type="text"
                name="ipNumber"
                value={formData.ipNumber}
                onChange={handleInputChange}
              />
              <InlineSearchBtn type="button" onClick={fetchIpPatient}>
                🔍 Search
              </InlineSearchBtn>
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
              <Label>Gender</Label>
              <Input type="text" value={formData.gender} readOnly />
            </InputWrapper>

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

          <FormRow>
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

            {/* Bill Type — fixed LAB01, shown as read-only */}
            <InputWrapper>
              <Label>Bill Type</Label>
              <Input
                type="text"
                value={`LAB (${LAB_BILL_TYPE_NO})`}
                readOnly
                style={{
                  background: "#f1f5f9",
                  color: "#1d4ed8",
                  fontWeight: 600,
                }}
              />
            </InputWrapper>

            <InputWrapper>
              <Label required>Doctor</Label>
              <SearchableDropdown
                value={formData.doctor}
                onChange={(v) => setFormData((p) => ({ ...p, doctor: v }))}
                options={doctors.map((d) => ({
                  id: d.employeeName.trim(),
                  name: d.employeeName.trim(),
                }))}
                displayKey="name"
                valueKey="id"
                placeholder="Select doctor..."
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Referred By</Label>
              <SearchableDropdown
                value={formData.referredBy}
                onChange={(v) => setFormData((p) => ({ ...p, referredBy: v }))}
                options={doctors.map((d) => ({
                  id: d.employeeName.trim(),
                  name: d.employeeName.trim(),
                }))}
                displayKey="name"
                valueKey="id"
                placeholder="Select doctor..."
              />
            </InputWrapper>
          </FormRow>

          {/* ── Lab Items ───────────────────────────────────────────────── */}
          <ProductSection>
            <SectionHeader>
              <SectionLabel>🔬 Lab Tests</SectionLabel>
            </SectionHeader>

            <FormRow
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              }}
            >
              <InputWrapper>
                <Label required>Test</Label>
                <SearchableDropdown
                  value={selectedItem}
                  onChange={handleItemChange}
                  options={loadingItems ? [] : items.map((i) => i.itemName)}
                  placeholder={loadingItems ? "Loading..." : "Select test..."}
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
            </FormRow>

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

              {/* Discount fields — disabled, always 0 for lab billing */}
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

              {/* Payment Method — in summary, matching InvestigationBilling */}
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

              {/* Patient Type / Company */}
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

              {/* Emergency flag */}
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
    </PageContainer>
  );
};

export default OTLabBilling;
