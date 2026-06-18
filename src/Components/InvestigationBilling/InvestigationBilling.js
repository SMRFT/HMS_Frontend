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
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const isTyping = useRef(false); // ← track if user is actively typing

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        isTyping.current = false;
        setIsOpen(false);
        if (value) {
          const selected = options.find((opt) =>
            typeof opt === "string" ? opt === value : opt[valueKey] === value,
          );
          setSearchTerm(
            selected
              ? typeof selected === "string"
                ? selected
                : selected[displayKey]
              : value,
          );
        } else {
          setSearchTerm("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options, displayKey, valueKey]);

  // Sync display text only when NOT typing
  useEffect(() => {
    if (isTyping.current) return; // ← skip sync while user is typing
    if (value) {
      const selected = options.find((opt) =>
        typeof opt === "string" ? opt === value : opt[valueKey] === value,
      );
      setSearchTerm(
        selected
          ? typeof selected === "string"
            ? selected
            : selected[displayKey]
          : value,
      );
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  const filteredOptions = options.filter((opt) => {
    const dv = typeof opt === "string" ? opt : opt[displayKey];
    return dv.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (option) => {
    const sv = typeof option === "string" ? option : option[valueKey];
    const dv = typeof option === "string" ? option : option[displayKey];
    isTyping.current = false;
    onChange(sv);
    setSearchTerm(dv);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    isTyping.current = true; // ← mark as typing so useEffect won't override
    setSearchTerm(val);
    setIsOpen(true);
    if (val === "") {
      isTyping.current = false; // ← allow sync again once fully cleared
      onChange("");
    }
  };

  return (
    <DropdownWrapper ref={wrapperRef}>
      <Input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {isOpen && filteredOptions.length > 0 && (
        <DropdownList>
          {filteredOptions.map((option, index) => (
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
    editRemarks: "", // ← new field
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
  // Whether this session is an edit (has existing investBillNo + editRemarks)
  const [isEditMode, setIsEditMode] = useState(false);
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
  // Split into two effects:
  //   1) Load form fields as soon as navigation state arrives
  //   2) Trigger handleBillTypeChange only after billTypes are fetched
  //      (fixes the race where billTypes = [] on first render)

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

    // bill_name is set by BillsReport (resolved from DB).
    // billType is what was stored on the investbilling doc directly.
    // Use whichever is available so the dropdown can display correctly.
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
      calculatedAge: data.calculatedAge || String(data.age || ""), // ← add
      ageType: data.ageType || data.age_type || "", // ← add
    });

    setProductList(itemsArray);

    // Recalculate from DOB if available, otherwise keep stored values
    if (data.dob) {
      const { calculatedAge, ageType } = calculateAgeFromDOB(data.dob);
      setFormData((prev) => ({ ...prev, calculatedAge, ageType }));
    }
  }, [location.state]); // eslint-disable-line

  // ── Trigger bill type fetch once billTypes list has loaded ─────────────────
  // This solves the race condition: location.state fires before the
  // bill-types API response arrives, so billTypes is [] at that point.
  // By watching [billTypes, location.state] we retry as soon as both exist.

  useEffect(() => {
    if (!location.state?.patientData) return;
    if (!billTypes.length) return;

    const data = location.state.patientData;

    // Match by bill_type (numeric id), billTypeNo, or bill name
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
    // In edit mode, remarks must be present (already enforced by BillsReport modal,
    // but guard here too for safety)
    if (isEditMode && !formData.editRemarks?.trim()) {
      alert("Edit Remarks is required!");
      return false;
    }
    return true;
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
      age: formData.calculatedAge || "", // ← add
      age_type: formData.ageType || "",
      roomNo: formData.roomNo || "",
      salutation: formData.salutation || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      age: formData.calculatedAge || formData.age || "",
      age_type: formData.ageType || "",
      gender: formData.gender || "",
    };

    const result = await apiRequest(
      `${HMSURL}estimateBilling/`,
      "POST",
      formPayload,
    );
    if (result.success) {
      const estBillNo = result.data?.EstBillNo;
      if (estBillNo) {
        handleEstimatePrint({
          ...formData,
          EstBillNo: estBillNo,
          EstBillDate: formData.investBillDate,
          item: productList,
        });
        setTimeout(() => alert("Estimate generated successfully!"), 100);
      } else {
        alert(
          "Estimate generated but estimate number not received from server!",
        );
      }
      setTimeout(() => window.location.reload(), 2000);
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
      age: formData.calculatedAge || "", // ← add
      age_type: formData.ageType || "",
      roomNo: formData.roomNo || "",
      salutation: formData.salutation || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      age: formData.calculatedAge || formData.age || "",
      age_type: formData.ageType || "",
      gender: formData.gender || "",
      // ── Include editRemarks only when editing ──
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
        handlePrint({
          ...formData,
          investBillNo: billNo,
          investBillDate: formData.investBillDate,
          item: productList,
        });
        setTimeout(() => alert("Bill generated successfully!"), 100);
      } else {
        alert("Bill generated but bill number not received from server!");
      }
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
        window.location.reload();
      }, 2000);
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

  // ── Print helpers ───────────────────────────────────────────────────────────

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatTimeTo12Hr = (timeStr) => {
    if (!timeStr) return "";
    const [hourStr, minuteStr, secondStr] = timeStr.split(":");
    let hours = parseInt(hourStr);
    const minutes = minuteStr || "00";
    const seconds = secondStr || "00";
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
  };

  const formatPatientName = (salutation, firstName, middleName, lastName) =>
    `${salutation || ""} ${firstName || ""} ${middleName ? middleName + " " : ""}${lastName || ""}`.trim();

  const resolveItems = (item) => {
    if (typeof item === "string") {
      try {
        return JSON.parse(item);
      } catch {
        return [];
      }
    }
    return Array.isArray(item) ? item : [];
  };

  const buildItemRows = (itemsArray) =>
    itemsArray.length > 0
      ? itemsArray
          .map(
            (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.itemName || ""}</td>
          <td>${item.quantity || 1}</td>
          <td>${parseFloat(item.price).toFixed(2)}</td>
          <td>${(parseFloat(item.price) * parseInt(item.quantity || 1)).toFixed(2)}</td>
        </tr>`,
          )
          .join("")
      : '<tr><td colspan="5">No Items</td></tr>';

  const printStyles = `
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 10px; }
    .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
    .hospital-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
    .bill-title { font-weight: bold; display: inline-block; margin-right: 10px; }
    .bill-subtitle { font-weight: bold; display: inline-block; margin-left: 10px; }
    .bill-details { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .bill-details-left { width: 48%; }
    .bill-row { display: flex; margin-bottom: 5px; }
    .bill-label { font-weight: bold; width: 120px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #000; padding: 5px; text-align: left; }
    th { background-color: #f2f2f2; }
    .total-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .total-label { font-weight: bold; }
    .net-amount { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
    .signature { display: flex; justify-content: space-between; margin-top: 30px; }
  `;
  const resolveEmployeeName = (idOrName) => {
    if (!idOrName) return "";
    if (idOrName === "SELF") return "SELF";
    const found = doctors.find(
      (d) => String(d.employeeId) === String(idOrName),
    );
    return found ? found.employeeName.trim() : idOrName;
  };
  const handlePrint = (bill) => {
    const printWindow = window.open("", "_blank", "height=600,width=800");
    const itemsArray = resolveItems(bill.item);
    const html = `<!DOCTYPE html><html><head><title>Bill Print</title><style>${printStyles}</style></head>
      <body>
        <div class="header">
          <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
          <div>51/24.Saradha College Road, Salem - 636007</div>
          <div>CIN: U85110TZ20PLC033974</div>
        </div>
        <div><span class="bill-title">"${bill.paymentMethod || "NIL"}"</span><span class="bill-subtitle">${bill.billType || "NIL"}</span></div>
        <div class="bill-details">
          <div class="bill-details-left">
            <div class="bill-row"><div class="bill-label">Bill Number</div><div>: ${bill.investBillNo || ""}</div></div>
            <div class="bill-row"><div class="bill-label">OP Number</div><div>: ${bill.uhid || ""}</div></div>
            <div class="bill-row"><div class="bill-label">Bill Date</div><div>: ${formatDateTime(bill.investBillDate)}, ${formatTimeTo12Hr(bill.time)}</div></div>
            <div class="bill-row"><div class="bill-label">Name/Age/Gender</div><div>: ${formatPatientName(bill.salutation, bill.firstName, bill.middleName, bill.lastName)} / ${bill.calculatedAge || bill.age || ""}${bill.ageType || "Y"} / ${bill.gender}</div></div>
            <div class="bill-row"><div class="bill-label">Doctor</div><div>: ${resolveEmployeeName(bill.doctor)}</div></div>
          </div>
        </div>
        <table><thead><tr><th>SlNo</th><th>Description</th><th>Qty</th><th>Cost</th><th>Amount</th></tr></thead>
        <tbody>${buildItemRows(itemsArray)}</tbody></table>
        <div class="total-section">
          <div class="total-row"><div class="total-label">Total</div><div>${parseFloat(bill.total || 0).toFixed(2)}</div></div>
          <div class="total-row"><div class="total-label">Discount</div><div>${bill.discount || "0.00"}</div></div>
          <div class="total-row net-amount"><div class="total-label">Net Amount</div><div>${bill.finalPrice || "0.00"}</div></div>
        </div>
        <div class="signature"><div>${localStorage.getItem("employeeId")}</div><div>(Signature)</div></div>
      </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleEstimatePrint = (estimate) => {
    const printWindow = window.open("", "_blank", "height=600,width=800");
    const itemsArray = resolveItems(estimate.item);
    const html = `<!DOCTYPE html><html><head><title>Estimate Print</title><style>${printStyles}</style></head>
      <body>
        <div class="header">
          <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
          <div>51/24.Saradha College Road, Salem - 636007</div>
        </div>
        <div style="text-align:center;font-weight:bold;color:#d97706;margin:8px 0;">*** ESTIMATE BILL ***</div>
        <div class="bill-details">
          <div class="bill-details-left">
            <div class="bill-row"><div class="bill-label">Estimate No</div><div>: ${estimate.EstBillNo || ""}</div></div>
            <div class="bill-row"><div class="bill-label">OP Number</div><div>: ${estimate.uhid || ""}</div></div>
            <div class="bill-row"><div class="bill-label">Date</div><div>: ${formatDateTime(estimate.EstBillDate)}, ${formatTimeTo12Hr(estimate.time)}</div></div>
            <div class="bill-row"><div class="bill-label">Name/Age/Gender</div><div>: ${formatPatientName(estimate.salutation, estimate.firstName, estimate.middleName, estimate.lastName)} / ${estimate.calculatedAge || estimate.age || ""}${estimate.ageType || "Y"} / ${estimate.gender}</div></div>
            <div class="bill-row"><div class="bill-label">Doctor</div><div>: ${resolveEmployeeName(estimate.doctor)}</div></div>
          </div>
        </div>
        <table><thead><tr><th>SlNo</th><th>Description</th><th>Qty</th><th>Cost</th><th>Amount</th></tr></thead>
        <tbody>${buildItemRows(itemsArray)}</tbody></table>
        <div class="total-section">
          <div class="total-row"><div class="total-label">Total</div><div>${parseFloat(estimate.total || 0).toFixed(2)}</div></div>
          <div class="total-row"><div class="total-label">Discount</div><div>${estimate.discount || "0.00"}</div></div>
          <div class="total-row net-amount"><div class="total-label">Estimated Net Amount</div><div>${estimate.finalPrice || "0.00"}</div></div>
        </div>
        <div style="margin-top:12px;padding:8px;background:#fffbeb;border-left:3px solid #d97706;font-style:italic;font-size:11px;">
          <strong>Note:</strong> This is an estimate. Final charges may vary.
        </div>
        <div class="signature"><div>${localStorage.getItem("employeeId")}</div><div>(Authorized Signature)</div></div>
      </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
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
                onChange={handleInputChange} // ← was readOnly
                readOnly={isPatientFetched}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>First Name</Label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange} // ← was readOnly
                readOnly={isPatientFetched}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Last Name</Label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange} // ← was readOnly
                readOnly={isPatientFetched}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>DOB</Label>
              <Input
                type="date" // ← change text to date for usability
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
                disabled={!formData.uhid && !formData.ipNumber} // ← disable when no UHID/IP
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Age</Label>
              <Input
                type="text"
                name="calculatedAge"
                value={formData.calculatedAge || formData.age || ""}
                onChange={handleInputChange} // ← was readOnly
                readOnly={isPatientFetched}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Age Type</Label>
              <Select
                name="ageType"
                value={formData.ageType || ""}
                onChange={handleInputChange} // ← was readOnly Input
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
                onChange={handleInputChange} // ← was readOnly
                disabled={isPatientFetched}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </InputWrapper>
            {/* ← add this block right after Gender */}
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
                    id: d.employeeId, // ← store employeeId
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
                    id: d.employeeId, // ← store employeeId
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

              {/* Company info — blue text only, no input box */}
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
    </PageContainer>
  );
};

export default InvestigationBilling;
