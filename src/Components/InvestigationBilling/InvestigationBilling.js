import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import PrintModal from "./PrintModal"; // ← fast in-page print modal
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

// ─── Edit Remarks Banner ──────────────────────────────────────────────────────

const EditRemarksBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #f59e0b;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #92400e;

  strong {
    white-space: nowrap;
  }
`;

// ─── Section header text wrapper ─────────────────────────────────────────────

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

// ─── Items section card ───────────────────────────────────────────────────────

const ProductSection = styled(ContentCard)`
  background: #fafbfc;
  padding: 8px 12px;
`;

// ─── Inline search button below field ────────────────────────────────────────

const InlineSearchBtn = styled(Button)`
  margin-top: 3px;
  padding: 3px 10px;
  font-size: 0.75rem;
  height: auto;
`;

// ─── Add item button ──────────────────────────────────────────────────────────

const AddBtn = styled(Button)`
  background: ${colors.success};
  margin-top: 18px;

  &:hover {
    background: #16a34a;
  }
`;

// ─── Delete button ────────────────────────────────────────────────────────────

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

// ─── Quantity input ───────────────────────────────────────────────────────────

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

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: ${colors.textMuted};
  font-size: 0.82rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-top: 8px;
`;

// ─── Summary grid ─────────────────────────────────────────────────────────────

const SummaryGrid = styled(FormRow)`
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  margin-top: 8px;
  padding: 8px 10px;
  background: #f7f9fc;
  border-radius: 6px;
  border: 1px solid ${colors.border};
`;

// ─── Company info text (blue, no input) ──────────────────────────────────────

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

// ─── Action row ───────────────────────────────────────────────────────────────

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

const EstimateBtn = styled(Button)`
  background: ${colors.secondary};
  &:hover {
    background: #d97706;
  }
`;

const SubmitBtn = styled(Button)`
  background: ${colors.primary};
  &:hover {
    background: ${colors.primaryDark};
  }
`;

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

const InvestigationBilling = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [formData, setFormData] = useState({
    investBillNo: "",
    investBillDate: "",
    time: "",
    uhid: "",
    ipNumber: "",
    doctor: "",
    bill_type: "",
    billTypeNo: "",
    billType: "",
    salutation: "",
    firstName: "",
    lastName: "",
    age: "",
    age_type: "",
    gender: "",
    item: JSON.stringify([]),
    referredBy: "",
    discountPercent: "",
    discount: "",
    discountRemarks: "",
    total: 0,
    finalPrice: 0,
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    customer_type: "",
    company_name: "",
    company_code: "",
    editRemarks: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  const [items, setItems] = useState([]);
  const [isDiscountAllowed, setIsDiscountAllowed] = useState(true);
  const [selectedBillTypeNo, setSelectedBillTypeNo] = useState("");
  const [selectedPackageNo, setSelectedPackageNo] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [productList, setProductList] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);

  // ── Print modal state: { bill, isEstimate, toastMsg } ──────────────────────
  const [printJob, setPrintJob] = useState(null);
  const billTypeInitialized = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isPatientFetched = !!(
    formData.firstName &&
    (formData.uhid || formData.ipNumber)
  );

  // ── Initialization ──────────────────────────────────────────────────────────

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      const s = now.getSeconds().toString().padStart(2, "0");
      setFormData((prev) => ({
        ...prev,
        investBillDate: today,
        time: `${h}:${m}:${s}`,
      }));
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchBillTypes = async () => {
      const result = await apiRequest(`${HMSURL}bill-types/`, "GET");
      if (result.success) {
        const normalized = (result.data.billTypes || []).map((bt) => ({
          ...bt,
          billTypeNo: bt.billTypeNo ?? bt.BillTypeNo ?? 0,
        }));
        setBillTypes(normalized);
      }
    };
    fetchBillTypes();
  }, [HMSURL]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const result = await apiRequest(
        `${HMSURL}doctor_list_diagnostics/`,
        "GET",
      );
      if (result.success) setDoctors(result.data);
    };
    fetchDoctors();
  }, [HMSURL]);

  // ── Handle incoming navigation data ────────────────────────────────────────

  useEffect(() => {
    if (!location.state?.patientData) return;
    const data = location.state.patientData;
    const isEstimate = data.EstBillNo !== undefined;

    setIsEditMode(Boolean(data.investBillNo) && Boolean(data.editRemarks));

    let itemsArray = [];
    if (typeof data.item === "string") {
      try {
        let parsed = JSON.parse(data.item);
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
        itemsArray = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        itemsArray = [];
      }
    } else if (Array.isArray(data.item)) {
      itemsArray = data.item;
    }

    const resolvedBillName = data.bill_name || data.billType || "";

    setFormData({
      investBillNo: isEstimate ? "" : data.investBillNo || "",
      investBillDate: data.EstBillDate || data.investBillDate || "",
      time: data.time || "",
      uhid: data.uhid || "",
      ipNumber: data.ipNumber || "",
      doctor: data.doctor || "",
      bill_type: data.bill_type || "",
      billTypeNo: data.billTypeNo || "",
      billType: resolvedBillName,
      salutation: data.salutation || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      age: data.age || "",
      gender: data.gender || "",
      referredBy: data.referredBy || "",
      discountPercent: data.discountPercent || "",
      discount: data.discount || "",
      discountRemarks: data.discountRemarks || "",
      total: data.total || 0,
      finalPrice: data.finalPrice || 0,
      paymentMethod: data.paymentMethod || "Cash",
      paymentStatus: "Pending",
      item: JSON.stringify(itemsArray),
      EstBillNo: data.EstBillNo || "",
      customer_type: data.customer_type || "",
      company_name: data.company_name || "",
      company_code: data.company_code || "",
      editRemarks: data.editRemarks || "",
      calculatedAge: data.calculatedAge || String(data.age || ""),
      ageType: data.ageType || data.age_type || "",
    });

    setProductList(itemsArray);

    if (data.dob) {
      const { calculatedAge, ageType } = calculateAgeFromDOB(data.dob);
      setFormData((prev) => ({ ...prev, calculatedAge, ageType }));
    }
  }, [location.state]); // eslint-disable-line

  useEffect(() => {
    if (!location.state?.patientData) return;
    if (!billTypes.length) return;
    if (billTypeInitialized.current) return; // ← bail if already ran
    billTypeInitialized.current = true; // ← mark as done

    const data = location.state.patientData;

    const bt =
      (data.bill_type &&
        billTypes.find(
          (b) => String(b.bill_type) === String(data.bill_type),
        )) ||
      (data.bill_name &&
        billTypes.find((b) => b.bill_name === data.bill_name)) ||
      (data.billType && billTypes.find((b) => b.bill_name === data.billType)) ||
      (data.billTypeNo &&
        billTypes.find((b) => b.billTypeNo === data.billTypeNo));

    if (bt) {
      const billTypeNo = bt.billTypeNo ?? bt.BillTypeNo ?? 0;
      handleBillTypeChange(
        bt.bill_name,
        bt.bill_type,
        billTypeNo,
        bt.is_allowDiscount ?? true,
      );
    }
  }, [billTypes, location.state]); // eslint-disable-line

  // ── Bill type & item handlers ───────────────────────────────────────────────

  const handleBillTypeChange = async (
    billName,
    billType,
    billTypeNo,
    allowDiscount = true,
  ) => {
    setIsDiscountAllowed(allowDiscount);
    setFormData((prev) => ({
      ...prev,
      billType: billName,
      bill_type: billType,
      billTypeNo: billTypeNo,
      ...(!allowDiscount && {
        discountPercent: "",
        discount: "",
        discountRemarks: "",
      }),
    }));
    setSelectedBillTypeNo(billTypeNo);
    setSelectedPackageNo("");

    if (billTypeNo === "PACK") {
      const result = await apiRequest(`${HMSURL}packages/`, "GET");
      if (result.success) setPackages(result.data.packages || []);
      else setPackages([]);
      setItems([]);
      setSelectedItem("");
      setSelectedPrice("");
      return;
    }

    setPackages([]);
    const result = await apiRequest(
      `${HMSURL}investigation-items/?billTypeNo=${billTypeNo}&billType=${billType}`,
      "GET",
    );
    if (result.success) setItems(result.data.items || []);
    else setItems([]);
    setSelectedItem("");
    setSelectedPrice("");
  };

  const handlePackageChange = async (packageName) => {
    const selectedPackage = packages.find(
      (pkg) => pkg.packageName === packageName,
    );
    if (!selectedPackage) {
      setSelectedPackageNo("");
      return;
    }
    setSelectedPackageNo(selectedPackage.packageNo);

    const result = await apiRequest(
      `${HMSURL}package-items/?packageNo=${selectedPackage.packageNo}`,
      "GET",
    );
    if (result.success) {
      const packageItems = result.data.items || [];
      const packageTotalPrice = result.data.totalPrice || "0.00";
      if (packageItems.length > 0) {
        const updatedList = [...productList, ...packageItems];
        setProductList(updatedList);
        setFormData((prev) => ({
          ...prev,
          item: JSON.stringify(updatedList),
          total: parseFloat(packageTotalPrice),
        }));
      }
    }
  };

  const handleItemChange = (selectedItemName) => {
    setSelectedItem(selectedItemName);
    const obj = items.find((item) => item.itemName === selectedItemName);
    setSelectedPrice(obj ? obj.price : "");
  };

  // ── Product list management ─────────────────────────────────────────────────

  const addProduct = () => {
    if (selectedItem && selectedPrice) {
      const obj = items.find((item) => item.itemName === selectedItem);
      const newProduct = {
        itemName: selectedItem,
        price: selectedPrice,
        quantity: quantity,
        billTypeNo: formData.billTypeNo,
        ...(obj?.test_id && { test_id: obj.test_id }),
        ...(obj?.item_id && { item_id: obj.item_id }),
      };
      const updatedList = [...productList, newProduct];
      setProductList(updatedList);
      setFormData((prev) => ({ ...prev, item: JSON.stringify(updatedList) }));
      setSelectedItem("");
      setSelectedPrice("");
      setQuantity(1);
    }
  };

  const deleteProduct = (index) => {
    const updatedList = productList.filter((_, i) => i !== index);
    setProductList(updatedList);
    setFormData((prev) => ({ ...prev, item: JSON.stringify(updatedList) }));
  };

  // ── Patient search ──────────────────────────────────────────────────────────

  const fetchPatientDetails = async () => {
    if (!formData.uhid) {
      alert("Please enter UHID");
      return;
    }
    const result = await apiRequest(
      `${HMSURL}op-patient/${encodeURIComponent(formData.uhid)}/`,
      "GET",
    );
    if (result.success) {
      const data = result.data;
      const { calculatedAge, ageType } = calculateAgeFromDOB(data.dob);
      setFormData((prev) => ({
        ...prev,
        salutation: data.salutation || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        dob: data.dob || "",
        calculatedAge,
        ageType,
        gender: data.gender || "",
        customer_type: data.customer_type || "",
        company_name: data.company_name || "",
        company_code: data.company_code || "",
        roomNo: "",
      }));
    } else {
      alert(result.error || "Patient not found");
    }
  };

  const fetchIpPatient = async () => {
    if (!formData.ipNumber) {
      alert("Please enter IP Number");
      return;
    }
    const result = await apiRequest(
      `${HMSURL}ip-patient/${encodeURIComponent(formData.ipNumber)}/`,
      "GET",
    );
    if (result.success) {
      const data = result.data;
      const { calculatedAge, ageType } = calculateAgeFromDOB(data.dob);
      setFormData((prev) => ({
        ...prev,
        uhid: data.uhid || "",
        salutation: data.salutation || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        dob: data.dob || "",
        calculatedAge,
        ageType,
        gender: data.gender || "",
        customer_type: data.customer_type || "",
        company_name: data.company_name || "",
        company_code: data.company_code || "",
        roomNo: data.roomNo || "",
      }));
    } else {
      alert(result.error || "Patient not found");
    }
  };

  // ── Form actions ────────────────────────────────────────────────────────────

  const handleReset = () => {
    navigate(location.pathname, { replace: true, state: {} });
    window.location.reload();
  };

  const validateForm = () => {
    if (!formData.doctor?.trim()) {
      alert("Doctor is required!");
      return false;
    }
    if (!formData.referredBy?.trim()) {
      alert("Referred By is required!");
      return false;
    }
    if (!formData.total || parseFloat(formData.total) <= 0) {
      alert("Total amount is required!");
      return false;
    }
    if (!formData.finalPrice || parseFloat(formData.finalPrice) <= 0) {
      alert("Final Price is required!");
      return false;
    }
    if (!formData.paymentMethod?.trim()) {
      alert("Payment Method is required!");
      return false;
    }
    if (!productList?.length) {
      alert("Please add at least one item!");
      return false;
    }
    if (isEditMode && !formData.editRemarks?.trim()) {
      alert("Edit Remarks is required!");
      return false;
    }
    return true;
  };

  // ── Build patient-identity fields for submission ───────────────────────────
  // When the patient was fetched via UHID/IP search, the backend already has
  // salutation/firstName/lastName/gender on record (looked up via uhid /
  // ipNumber), so we omit these from the payload entirely to avoid storing
  // stale/duplicate copies. When the user typed them manually (no UHID/IP
  // match), we still send them since they're the only source of truth.
  const getPatientIdentityFields = () => {
    if (isPatientFetched) return {};
    return {
      salutation: formData.salutation || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      gender: formData.gender || "",
    };
  };

  const handleEstimate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formPayload = {
      EstBillNo: formData.investBillNo,
      uhid: formData.uhid,
      ipNumber: formData.ipNumber,
      doctor: formData.doctor,
      bill_type: formData.bill_type,
      billTypeNo: formData.billTypeNo,
      referredBy: formData.referredBy,
      discountPercent: formData.discountPercent
        ? parseFloat(formData.discountPercent)
        : 0,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      discountRemarks: formData.discountRemarks,
      total: formData.total,
      finalPrice: formData.finalPrice,
      paymentMethod: formData.paymentMethod,
      item: productList,
      age: formData.calculatedAge || formData.age || "",
      age_type: formData.ageType || "",
      roomNo: formData.roomNo || "",
      ...getPatientIdentityFields(),
    };

    const result = await apiRequest(
      `${HMSURL}estimateBilling/`,
      "POST",
      formPayload,
    );
    if (result.success) {
      const estBillNo = result.data?.EstBillNo;
      if (estBillNo) {
        // ── Open print modal with an in-modal toast instead of alert(). ──
        // ── The modal stays open until the user explicitly closes it — ──
        // ── form reset/reload happens on that close, not on a timer.  ──
        setPrintJob({
          bill: {
            ...formData,
            EstBillNo: estBillNo,
            EstBillDate: formData.investBillDate,
            item: productList,
          },
          isEstimate: true,
          toastMsg: "Estimate generated successfully!",
        });
      } else {
        alert(
          "Estimate generated but estimate number not received from server!",
        );
      }
    } else {
      alert(`Failed to save estimate: ${result.error}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formPayload = {
      investBillNo: formData.investBillNo,
      uhid: formData.uhid,
      ipNumber: formData.ipNumber,
      doctor: formData.doctor,
      bill_type: formData.bill_type,
      billTypeNo: formData.billTypeNo,
      referredBy: formData.referredBy,
      discountPercent: formData.discountPercent
        ? parseFloat(formData.discountPercent)
        : 0,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      discountRemarks: formData.discountRemarks,
      total: formData.total,
      finalPrice: formData.finalPrice,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      item: productList,
      is_emergency: !!formData.is_emergency,
      EstBillNo: formData.EstBillNo,
      age: formData.calculatedAge || formData.age || "",
      age_type: formData.ageType || "",
      roomNo: formData.roomNo || "",
      ...getPatientIdentityFields(),
      ...(isEditMode && formData.editRemarks
        ? { editRemarks: formData.editRemarks }
        : {}),
    };

    const result = await apiRequest(
      `${HMSURL}investBilling/`,
      "POST",
      formPayload,
    );
    if (result.success) {
      const billNo = result.data?.investBillNo;
      if (billNo) {
        // ── Open print modal with an in-modal toast instead of alert(). ──
        // ── The modal stays open until the user explicitly closes it — ──
        // ── form reset/reload happens on that close, not on a timer.  ──
        setPrintJob({
          bill: {
            ...formData,
            investBillNo: billNo,
            investBillDate: formData.investBillDate,
            item: productList,
          },
          isEstimate: false,
          toastMsg: "Bill generated successfully!",
        });
      } else {
        alert("Bill generated but bill number not received from server!");
      }
    } else {
      alert(`Failed to save bill: ${result.error}`);
    }
  };

  // ── Automatic calculations ──────────────────────────────────────────────────

  useEffect(() => {
    const totalPrice = productList.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0,
    );
    setFormData((prev) => ({ ...prev, total: totalPrice }));
  }, [productList]);

  useEffect(() => {
    const discountAmount = (formData.total * formData.discountPercent) / 100;
    const calculatedFinalPrice = formData.total - discountAmount;
    setFormData((prev) => ({
      ...prev,
      discount: discountAmount.toFixed(2),
      finalPrice: calculatedFinalPrice.toFixed(2),
    }));
  }, [formData.total, formData.discountPercent]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === "file" ? files[0] : type === "checkbox" ? checked : value,
      };
      if (name === "paymentMethod") updated.paymentStatus = "Pending";
      return updated;
    });
  };

  const calculateAgeFromDOB = (dob) => {
    if (!dob) return { calculatedAge: "", ageType: "" };

    const birth = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years >= 1) return { calculatedAge: `${years}`, ageType: "Y" };
    if (months >= 1) return { calculatedAge: `${months}`, ageType: "M" };
    return { calculatedAge: `${days}`, ageType: "D" };
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <PageTitle>💉 Investigation Billing</PageTitle>

      <NavigationLinks>
        <NavLink onClick={() => navigate("/ViewEstimate")}>
          📊 View Estimate
        </NavLink>
        <NavLink onClick={() => navigate("/ViewBills")}>📄 View Bills</NavLink>
      </NavigationLinks>

      {/* ── Edit mode banner showing the remarks ── */}
      {isEditMode && formData.editRemarks && (
        <EditRemarksBanner>
          <span>✏️</span>
          <div>
            <strong>Edit Mode — Remarks:</strong> {formData.editRemarks}
          </div>
        </EditRemarksBanner>
      )}

      <ContentCard>
        <form onSubmit={handleSubmit}>
          {/* ── Patient Information ── */}
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
              <Label>Salutation</Label>
              <Input
                type="text"
                name="salutation"
                value={formData.salutation}
                onChange={handleInputChange}
                readOnly={isPatientFetched}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>First Name</Label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                readOnly={isPatientFetched}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Last Name</Label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                readOnly={isPatientFetched}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>DOB</Label>
              <Input
                type="date"
                name="dob"
                value={formData.dob || ""}
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value) {
                    const { calculatedAge, ageType } = calculateAgeFromDOB(
                      e.target.value,
                    );
                    setFormData((prev) => ({
                      ...prev,
                      calculatedAge,
                      ageType,
                    }));
                  }
                }}
                readOnly={isPatientFetched}
                disabled={!formData.uhid && !formData.ipNumber}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Age</Label>
              <Input
                type="text"
                name="calculatedAge"
                value={formData.calculatedAge || formData.age || ""}
                onChange={handleInputChange}
                readOnly={isPatientFetched}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Age Type</Label>
              <Select
                name="ageType"
                value={formData.ageType || ""}
                onChange={handleInputChange}
                disabled={isPatientFetched}
              >
                <option value="">Select</option>
                <option value="Y">Years</option>
                <option value="M">Months</option>
                <option value="D">Days</option>
              </Select>
            </InputWrapper>

            <InputWrapper>
              <Label>Gender</Label>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={isPatientFetched}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </InputWrapper>

            {formData.ipNumber && formData.roomNo && (
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
          </FormRow>

          {/* ── Billing Details ── */}
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

            <InputWrapper>
              <Label required>Bill Type</Label>
              <SearchableDropdown
                value={formData.billType}
                onChange={(billName) => {
                  if (!billName) {
                    // ← This is what's missing. Clear all bill type state.
                    setFormData((prev) => ({
                      ...prev,
                      billType: "",
                      bill_type: "",
                      billTypeNo: "",
                      discountPercent: "",
                      discount: "",
                      discountRemarks: "",
                    }));
                    setSelectedBillTypeNo("");
                    setSelectedPackageNo("");
                    setItems([]);
                    setPackages([]);
                    setSelectedItem("");
                    setSelectedPrice("");
                    setIsDiscountAllowed(true);
                    return;
                  }
                  const bt = billTypes.find((b) => b.bill_name === billName);
                  if (bt) {
                    const billTypeNo = bt.billTypeNo ?? bt.BillTypeNo ?? 0;
                    handleBillTypeChange(
                      bt.bill_name,
                      bt.bill_type,
                      billTypeNo,
                      bt.is_allowDiscount ?? true,
                    );
                  }
                }}
                options={billTypes.map((bt) => bt.bill_name)}
                placeholder="Select bill type..."
              />
            </InputWrapper>

            {selectedBillTypeNo === "PACK" && (
              <InputWrapper>
                <Label required>Package</Label>
                <SearchableDropdown
                  value={
                    packages.find((pkg) => pkg.packageNo === selectedPackageNo)
                      ?.packageName || ""
                  }
                  onChange={handlePackageChange}
                  options={packages.map((pkg) => pkg.packageName)}
                  placeholder="Select package..."
                />
              </InputWrapper>
            )}

            <InputWrapper>
              <Label required>Doctor</Label>
              <SearchableDropdown
                value={formData.doctor}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, doctor: value }))
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
              <Label required>Referred By</Label>
              <SearchableDropdown
                value={formData.referredBy}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, referredBy: value }))
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
          </FormRow>

          {/* ── Investigation Items ── */}
          <ProductSection>
            <SectionHeader>
              <SectionLabel>
                🔬{" "}
                {selectedBillTypeNo === "PACK"
                  ? "Package Items"
                  : "Investigation Items"}
              </SectionLabel>
            </SectionHeader>

            {selectedBillTypeNo !== "PACK" && (
              <FormRow
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                <InputWrapper>
                  <Label required>Item</Label>
                  <SearchableDropdown
                    value={selectedItem}
                    onChange={handleItemChange}
                    options={items.map((item) => item.itemName)}
                    placeholder="Select item..."
                    disabled={!selectedBillTypeNo}
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
                        setQuantity((prev) =>
                          Math.max(1, prev + (e.deltaY > 0 ? -1 : 1)),
                        );
                      }}
                    />
                  </QuantityControl>
                </InputWrapper>

                <InputWrapper>
                  <Label required>Price</Label>
                  <Input type="text" value={selectedPrice} readOnly />
                </InputWrapper>

                <AddBtn type="button" onClick={addProduct}>
                  + Add Item
                </AddBtn>
              </FormRow>
            )}

            {productList.length > 0 ? (
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>Product</Th>
                      <Th>Quantity</Th>
                      <Th>Price</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map((product, index) => (
                      <Tr key={index}>
                        <Td>{product.itemName}</Td>
                        <Td>{product.quantity}</Td>
                        <Td>
                          ₹ {(product.price * product.quantity).toFixed(2)}
                        </Td>
                        <Td>
                          <DelBtn
                            type="button"
                            onClick={() => deleteProduct(index)}
                            disabled={selectedBillTypeNo === "PACK"}
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
              <EmptyState>📋 No items added yet</EmptyState>
            )}

            {/* ── Summary & Payment ── */}
            <SummaryGrid>
              <InputWrapper>
                <Label>Total</Label>
                <Input
                  type="text"
                  name="total"
                  value={formData.total}
                  readOnly
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Discount (%)</Label>
                <Input
                  type="text"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleInputChange}
                  disabled={!isDiscountAllowed}
                  placeholder={!isDiscountAllowed ? "Not allowed" : ""}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Discount Amount</Label>
                <Input
                  type="text"
                  name="discount"
                  value={formData.discount}
                  readOnly
                  disabled={!isDiscountAllowed}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Discount Remarks</Label>
                <Input
                  type="text"
                  name="discountRemarks"
                  value={formData.discountRemarks}
                  onChange={handleInputChange}
                  disabled={!isDiscountAllowed}
                  placeholder={!isDiscountAllowed ? "Not allowed" : ""}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Final Price</Label>
                <Input
                  type="text"
                  name="finalPrice"
                  value={formData.finalPrice}
                  readOnly
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

              <InputWrapper>
                <Label required>Payment Method</Label>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit</option>
                </Select>
              </InputWrapper>
            </SummaryGrid>

            <ActionRow>
              <ResetBtn type="button" onClick={handleReset}>
                🔄 Reset
              </ResetBtn>
              <EstimateBtn type="button" onClick={handleEstimate}>
                📊 Make Estimate
              </EstimateBtn>
              <SubmitBtn type="submit">
                {isEditMode ? "💾 Update Bill" : "💾 Save Bill"}
              </SubmitBtn>
            </ActionRow>
          </ProductSection>
        </form>
      </ContentCard>

      {/* ── Fast in-page print modal (replaces window.open) ── */}
      {/* Reset/reload only happens when the user explicitly closes the  */}
      {/* modal (× or "Close & Reset") — never on an automatic timer, so */}
      {/* the modal can't disappear out from under the user.            */}
      {printJob && (
        <PrintModal
          bill={printJob.bill}
          doctors={doctors}
          isEstimate={printJob.isEstimate}
          toastMsg={printJob.toastMsg}
          onClose={() => {
            setPrintJob(null);
            if (!printJob.isEstimate) {
              navigate(location.pathname, { replace: true, state: {} });
            }
            window.location.reload();
          }}
        />
      )}
    </PageContainer>
  );
};

export default InvestigationBilling;
