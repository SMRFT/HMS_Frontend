import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";


// Modern styled components
const PageContainer = styled.div`
  min-height: 100vh;
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
    content: '💉';
    font-size: 2.5rem;
  }
`;

const HospitalLabel = styled.div`
  position: absolute;
  top: 10px;
  right: 0;
  background: linear-gradient(to right, #ff7f00, #d97706);
  color: white;
  padding: 8px 45px 8px 40px;
  font-weight: bold;
  font-size: 14px;
  border-radius: 0 5px 5px 0;
  clip-path: polygon(0% 0%, 10% 50%, 0% 100%, 100% 100%, 100% 0%);
  box-shadow: 0 4px 12px rgba(255, 127, 0, 0.3);
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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 3px solid #f0f0f0;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  position: relative;
  
  &::before {
    content: '';
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

const SectionIcon = styled.span`
  font-size: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

const Label = styled.label`
  color: #00897b;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.required && `
    &::after {
      content: ' *';
      color: #ef5350;
    }
  `}
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.938rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
  
  &:read-only {
    background-color: #f5f5f5;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const SelectInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.938rem;
  transition: all 0.3s ease;
  width: 100%;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
  
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

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.938rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

const SearchButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
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

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
  margin-top: 1.7rem;
  
  &:hover {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 187, 106, 0.4);
  }
  
  &::before {
    content: '+ ';
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

const ModernTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
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

const TableRow = styled.tr`
  background: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(0, 137, 123, 0.1);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #555;
  font-size: 0.938rem;
  border-bottom: 1px solid #f0f0f0;
`;

const DeleteButton = styled.button`
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    transform: translateY(-2px);
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  gap: 1rem;
`;

const ResetBtn = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  border-radius: 10px;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(117, 117, 117, 0.3);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(117, 117, 117, 0.4);
  }
`;

const EstimateBtn = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border-radius: 10px;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #fb8c00 0%, #ef6c00 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
  }
`;

const SubmitBtn = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  border-radius: 10px;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 137, 123, 0.3);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 137, 123, 0.4);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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
    content: '📋';
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

// Searchable Dropdown Component
const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  displayKey = "name",
  valueKey = "id",
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => {
    const displayValue = typeof option === 'string' ? option : option[displayKey];
    return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (option) => {
    const selectedValue = typeof option === 'string' ? option : option[valueKey];
    onChange(selectedValue);
    setSearchTerm(typeof option === 'string' ? option : option[displayKey]);
    setIsOpen(false);
  };

  useEffect(() => {
    if (value) {
      const selected = options.find(opt =>
        typeof opt === 'string' ? opt === value : opt[valueKey] === value
      );
      if (selected) {
        setSearchTerm(typeof selected === 'string' ? selected : selected[displayKey]);
      }
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  return (
    <SelectWrapper ref={wrapperRef}>
      <SelectInput
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {isOpen && filteredOptions.length > 0 && (
        <DropdownList>
          {filteredOptions.map((option, index) => (
            <DropdownItem
              key={index}
              onClick={() => handleSelect(option)}
            >
              {typeof option === 'string' ? option : option[displayKey]}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </SelectWrapper>
  );
};


const InvestigationBilling = () => {
  // Backend URL - Replace with your environment variable
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;


  // Form State - INCLUDES EstBillNo for estimate conversion
  const [formData, setFormData] = useState({
    investBillNo: "",
    investBillDate: "",
    time: "",
    uhid: "",
    ipNumber: "",
    doctor: "",
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
    EstBillNo: "", // CRITICAL: Track estimate bill number for conversion
  });

  // Dropdown Options State
  const [doctors, setDoctors] = useState([]);
  const [billTypes, setBillTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [labTests, setLabTests] = useState([]);

  // Selection State
  const [selectedBillType, setSelectedBillType] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [productList, setProductList] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLabTest, setIsLabTest] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ============= INITIALIZATION EFFECTS =============

  // Set default date and time on component mount
  // Replace the existing useEffect for setting default date and time with this:
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    // Function to update time
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}:${seconds}`;

      setFormData((prev) => ({
        ...prev,
        investBillDate: today,
        time: currentTime,
      }));
    };

    // Update immediately
    updateTime();

    // Update every second
    const intervalId = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch Bill Types on mount
  useEffect(() => {
    const fetchBillTypes = async () => {
      const result = await apiRequest(`${HMSURL}bill-types/`, "GET");

      if (result.success) {
        console.log("Fetched Bill Types:", result.data);
        const traditionalBillTypes = result.data.items || [];
        setBillTypes(traditionalBillTypes);
      } else {
        console.error("Error fetching bill types:", result.error);
      }
    };

    fetchBillTypes();
  }, [HMSURL]);

  // Fetch Lab Tests on mount
  useEffect(() => {
    const fetchLabTests = async () => {
      const result = await apiRequest(`${HMSURL}lab-tests/`, "GET");
      if (result.success) {
        console.log("Fetched Lab Tests:", result.data);
        const tests = result.data?.data || result.data || [];
        setLabTests(Array.isArray(tests) ? tests : []);
      } else {
        console.error("Error fetching lab tests:", result.error);
        setLabTests([]);
      }
    };

    fetchLabTests();
  }, [HMSURL]);

  // Fetch Doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      const result = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET");
      if (result.success) {
        setDoctors(result.data);
      } else {
        console.error("Failed to fetch doctors:", result.error);
      }
    };
    fetchDoctors();
  }, [HMSURL]);

  // ============= HANDLE INCOMING NAVIGATION DATA =============
  // This handles data from View Estimate (Convert to Bill) or Edit Bill
  useEffect(() => {
    if (location.state?.patientData) {
      const data = location.state.patientData;

      console.log("Received navigation data:", data);

      // Check if it's from estimate (has EstBillNo)
      const isEstimate = data.EstBillNo !== undefined;

      // Parse items array if it's a string
      let itemsArray = [];
      if (typeof data.item === 'string') {
        try {
          itemsArray = JSON.parse(data.item);
        } catch (e) {
          console.error("Error parsing items:", e);
          itemsArray = [];
        }
      } else if (Array.isArray(data.item)) {
        itemsArray = data.item;
      }

      // Set form data with all fields including EstBillNo
      setFormData({
        investBillNo: isEstimate ? "" : (data.investBillNo || ""),
        investBillDate: data.EstBillDate || data.investBillDate || "",
        time: data.time || "",
        uhid: data.uhid || "",
        ipNumber: data.ipNumber || "",
        doctor: data.doctor || "",
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
        item: JSON.stringify(itemsArray),
        EstBillNo: data.EstBillNo || "", // IMPORTANT: Preserve EstBillNo for backend deletion
      });

      console.log("EstBillNo set to:", data.EstBillNo);

      setProductList(itemsArray);

      // Set bill type and load items
      if (data.billType) {
        setSelectedBillType(data.billType);

        // Check if it's a lab test and set items accordingly
        if (data.billType === "Lab Test (SH)" || data.billType === "Lab Test (CREDIT)") {
          setIsLabTest(true);

          if (labTests.length > 0) {
            const labTestItems = labTests.map(test => ({
              itemName: test.test_name,
              price: data.billType === "Lab Test (SH)" ? test.SH_Rate : test.Credit_Rate,
              test_id: test.test_id
            }));
            setItems(labTestItems);
          }
        } else {
          setIsLabTest(false);
          // Items will be loaded by handleBillTypeChange
          handleBillTypeChange(data.billType);
        }
      }
    }
  }, [location.state, labTests]);

  // ============= BILL TYPE AND ITEM HANDLERS =============

  // Handle Bill Type Change
  const handleBillTypeChange = async (selectedType) => {
    setFormData((prev) => ({ ...prev, billType: selectedType }));
    setSelectedBillType(selectedType);

    // Check if it's a lab test bill type
    if (selectedType === "Lab Test (SH)" || selectedType === "Lab Test (CREDIT)") {
      setIsLabTest(true);

      const labTestItems = labTests.map(test => ({
        itemName: test.test_name,
        price: selectedType === "Lab Test (SH)" ? test.SH_Rate : test.Credit_Rate,
        test_id: test.test_id
      }));

      setItems(labTestItems);
    } else {
      setIsLabTest(false);

      // Fetch traditional bill type items
      const result = await apiRequest(`${HMSURL}bill-types/`, "GET");

      if (result.success) {
        const filteredItems = result.data.items
          .filter((item) => item.billType === selectedType)
          .map((item) => ({
            itemName: item.itemName,
            price: item.Price,
          }));
        setItems(filteredItems);
      } else {
        console.error("Error fetching items:", result.error);
      }
    }

    setSelectedItem("");
    setSelectedPrice("");
  };

  // Handle Item Change
  const handleItemChange = (selectedItemName) => {
    setFormData((prev) => ({ ...prev, item: selectedItemName }));
    setSelectedItem(selectedItemName);

    const selectedItemObj = items.find(
      (item) => item.itemName === selectedItemName
    );

    if (selectedItemObj) {
      setFormData((prev) => ({ ...prev }));
      setSelectedPrice(selectedItemObj.price);
    } else {
      setSelectedPrice("");
    }
  };

  // ============= PRODUCT LIST MANAGEMENT =============

  // Add Product to List
  const addProduct = () => {
    if (selectedItem && selectedPrice) {
      const selectedItemObj = items.find(item => item.itemName === selectedItem);

      const newProduct = {
        itemName: selectedItem,
        price: selectedPrice,
        quantity: quantity,
        ...(isLabTest && selectedItemObj && { test_id: selectedItemObj.test_id })
      };

      const updatedList = [...productList, newProduct];
      setProductList(updatedList);
      setFormData((prev) => ({ ...prev, item: JSON.stringify(updatedList) }));

      // Reset fields
      setSelectedItem("");
      setSelectedPrice("");
      setQuantity(1);
    }
  };

  // Delete Product from List
  const deleteProduct = (index) => {
    const updatedList = productList.filter((_, i) => i !== index);
    setProductList(updatedList);
    setFormData((prev) => ({ ...prev, item: JSON.stringify(updatedList) }));
  };

  // ============= PATIENT SEARCH FUNCTIONS =============

  // Fetch Patient Details by UHID
  const fetchPatientDetails = async () => {
    if (!formData.uhid) {
      alert("Please enter UHID");
      return;
    }

    const encodedUhid = encodeURIComponent(formData.uhid);
    const result = await apiRequest(`${HMSURL}op-patient/${encodedUhid}/`, "GET");

    if (result.success) {
      const data = result.data;
      setFormData(prev => ({
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

  // Fetch IP Patient Details
  const fetchIpPatient = async () => {
    if (!formData.ipNumber) {
      alert("Please enter IP Number");
      return;
    }

    const encodedIpNumber = encodeURIComponent(formData.ipNumber);
    const result = await apiRequest(`${HMSURL}ip-patient/${encodedIpNumber}/`, "GET");

    if (result.success) {
      const data = result.data;
      setFormData(prev => ({
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

  // ============= FORM ACTIONS =============

  // Handle Reset
  const handleReset = () => {
    navigate(location.pathname, { replace: true, state: {} });
    window.location.reload();
  };

  // Handle Make Estimate
  // Handle Make Estimate
  const handleEstimate = async (e) => {
    e.preventDefault();

    const formPayload = {
      EstBillNo: formData.investBillNo,
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
      discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : 0,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      discountRemarks: formData.discountRemarks,
      total: formData.total,
      finalPrice: formData.finalPrice,
      paymentMethod: formData.paymentMethod,
      item: productList,
    };

    const result = await apiRequest(`${HMSURL}estimateBilling/`, "POST", formPayload);

    if (result.success) {
      // Get the estimate bill number from response
      const estBillNo = result.data?.EstBillNo;

      if (estBillNo) {
        console.log("Estimate Bill Number received from backend:", estBillNo);

        // Create estimate bill object with the generated bill number from response
        const estimateDataForPrint = {
          EstBillNo: estBillNo, // ✅ This comes from backend response
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
          item: productList, // Use productList directly as array
        };

        console.log("Opening print window with estimate data:", estimateDataForPrint);

        // Open print window immediately with the estimate bill number from response
        handleEstimatePrint(estimateDataForPrint);

        // Show success message after print dialog opens
        setTimeout(() => {
          alert("Estimate generated successfully!");
        }, 100);
      } else {
        alert("Estimate generated but estimate number not received from server!");
      }

      // Reload page after print window opens
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      alert(`Failed to save estimate: ${result.error}`);
    }
  };


  // Handle Submit (Save Bill) - INCLUDES EstBillNo for backend deletion
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== SUBMITTING BILL ===");
    console.log("Full Form Data:", formData);
    console.log("EstBillNo being sent for deletion:", formData.EstBillNo);

    // Extract EstBillNo and EstBillDate, but don't include them in the new bill data
    const { EstBillNo, EstBillDate, ...filteredFormData } = formData;

    const formPayload = {
      ...filteredFormData,
      EstBillNo, // Include EstBillNo so backend can delete the corresponding estimate
      item: productList,
    };

    console.log("Final Payload being sent:", formPayload);

    const result = await apiRequest(`${HMSURL}investBilling/`, "POST", formPayload);

    if (result.success) {
      // Get the bill number from response
      const billNo = result.data?.investBillNo;

      if (billNo) {
        console.log("Bill Number received from backend:", billNo);

        // Create bill object with the generated bill number from response
        const billDataForPrint = {
          investBillNo: billNo, // ✅ This comes from backend response
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
          item: productList, // Use productList directly as array
        };

        console.log("Opening print window with bill data:", billDataForPrint);

        // Open print window immediately with the bill number from response
        handlePrint(billDataForPrint);

        // Show success message after print dialog opens
        setTimeout(() => {
          alert("Bill generated successfully!");
        }, 100);
      } else {
        alert("Bill generated but bill number not received from server!");
      }

      // Navigate after print window opens
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
        window.location.reload();
      }, 2000);
    } else {
      alert(`Failed to save bill: ${result.error}`);
    }
  };

  // ============= AUTOMATIC CALCULATIONS =============

  // Calculate Total Price
  useEffect(() => {
    const totalPrice = productList.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
    setFormData((prev) => ({ ...prev, total: totalPrice }));
  }, [productList]);

  // Calculate Discount and Final Price
  useEffect(() => {
    const discountAmount = (formData.total * formData.discountPercent) / 100;
    const calculatedFinalPrice = formData.total - discountAmount;

    setFormData((prev) => ({
      ...prev,
      discount: discountAmount.toFixed(2),
      finalPrice: calculatedFinalPrice.toFixed(2),
    }));
  }, [formData.total, formData.discountPercent]);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  // Print handler
  const handlePrint = (bill) => {
    const printWindow = window.open("", "_blank", "height=600,width=800");

    const formatDateTime = (dateStr, timeStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
      return timeStr ? `${formattedDate} ${timeStr}` : formattedDate;
    };

    const formatPatientName = (salutation, firstName, middleName, lastName) => {
      return `${salutation || ""} ${firstName || ""} ${middleName ? middleName + " " : ""
        }${lastName || ""}`.trim();
    };

    // Parse items if it's a JSON string
    let itemsArray = [];
    if (typeof bill.item === 'string') {
      try {
        itemsArray = JSON.parse(bill.item);
      } catch (e) {
        console.error("Error parsing items:", e);
        itemsArray = [];
      }
    } else if (Array.isArray(bill.item)) {
      itemsArray = bill.item;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill Print</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 10px; }
        .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
        .hospital-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
        .address { margin-bottom: 3px; }
        .bill-title { font-weight: bold; display: inline-block; margin-right: 10px; }
        .bill-subtitle { font-weight: bold; display: inline-block; margin-left: 10px; }
        .bill-details { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .bill-details-left, .bill-details-right { width: 48%; }
        .bill-row { display: flex; margin-bottom: 5px; }
        .bill-label { font-weight: bold; width: 100px; }
        .bill-value { flex-grow: 1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-right { text-align: right; }
        .signature { display: flex; justify-content: space-between; margin-top: 30px; }
        .total-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .total-label { font-weight: bold; }
        .net-amount { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
      </style>
    </head>
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
          <div class="bill-row">
            <div class="bill-label">Bill Number</div>
            <div class="bill-value">: ${bill.investBillNo || ""}</div>
          </div>
          <div class="bill-row">
            <div class="bill-label">OP Number</div>
            <div class="bill-value">: ${bill.uhid || ""}</div>
          </div>
          <div class="bill-row">
            <div class="bill-label">Bill Date</div>
            <div class="bill-value">: ${formatDateTime(bill.investBillDate, bill.time)}</div>
          </div>
          <div class="bill-row">
            <div class="bill-label">Name</div>
            <div class="bill-value">: ${formatPatientName(
      bill.salutation,
      bill.firstName,
      bill.middleName,
      bill.lastName
    )}</div>
          </div>
          <div class="bill-row">
            <div class="bill-label">Doctor</div>
            <div class="bill-value">: ${bill.doctor || ""}</div>
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>SlNo</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Cost</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsArray.length > 0
        ? itemsArray
          .map(
            (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.itemName || ""}</td>
                <td>${item.quantity || 1}</td>
                <td>${parseFloat(item.price).toFixed(2)}</td>
                <td>${(parseFloat(item.price) * parseInt(item.quantity || 1)).toFixed(2)}</td>
              </tr>
            `
          )
          .join("")
        : '<tr><td colspan="5">No Items</td></tr>'
      }
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">
          <div class="total-label">Total</div>
          <div class="total-value">${parseFloat(bill.total || 0).toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div class="total-label">Discount</div>
          <div class="total-value">${bill.discount || "0.00"}</div>
        </div>
        <div class="total-row net-amount">
          <div class="total-label">Net Amount</div>
          <div class="total-value">${bill.finalPrice || "0.00"}</div>
        </div>
      </div>
      
      <div class="signature">
        <div>${bill.uhid || ""}</div>
        <div>(Signature)</div>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };


  // Print handler for Estimate
  const handleEstimatePrint = (estimate) => {
    const printWindow = window.open("", "_blank", "height=600,width=800");

    const formatDateTime = (dateStr, timeStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
      return timeStr ? `${formattedDate} ${timeStr}` : formattedDate;
    };

    const formatPatientName = (salutation, firstName, middleName, lastName) => {
      return `${salutation || ""} ${firstName || ""} ${middleName ? middleName + " " : ""
        }${lastName || ""}`.trim();
    };

    // Parse items if it's a JSON string
    let itemsArray = [];
    if (typeof estimate.item === 'string') {
      try {
        itemsArray = JSON.parse(estimate.item);
      } catch (e) {
        console.error("Error parsing items:", e);
        itemsArray = [];
      }
    } else if (Array.isArray(estimate.item)) {
      itemsArray = estimate.item;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Estimate Print</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 10px; }
        .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
        .hospital-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
        .address { margin-bottom: 3px; }
        .estimate-label { 
          font-weight: bold; 
          font-size: 16px; 
          color: #ff9800; 
          text-align: center; 
          margin: 10px 0; 
          text-decoration: underline;
        }
        .bill-title { font-weight: bold; display: inline-block; margin-right: 10px; }
        .bill-subtitle { font-weight: bold; display: inline-block; margin-left: 10px; }
        .bill-details { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .bill-details-left, .bill-details-right { width: 48%; }
        .bill-row { display: flex; margin-bottom: 5px; }
        .bill-label { font-weight: bold; width: 120px; }
        .bill-value { flex-grow: 1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        th { background-color: #fff3e0; }
        .text-right { text-align: right; }
        .signature { display: flex; justify-content: space-between; margin-top: 30px; }
        .total-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .total-label { font-weight: bold; }
        .net-amount { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
        .note { 
          margin-top: 20px; 
          padding: 10px; 
          background-color: #fff3e0; 
          border-left: 4px solid #ff9800; 
          font-style: italic;
        }
      </style>
    </head>
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
          <div class="bill-row">
            <div class="bill-label">Estimate Number</div>
            <div class="bill-value">: ${estimate.EstBillNo || ""}</div>
          </div>
          <div class="bill-row">
            <div class="bill-label">OP Number</div>
            <div class="bill-value">: ${estimate.uhid || ""}</div>
          </div>
          <div class="bill-row">
            <div class="bill-label">Estimate Date</div>
            <div class="bill-value">: ${formatDateTime(estimate.EstBillDate, estimate.time)}</div>
          </div>
          <div class="bill-row">
            <div class="bill-label">Name</div>
            <div class="bill-value">: ${formatPatientName(
      estimate.salutation,
      estimate.firstName,
      estimate.middleName,
      estimate.lastName
    )}</div>
          </div>
          <div class="bill-row">
            <div class="bill-label">Doctor</div>
            <div class="bill-value">: ${estimate.doctor || ""}</div>
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>SlNo</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Cost</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsArray.length > 0
        ? itemsArray
          .map(
            (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.itemName || ""}</td>
                <td>${item.quantity || 1}</td>
                <td>${parseFloat(item.price).toFixed(2)}</td>
                <td>${(parseFloat(item.price) * parseInt(item.quantity || 1)).toFixed(2)}</td>
              </tr>
            `
          )
          .join("")
        : '<tr><td colspan="5">No Items</td></tr>'
      }
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">
          <div class="total-label">Total</div>
          <div class="total-value">${parseFloat(estimate.total || 0).toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div class="total-label">Discount</div>
          <div class="total-value">${estimate.discount || "0.00"}</div>
        </div>
        <div class="total-row net-amount">
          <div class="total-label">Estimated Net Amount</div>
          <div class="total-value">${estimate.finalPrice || "0.00"}</div>
        </div>
      </div>
      
      <div class="note">
        <strong>Note:</strong> This is an estimate bill. Final charges may vary based on actual services provided. 
        Please convert this to a final bill at the time of payment.
      </div>
      
      <div class="signature">
        <div>${estimate.uhid || ""}</div>
        <div>(Authorized Signature)</div>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  return (
    <PageContainer>
      <HospitalLabel>SHANMUGA HOSPITAL PVT LTD</HospitalLabel>

      <PageTitle>Investigation Billing</PageTitle>

      <NavigationLinks>
        <NavLink onClick={() => navigate("/ViewEstimate")}>
          📊 View Estimate
        </NavLink>
        <NavLink onClick={() => navigate("/ViewBills")}>
          📄 View Bills
        </NavLink>
      </NavigationLinks>

      <ContentCard>
        <form onSubmit={handleSubmit}>
          {/* Patient Information Section */}
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

          {/* Billing Details Section */}
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
                value={selectedBillType}
                onChange={handleBillTypeChange}
                options={[
                  ...new Set(billTypes.map(bt => typeof bt === 'string' ? bt : bt.billType)),
                  "Lab Test (SH)",
                  "Lab Test (CREDIT)"
                ]}
                placeholder="Select or search bill type..."
              />
            </InputGroup>

            <InputGroup>
              <Label>Doctor</Label>
              <SearchableDropdown
                value={formData.doctor}
                onChange={(value) => setFormData(prev => ({ ...prev, doctor: value }))}
                options={doctors.map(d => ({
                  id: `${d.employeeName}`.trim(),
                  name: `${d.employeeName}`.trim()
                }))}
                displayKey="name"
                valueKey="id"
                placeholder="Select or search doctor..."
              />
            </InputGroup>

            <InputGroup>
              <Label>Referred By</Label>
              <SearchableDropdown
                value={formData.referredBy}
                onChange={(value) => setFormData(prev => ({ ...prev, referredBy: value }))}
                options={doctors.map(d => ({
                  id: `${d.employeeName}`.trim(),
                  name: `${d.employeeName}`.trim()
                }))}
                displayKey="name"
                valueKey="id"
                placeholder="Select or search doctor..."
              />
            </InputGroup>
          </FormGrid>

          {/* Investigation Items Section */}
          <ProductSection>
            <SectionHeader>
              <SectionIcon>🔬</SectionIcon>
              <SectionTitle>Investigation Items</SectionTitle>
            </SectionHeader>

            <FormGrid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <InputGroup>
                <Label required>Item</Label>
                <SearchableDropdown
                  value={selectedItem}
                  onChange={handleItemChange}
                  options={items.map(item => ({
                    id: item.itemName,
                    name: item.itemName
                  }))}
                  displayKey="name"
                  valueKey="id"
                  placeholder="Select or search item..."
                  disabled={!selectedBillType}
                />
              </InputGroup>

              <InputGroup>
                <Label required>Quantity</Label>
                <QuantityControl>
                  <input
                    type="number"
                    value={quantity}
                    min="1"
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    onWheel={(e) => {
                      e.preventDefault();
                      setQuantity(prev => Math.max(1, prev + (e.deltaY > 0 ? -1 : 1)));
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

            {/* Items Table */}
            {productList.length > 0 ? (
              <ModernTable>
                <TableHead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </TableHead>
                <tbody>
                  {productList.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.itemName}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>₹ {(product.price * product.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <DeleteButton onClick={() => deleteProduct(index)}>
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

            {/* Summary Section */}
            <SummaryGrid>
              <InputGroup>
                <Label>Total</Label>
                <Input type="text" name="total" value={formData.total} readOnly />
              </InputGroup>

              <InputGroup>
                <Label>Discount (%)</Label>
                <Input
                  type="text"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleInputChange}
                />
              </InputGroup>

              <InputGroup>
                <Label>Discount Amount</Label>
                <Input
                  type="text"
                  name="discount"
                  value={formData.discount}
                  readOnly
                />
              </InputGroup>

              <InputGroup>
                <Label>Discount Remarks</Label>
                <Input
                  type="text"
                  name="discountRemarks"
                  value={formData.discountRemarks}
                  onChange={handleInputChange}
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
                <Label>Payment Method</Label>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
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