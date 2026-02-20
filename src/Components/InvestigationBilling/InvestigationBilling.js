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
} from "../GlobalStyles"; // ← adjust path to match your project structure

// ─── Local overrides / components not in GlobalStyles ────────────────────────

const PageContainer = styled(PageWrapper)`
  background: linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%);
  padding: 2rem;
  position: relative;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  &::before {
    content: "💉";
    font-size: 2.5rem;
  }
`;

const NavigationLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const NavLink = styled.span`
  color: #00897b;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;

  &:hover {
    background: linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%);
    transform: translateY(-2px);
  }
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: -1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 100%;
    background: linear-gradient(180deg, #00897b 0%, #00695c 100%);
    border-radius: 3px;
  }
`;

// FormGrid uses GlobalStyles' FormRow as base
const FormGrid = styled(FormRow)`
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 2rem;
`;

// InputGroup maps to GlobalStyles' InputWrapper
const InputGroup = styled(InputWrapper)`
  gap: 0.5rem;
`;

// SelectWrapper / SelectInput for searchable dropdown
const SelectWrapper = styled.div`
  position: relative;
`;

const SelectInput = styled(Input)`
  width: 100%;
  cursor: pointer;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 2px solid #00897b;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 137, 123, 0.2);
  z-index: 1000;
  margin-top: 0.25rem;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const SearchButton = styled(Button)`
  margin-top: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 137, 123, 0.3);

  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 137, 123, 0.4);
  }
`;

const ProductSection = styled(ContentCard)`
  background: #f9f9f9;
  padding: 2rem;
`;

const AddButton = styled(Button)`
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
  margin-top: 1.7rem;

  &:hover {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 187, 106, 0.4);
  }

  &::before {
    content: "+ ";
    font-weight: bold;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;

  input {
    border: none;
    text-align: center;
    width: 80px;
    padding: 0.75rem 0.5rem;

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
`;

// ModernTable uses GlobalStyles' Table/Th/Td/Tr as base
const ModernTable = styled(Table)`
  border-spacing: 0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: 1.5rem;
`;

const TableHead = styled.thead`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);

  th {
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 1rem;
    font-size: 0.875rem;
    text-align: left;
  }
`;

const TableRow = styled(Tr)`
  background: white;

  &:hover {
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(0, 137, 123, 0.1);
  }
`;

const TableCell = styled(Td)`
  color: #555;
`;

const DeleteButton = styled(Button)`
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  padding: 0.5rem 1rem;
  border-radius: 8px;

  &:hover {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    transform: translateY(-2px);
  }
`;

// ActionButtonGroup uses GlobalStyles' ButtonContainer as base
const ActionButtonGroup = styled(ButtonContainer)`
  justify-content: flex-end;
  margin-top: 2rem;
`;

const ResetBtn = styled(Button)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  padding: 1rem 2rem;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(117, 117, 117, 0.3);

  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(117, 117, 117, 0.4);
  }
`;

const EstimateBtn = styled(Button)`
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  padding: 1rem 2rem;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);

  &:hover {
    background: linear-gradient(135deg, #fb8c00 0%, #ef6c00 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
  }
`;

const SubmitBtn = styled(Button)`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  padding: 1rem 2rem;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 137, 123, 0.3);

  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 137, 123, 0.4);
  }
`;

const SummaryGrid = styled(FormRow)`
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #999;

  &::before {
    content: "📋";
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1rem;
    font-weight: 500;
    color: #666;
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
  const isFocused = useRef(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        isFocused.current = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync display text whenever value OR options change (e.g. prefill after async fetch),
  // but never override what the user is actively typing.
  useEffect(() => {
    if (isFocused.current) return;

    if (value) {
      const selected = options.find((opt) =>
        typeof opt === "string" ? opt === value : opt[valueKey] === value,
      );
      if (selected) {
        setSearchTerm(
          typeof selected === "string" ? selected : selected[displayKey],
        );
        return;
      }
      // Options not loaded yet — show the raw value so the field is not blank
      setSearchTerm(value);
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  const filteredOptions = options.filter((option) => {
    const displayValue =
      typeof option === "string" ? option : option[displayKey];
    return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (option) => {
    const selectedValue =
      typeof option === "string" ? option : option[valueKey];
    const displayValue =
      typeof option === "string" ? option : option[displayKey];
    onChange(selectedValue);
    setSearchTerm(displayValue);
    setIsOpen(false);
    isFocused.current = false;
  };

  return (
    <SelectWrapper ref={wrapperRef}>
      <SelectInput
        type="text"
        value={searchTerm}
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
          // If user cleared the box completely, reset the value
          if (!searchTerm.trim()) {
            onChange("");
          }
        }}
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
    </SelectWrapper>
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
    gender: "",
    item: JSON.stringify([]),
    referredBy: "",
    discountPercent: "",
    discount: "",
    discountRemarks: "",
    total: 0,
    finalPrice: 0,
    paymentMethod: "cash",
    paymentStatus: "pending",
    EstBillNo: "",
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

  const navigate = useNavigate();
  const location = useLocation();

  // ── Initialization ──────────────────────────────────────────────────────────

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setFormData((prev) => ({
        ...prev,
        investBillDate: today,
        time: `${hours}:${minutes}:${seconds}`,
      }));
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchBillTypes = async () => {
      const result = await apiRequest(`${HMSURL}bill-types/`, "GET");
      if (result.success) {
        const billTypesData = result.data.billTypes || [];
        const normalizedBillTypes = billTypesData.map((bt) => ({
          ...bt,
          billTypeNo: bt.billTypeNo ?? bt.BillTypeNo ?? 0,
        }));
        setBillTypes(normalizedBillTypes);
      } else {
        console.error("Error fetching bill types:", result.error);
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
      if (result.success) {
        setDoctors(result.data);
      } else {
        console.error("Failed to fetch doctors:", result.error);
      }
    };
    fetchDoctors();
  }, [HMSURL]);

  // ── Handle incoming navigation data ────────────────────────────────────────

  useEffect(() => {
    if (location.state?.patientData) {
      const data = location.state.patientData;
      const isEstimate = data.EstBillNo !== undefined;

      let itemsArray = [];
      if (typeof data.item === "string") {
        try {
          let parsed = JSON.parse(data.item);
          // Handle double-encoded string
          if (typeof parsed === "string") {
            parsed = JSON.parse(parsed);
          }
          itemsArray = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          itemsArray = [];
        }
      } else if (Array.isArray(data.item)) {
        itemsArray = data.item;
      }

      setFormData({
        investBillNo: isEstimate ? "" : data.investBillNo || "",
        investBillDate: data.EstBillDate || data.investBillDate || "",
        time: data.time || "",
        uhid: data.uhid || "",
        ipNumber: data.ipNumber || "",
        doctor: data.doctor || "",
        bill_type: data.bill_type || "",
        billTypeNo: data.billTypeNo || "",
        billType: data.billType || "",
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
        paymentMethod: data.paymentMethod || "cash",
        paymentStatus:
          data.paymentStatus ||
          (data.paymentMethod === "cash" || !data.paymentMethod
            ? "pending"
            : ""),
        item: JSON.stringify(itemsArray),
        EstBillNo: data.EstBillNo || "",
      });

      setProductList(itemsArray);

      if (data.billTypeNo) {
        setSelectedBillTypeNo(data.billTypeNo);
        handleBillTypeChange(data.billType, data.bill_type, data.billTypeNo);
      }
    }
  }, [location.state]);

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
      // Clear discount fields when discount is not allowed
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
      if (result.success) {
        setPackages(result.data.packages || []);
      } else {
        console.error("Error fetching packages:", result.error);
        setPackages([]);
      }
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
    if (result.success) {
      setItems(result.data.items || []);
    } else {
      console.error("Error fetching items:", result.error);
      setItems([]);
    }

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
    } else {
      console.error("Error fetching package items:", result.error);
    }
  };

  const handleItemChange = (selectedItemName) => {
    setFormData((prev) => ({ ...prev, item: selectedItemName }));
    setSelectedItem(selectedItemName);
    const selectedItemObj = items.find(
      (item) => item.itemName === selectedItemName,
    );
    setSelectedPrice(selectedItemObj ? selectedItemObj.price : "");
  };

  // ── Product list management ─────────────────────────────────────────────────

  const addProduct = () => {
    if (selectedItem && selectedPrice) {
      const selectedItemObj = items.find(
        (item) => item.itemName === selectedItem,
      );
      const newProduct = {
        itemName: selectedItem,
        price: selectedPrice,
        quantity: quantity,
        billTypeNo: formData.billTypeNo,
        ...(selectedItemObj?.test_id && { test_id: selectedItemObj.test_id }),
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
    const encodedUhid = encodeURIComponent(formData.uhid);
    const result = await apiRequest(
      `${HMSURL}op-patient/${encodedUhid}/`,
      "GET",
    );
    if (result.success) {
      const data = result.data;
      setFormData((prev) => ({
        ...prev,
        salutation: data.salutation || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        age: data.age || "",
        gender: data.gender || "",
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
    const encodedIpNumber = encodeURIComponent(formData.ipNumber);
    const result = await apiRequest(
      `${HMSURL}ip-patient/${encodedIpNumber}/`,
      "GET",
    );
    if (result.success) {
      const data = result.data;
      setFormData((prev) => ({
        ...prev,
        uhid: data.uhid || "",
        salutation: data.salutation || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        age: data.age || "",
        gender: data.gender || "",
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
    if (!formData.uhid?.trim()) {
      alert("UHID is required!");
      return false;
    }
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
          EstBillNo: estBillNo,
          EstBillDate: formData.investBillDate,
          time: formData.time,
          uhid: formData.uhid,
          ipNumber: formData.ipNumber,
          doctor: formData.doctor,
          billType: formData.billType,
          salutation: formData.salutation,
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: formData.age,
          gender: formData.gender,
          referredBy: formData.referredBy,
          discountPercent: formData.discountPercent,
          discount: formData.discount,
          discountRemarks: formData.discountRemarks,
          total: formData.total,
          finalPrice: formData.finalPrice,
          paymentMethod: formData.paymentMethod,
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
      EstBillNo: formData.EstBillNo,
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
          investBillNo: billNo,
          investBillDate: formData.investBillDate,
          time: formData.time,
          uhid: formData.uhid,
          ipNumber: formData.ipNumber,
          doctor: formData.doctor,
          billType: formData.billType,
          salutation: formData.salutation,
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: formData.age,
          gender: formData.gender,
          referredBy: formData.referredBy,
          discountPercent: formData.discountPercent,
          discount: formData.discount,
          discountRemarks: formData.discountRemarks,
          total: formData.total,
          finalPrice: formData.finalPrice,
          paymentMethod: formData.paymentMethod,
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
      if (name === "paymentMethod") {
        updated.paymentStatus = value === "cash" ? "pending" : "";
      }
      return updated;
    });
  };

  // ── Print helpers ───────────────────────────────────────────────────────────

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
    .address { margin-bottom: 3px; }
    .bill-title { font-weight: bold; display: inline-block; margin-right: 10px; }
    .bill-subtitle { font-weight: bold; display: inline-block; margin-left: 10px; }
    .bill-details { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .bill-details-left { width: 48%; }
    .bill-row { display: flex; margin-bottom: 5px; }
    .bill-label { font-weight: bold; width: 120px; }
    .bill-value { flex-grow: 1; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #000; padding: 5px; text-align: left; }
    th { background-color: #f2f2f2; }
    .total-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .total-label { font-weight: bold; }
    .net-amount { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
    .signature { display: flex; justify-content: space-between; margin-top: 30px; }
  `;

  const handlePrint = (bill) => {
    const printWindow = window.open("", "_blank", "height=600,width=800");
    const itemsArray = resolveItems(bill.item);
    const html = `
      <!DOCTYPE html><html><head><title>Bill Print</title><style>${printStyles}</style></head>
      <body>
        <div class="header">
          <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
          <div class="address">51/24.Saradha College Road, Salem - 636007</div>
          <div class="registration">CIN: U85110TZ20PLC033974</div>
        </div>
        <div>
          <span class="bill-title">"${bill.paymentMethod || "NIL"}"</span>
          <span class="bill-subtitle">${bill.billType || "NIL"}</span>
        </div>
        <div class="bill-details">
          <div class="bill-details-left">
            <div class="bill-row"><div class="bill-label">Bill Number</div><div class="bill-value">: ${bill.investBillNo || ""}</div></div>
            <div class="bill-row"><div class="bill-label">OP Number</div><div class="bill-value">: ${bill.uhid || ""}</div></div>
            <div class="bill-row"><div class="bill-label">Bill Date</div><div class="bill-value">: ${formatDateTime(bill.investBillDate)}, ${formatTimeTo12Hr(bill.time)}</div></div>
            <div class="bill-row"><div class="bill-label">Name</div><div class="bill-value">: ${formatPatientName(bill.salutation, bill.firstName, bill.middleName, bill.lastName)}</div></div>
            <div class="bill-row"><div class="bill-label">Doctor</div><div class="bill-value">: ${bill.doctor || ""}</div></div>
          </div>
        </div>
        <table>
          <thead><tr><th>SlNo</th><th>Description</th><th>Qty</th><th>Cost</th><th>Amount</th></tr></thead>
          <tbody>${buildItemRows(itemsArray)}</tbody>
        </table>
        <div class="total-section">
          <div class="total-row"><div class="total-label">Total</div><div>${parseFloat(bill.total || 0).toFixed(2)}</div></div>
          <div class="total-row"><div class="total-label">Discount</div><div>${bill.discount || "0.00"}</div></div>
          <div class="total-row net-amount"><div class="total-label">Net Amount</div><div>${bill.finalPrice || "0.00"}</div></div>
        </div>
        <div class="signature"><div>${bill.uhid || ""}</div><div>(Signature)</div></div>
      </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleEstimatePrint = (estimate) => {
    const printWindow = window.open("", "_blank", "height=600,width=800");
    const itemsArray = resolveItems(estimate.item);
    const estimateStyles = `
      ${printStyles}
      .estimate-label { font-weight: bold; font-size: 16px; color: #ff9800; text-align: center; margin: 10px 0; text-decoration: underline; }
      th { background-color: #fff3e0; }
      .note { margin-top: 20px; padding: 10px; background-color: #fff3e0; border-left: 4px solid #ff9800; font-style: italic; }
    `;
    const html = `
      <!DOCTYPE html><html><head><title>Estimate Print</title><style>${estimateStyles}</style></head>
      <body>
        <div class="header">
          <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
          <div class="address">51/24.Saradha College Road, Salem - 636007</div>
          <div class="registration">CIN: U85110TZ20PLC033974</div>
        </div>
        <div class="estimate-label">*** ESTIMATE BILL ***</div>
        <div>
          <span class="bill-title">"${estimate.paymentMethod || "NIL"}"</span>
          <span class="bill-subtitle">${estimate.billType || "NIL"}</span>
        </div>
        <div class="bill-details">
          <div class="bill-details-left">
            <div class="bill-row"><div class="bill-label">Estimate Number</div><div class="bill-value">: ${estimate.EstBillNo || ""}</div></div>
            <div class="bill-row"><div class="bill-label">OP Number</div><div class="bill-value">: ${estimate.uhid || ""}</div></div>
            <div class="bill-row"><div class="bill-label">Estimate Date</div><div class="bill-value">: ${formatDateTime(estimate.EstBillDate)}, ${formatTimeTo12Hr(estimate.time)}</div></div>
            <div class="bill-row"><div class="bill-label">Name</div><div class="bill-value">: ${formatPatientName(estimate.salutation, estimate.firstName, estimate.middleName, estimate.lastName)}</div></div>
            <div class="bill-row"><div class="bill-label">Doctor</div><div class="bill-value">: ${estimate.doctor || ""}</div></div>
          </div>
        </div>
        <table>
          <thead><tr><th>SlNo</th><th>Description</th><th>Qty</th><th>Cost</th><th>Amount</th></tr></thead>
          <tbody>${buildItemRows(itemsArray)}</tbody>
        </table>
        <div class="total-section">
          <div class="total-row"><div class="total-label">Total</div><div>${parseFloat(estimate.total || 0).toFixed(2)}</div></div>
          <div class="total-row"><div class="total-label">Discount</div><div>${estimate.discount || "0.00"}</div></div>
          <div class="total-row net-amount"><div class="total-label">Estimated Net Amount</div><div>${estimate.finalPrice || "0.00"}</div></div>
        </div>
        <div class="note"><strong>Note:</strong> This is an estimate bill. Final charges may vary based on actual services provided. Please convert this to a final bill at the time of payment.</div>
        <div class="signature"><div>${estimate.uhid || ""}</div><div>(Authorized Signature)</div></div>
      </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <PageTitle>Investigation Billing</PageTitle>

      <NavigationLinks>
        <NavLink onClick={() => navigate("/ViewEstimate")}>
          📊 View Estimate
        </NavLink>
        <NavLink onClick={() => navigate("/ViewBills")}>📄 View Bills</NavLink>
      </NavigationLinks>

      <ContentCard>
        <form onSubmit={handleSubmit}>
          {/* Patient Information */}
          <SectionHeader>
            <SectionIcon>👤</SectionIcon>
            <SectionTitle>Patient Information</SectionTitle>
          </SectionHeader>

          <FormGrid>
            <InputGroup>
              <Label required>UHID</Label>
              <Input
                type="text"
                name="uhid"
                value={formData.uhid}
                onChange={handleInputChange}
              />
              <SearchButton type="button" onClick={fetchPatientDetails}>
                🔍 Search
              </SearchButton>
            </InputGroup>

            <InputGroup>
              <Label>IP Number</Label>
              <Input
                type="text"
                name="ipNumber"
                value={formData.ipNumber}
                onChange={handleInputChange}
              />
              <SearchButton type="button" onClick={fetchIpPatient}>
                🔍 Search
              </SearchButton>
            </InputGroup>

            <InputGroup>
              <Label>Salutation</Label>
              <Input
                type="text"
                name="salutation"
                value={formData.salutation || ""}
                onChange={handleInputChange}
                readOnly
              />
            </InputGroup>

            <InputGroup>
              <Label>First Name</Label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleInputChange}
                readOnly
              />
            </InputGroup>

            <InputGroup>
              <Label>Last Name</Label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleInputChange}
                readOnly
              />
            </InputGroup>

            <InputGroup>
              <Label>Age</Label>
              <Input
                type="number"
                name="age"
                value={formData.age || ""}
                onChange={handleInputChange}
                readOnly
              />
            </InputGroup>

            <InputGroup>
              <Label>Gender</Label>
              <Input
                type="text"
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                readOnly
              />
            </InputGroup>
          </FormGrid>

          {/* Billing Details */}
          <SectionHeader>
            <SectionIcon>📋</SectionIcon>
            <SectionTitle>Billing Details</SectionTitle>
          </SectionHeader>

          <FormGrid>
            <InputGroup>
              <Label>Bill Date</Label>
              <Input
                type="date"
                name="investBillDate"
                value={formData.investBillDate}
                onChange={handleInputChange}
              />
            </InputGroup>

            <InputGroup>
              <Label>Bill Time</Label>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
              />
            </InputGroup>

            <InputGroup>
              <Label required>Bill Type</Label>
              <SearchableDropdown
                value={formData.billType}
                onChange={(billName) => {
                  const selectedBillType = billTypes.find(
                    (bt) => bt.bill_name === billName,
                  );
                  if (selectedBillType) {
                    const billTypeNo =
                      selectedBillType.billTypeNo ??
                      selectedBillType.BillTypeNo ??
                      0;
                    handleBillTypeChange(
                      selectedBillType.bill_name,
                      selectedBillType.bill_type,
                      billTypeNo,
                      selectedBillType.is_allowDiscount ?? true,
                    );
                  }
                }}
                options={billTypes.map((bt) => bt.bill_name)}
                placeholder="Select or search bill type..."
              />
            </InputGroup>

            {selectedBillTypeNo === "PACK" && (
              <InputGroup>
                <Label required>Package</Label>
                <SearchableDropdown
                  value={
                    packages.find((pkg) => pkg.packageNo === selectedPackageNo)
                      ?.packageName || ""
                  }
                  onChange={handlePackageChange}
                  options={packages.map((pkg) => pkg.packageName)}
                  placeholder="Select or search package..."
                />
              </InputGroup>
            )}

            <InputGroup>
              <Label required>Doctor</Label>
              <SearchableDropdown
                value={formData.doctor}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, doctor: value }))
                }
                options={doctors.map((d) => ({
                  id: d.employeeName.trim(),
                  name: d.employeeName.trim(),
                }))}
                displayKey="name"
                valueKey="id"
                placeholder="Select or search doctor..."
              />
            </InputGroup>

            <InputGroup>
              <Label required>Referred By</Label>
              <SearchableDropdown
                value={formData.referredBy}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, referredBy: value }))
                }
                options={doctors.map((d) => ({
                  id: d.employeeName.trim(),
                  name: d.employeeName.trim(),
                }))}
                displayKey="name"
                valueKey="id"
                placeholder="Select or search doctor..."
              />
            </InputGroup>
          </FormGrid>

          {/* Investigation Items */}
          <ProductSection>
            <SectionHeader>
              <SectionIcon>🔬</SectionIcon>
              <SectionTitle>
                {selectedBillTypeNo === "PACK"
                  ? "Package Items"
                  : "Investigation Items"}
              </SectionTitle>
            </SectionHeader>

            {selectedBillTypeNo !== "PACK" && (
              <FormGrid
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                <InputGroup>
                  <Label required>Item</Label>
                  <SearchableDropdown
                    value={selectedItem}
                    onChange={handleItemChange}
                    options={items.map((item) => item.itemName)}
                    placeholder="Select or search item..."
                    disabled={!selectedBillTypeNo}
                  />
                </InputGroup>

                <InputGroup>
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
                </InputGroup>

                <InputGroup>
                  <Label required>Price</Label>
                  <Input type="text" value={selectedPrice} readOnly />
                </InputGroup>

                <AddButton type="button" onClick={addProduct}>
                  Add Item
                </AddButton>
              </FormGrid>
            )}

            {productList.length > 0 ? (
              <ModernTable>
                <TableHead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th> {/* ✅ always visible, even for PACK */}
                  </tr>
                </TableHead>
                <tbody>
                  {productList.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.itemName}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        ₹ {(product.price * product.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DeleteButton
                          type="button"
                          onClick={() => deleteProduct(index)}
                          disabled={selectedBillTypeNo === "PACK"}
                          style={{
                            opacity: selectedBillTypeNo === "PACK" ? 0.4 : 1,
                            cursor:
                              selectedBillTypeNo === "PACK"
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          🗑 Delete
                        </DeleteButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </ModernTable>
            ) : (
              <EmptyState>
                <p>No items added yet</p>
              </EmptyState>
            )}

            <SummaryGrid>
              <InputGroup>
                <Label>Total</Label>
                <Input
                  type="text"
                  name="total"
                  value={formData.total}
                  readOnly
                />
              </InputGroup>

              <InputGroup>
                <Label>Discount (%)</Label>
                <Input
                  type="text"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleInputChange}
                  disabled={!isDiscountAllowed}
                  placeholder={!isDiscountAllowed ? "Discount not allowed" : ""}
                />
              </InputGroup>

              <InputGroup>
                <Label>Discount Amount</Label>
                <Input
                  type="text"
                  name="discount"
                  value={formData.discount}
                  readOnly
                  disabled={!isDiscountAllowed}
                />
              </InputGroup>

              <InputGroup>
                <Label>Discount Remarks</Label>
                <Input
                  type="text"
                  name="discountRemarks"
                  value={formData.discountRemarks}
                  onChange={handleInputChange}
                  disabled={!isDiscountAllowed}
                  placeholder={!isDiscountAllowed ? "Discount not allowed" : ""}
                />
              </InputGroup>

              <InputGroup>
                <Label>Final Price</Label>
                <Input
                  type="text"
                  name="finalPrice"
                  value={formData.finalPrice}
                  readOnly
                />
              </InputGroup>

              <InputGroup>
                <Label required>Payment Method</Label>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                </Select>
              </InputGroup>
            </SummaryGrid>

            <ActionButtonGroup>
              <ResetBtn type="button" onClick={handleReset}>
                🔄 Reset
              </ResetBtn>
              <EstimateBtn type="button" onClick={handleEstimate}>
                📊 Make Estimate
              </EstimateBtn>
              <SubmitBtn type="submit">💾 Save Bill</SubmitBtn>
            </ActionButtonGroup>
          </ProductSection>
        </form>
      </ContentCard>
    </PageContainer>
  );
};

export default InvestigationBilling;
