import { useState, useEffect } from "react";
import styled from 'styled-components';
import { Row, Col } from 'reactstrap';
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f4f4;
  position: relative;
`;

const Label = styled.div`
  position: absolute;
  top: 10px;
  right: 0;
  background: linear-gradient(to right, #ff7f00, #d97706);
  color: white;
  padding: 5px 40px 5px 35px; /* Increased left padding to create space before text */
  font-weight: bold;
  font-size: 14px;
  border-radius: 0 5px 5px 0;
  clip-path: polygon(0% 0%, 10% 50%, 0% 100%, 100% 100%, 100% 0%);
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;


// Container for the form
const FormContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
`;

// Container for products and additional details
const ProductContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// Flexible row for inputs
const InputRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
`;

// Input group for form elements
const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 150px;
`;

// Label for form inputs
const Label1 = styled.label`
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
`;

// Styled input
const Input = styled.input`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
`;

// Styled select
const Select = styled.select`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
`;

// Styled button
const Button = styled.button`
    padding: 8px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #45a049;
    }
`;

// Table for displaying added products
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
        font-weight: 600;
    }
`;

// Button group for form actions
const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 20px;
`;

// Reset button
const ResetButton = styled(Button)`
    background-color: #f44336;

    &:hover {
        background-color: #d32f2f;
    }
`;
const EstimateButton = styled(Button)`
    background-color:  #ff7f00;

    &:hover {
        background-color: #ff7f00;
    }
`;

// Submit button
const SubmitButton = styled(Button)`
    background-color: #2196F3;

    &:hover {
        background-color: #1976D2;
    }
`;

export {
    Wrapper,
    FormContainer,
    ProductContainer,
    InputRow,
    InputGroup,
    Label,
    Label1,
    Input,
    Select,
    Button,
    Table,
    ButtonGroup,
    ResetButton,
    SubmitButton
};
const InvestigationBilling = () => {
    const [formData, setFormData] = useState({
        investBillNo: '',
        investBillDate: '',
        time: '',
        uhid: '',
        ipNumber: '',
        salutation: '',
        firstName: '',
        middleName: '',
        lastName: '',
        age: '',
        gender: '',
        doctor: '',
        billType: '',
        item: JSON.stringify([]),
        referredBy: '',
        discountPercent: '',
        discount: '',
        discountRemarks: '',
        total: 0,
        finalPrice: 0,
    });

    const [doctors, setDoctors] = useState([]);
    const [billTypes, setBillTypes] = useState([]);  // Initialize as empty array
    const [items, setItems] = useState([]);  // Initialize as empty array
    const [selectedBillType, setSelectedBillType] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');
    const [productList, setProductList] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();



    // Fetch Bill Types from Backend
    useEffect(() => {
        fetch("http://localhost:8000/bill-types/")
            .then(response => response.json())
            .then(data => {
                console.log("Fetched Bill Types:", data);
                // Assuming the response has an 'items' key with bill type data
                setBillTypes(data.items || []);
            })
            .catch(error => console.error("Error fetching bill types:", error));
    }, []);

    // Handle Bill Type Change
    const handleBillTypeChange = (event) => {
        const selectedType = event.target.value;

        // Update selected bill type in form data and state
        setFormData(prev => ({
            ...prev,
            billType: selectedType
        }));
        setSelectedBillType(selectedType);

        // Filter items for the selected bill type
        const filteredItems = billTypes
            .filter(item => item.billType === selectedType)
            .map(item => ({
                itemName: item.itemName,
                price: item.Price
            }));

        setItems(filteredItems);

        // Reset item and price selections
        setSelectedItem('');
        setSelectedPrice('');
    };

    // Handle Item Change
    const handleItemChange = (event) => {
        const selectedItemName = event.target.value;

        // Update selected item in form data and state
        setFormData(prev => ({
            ...prev,
            item: selectedItemName
        }));
        setSelectedItem(selectedItemName);

        // Find and set the price for the selected item
        const selectedItemObj = items.find(item => item.itemName === selectedItemName);
        if (selectedItemObj) {
            const price = selectedItemObj.price;
            setFormData(prev => ({
                ...prev,
                price: price
            }));
            setSelectedPrice(price);
        } else {
            setSelectedPrice('');
        }
    };
    const handleQuantityChange = (amount) => {
        setQuantity((prevQuantity) => Math.max(1, prevQuantity + amount));
    };


    const addProduct = () => {
        if (selectedItem && selectedPrice) {
            const newProduct = {
                itemName: selectedItem,
                price: selectedPrice,
                quantity: quantity // Include quantity
            };

            const updatedList = [...productList, newProduct];
            setProductList(updatedList);

            // Store as JSON in formData
            setFormData(prev => ({
                ...prev,
                item: JSON.stringify(updatedList) // Convert array to JSON string
            }));

            // Reset fields after adding
            setSelectedItem("");
            setSelectedPrice("");
            setQuantity(1); // Reset quantity to default
        }
    };


    const deleteProduct = (index) => {
        const updatedList = productList.filter((_, i) => i !== index);
        setProductList(updatedList);

        // Update formData with new JSON string
        setFormData(prev => ({
            ...prev,
            item: JSON.stringify(updatedList)
        }));
    };



    // Set default date and time
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        const currentTime = `${hours}:${minutes}:${seconds}`;
        console.log(currentTime);



        setFormData(prev => ({
            ...prev,
            investBillDate: today,
            time: currentTime
        }));
    }, []); // Set once when the component mounts


    const [productData, setProductData] = useState({
        productName: "",
        quantity: "",
        price: "",
        amount: "",
    });

    const fetchPatientDetails = async () => {
        if (!formData.uhid) {
            alert("Please enter UHID");
            return;
        }

        const encodedUhid = encodeURIComponent(formData.uhid);

        try {
            const response = await fetch(`http://127.0.0.1:8000/op-patient/${encodedUhid}/`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    ...formData,
                    salutation: data.salutation || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    age: data.age || '',
                    gender: data.gender || '',
                });
            } else {
                alert("Patient not found");
            }
        } catch (error) {
            console.error("Error fetching patient data:", error);
            alert("Error fetching patient details");
        }
    };


    const fetchIpPatient = async () => {
        if (!formData.ipNumber) {
            alert("Please enter IP Number");
            return;
        }

        const encodedipNumber = encodeURIComponent(formData.ipNumber);

        try {
            const response = await fetch(`http://127.0.0.1:8000/ip-patient/${encodedipNumber}/`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    ...formData,
                    uhid: data.uhid || '',
                    salutation: data.salutation || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    age: data.age || '',
                    gender: data.gender || '',
                });
            } else {
                alert("Patient not found");
            }
        } catch (error) {
            console.error("Error fetching patient data:", error);
            alert("Error fetching patient details");
        }
    };


    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/doctor_list/");
                if (response.ok) {
                    const data = await response.json();
                    setDoctors(data);  // Store the fetched doctor data
                } else {
                    console.error("Failed to fetch doctors");
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };

        fetchDoctors();
    }, []); // Runs once when the component mounts

    const handleReset = () => {
        window.location.reload();
    };

    const handleEstimate = async (e) => {
        e.preventDefault();

        const formPayload = {
            EstBillNo: formData.investBillNo,
            EstBillDate: formData.investBillDate,
            time: formData.time,
            uhid: formData.uhid,
            ipNumber: formData.ipNumber,
            salutation: formData.salutation,
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            age: formData.age,
            gender: formData.gender,
            doctor: formData.doctor,
            billType: formData.billType,
            referredBy: formData.referredBy,
            discountPercent: formData.discountPercent ? parseFloat(formData.discount) : 0,
            discount: formData.discount ? parseFloat(formData.discount) : 0,  // Convert to number, default to 0
            discountRemarks: formData.discountRemarks,
            total: formData.total,
            finalPrice: formData.finalPrice,
            item: productList.map(product => ({ itemName: product.itemName, price: product.price, quantity: product.quantity }))
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/estimateBilling/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formPayload),
            });

            if (response.ok) {
                alert('Form data saved successfully!');
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Failed to save form data: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving form data!');
        }
        window.location.reload();
    };

    // In the submit handler, corrected error message template literal
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formPayload = {
            investBillNo: formData.investBillNo,
            investBillDate: formData.investBillDate,
            time: formData.time,
            uhid: formData.uhid,
            ipNumber: formData.ipNumber,
            salutation: formData.salutation,
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            age: formData.age,
            gender: formData.gender,
            doctor: formData.doctor,
            billType: formData.billType,
            referredBy: formData.referredBy,
            discountPercent: formData.discountPercent,
            discount: formData.discount,
            discountRemarks: formData.discountRemarks,
            total: formData.total,
            finalPrice: formData.finalPrice,
            item: productList.map(product => ({ itemName: product.itemName, price: product.price, quantity: product.quantity }))
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/investBilling/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formPayload),
            });

            if (response.ok) {
                alert('Form data saved successfully!');
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Failed to save form data: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving form data!');
        }

    };


    // Calculate the total price based on the table data
    useEffect(() => {
        const totalPrice = productList.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);

        setFormData(prevFormData => ({
            ...prevFormData,
            total: totalPrice  // Set total in form data
        }));
    }, [productList]);


    // Calculate discount and final price when total or discount percent changes
    useEffect(() => {
        const discountAmount = (formData.total * formData.discountPercent) / 100;
        const calculatedFinalPrice = formData.total - discountAmount;

        setFormData(prevFormData => ({
            ...prevFormData,
            discount: discountAmount.toFixed(2), // Ensuring 2 decimal places
            finalPrice: calculatedFinalPrice.toFixed(2)
        }));
    }, [formData.total, formData.discountPercent]);

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value
        }));
    };


    return (
        <Wrapper>
            <Label>SHANMUGA HOSPITAL PVT LTD</Label>
            {/* Navigation Labels */}
            <div className="d-flex justify-content-start gap-3 mb-3">
                <span
                    className="text-primary fw-bold cursor-pointer"
                    onClick={() => navigate("/ViewEstimate")}
                    style={{ cursor: "pointer" }}
                >
                    View Estimate
                </span>
                <span
                    className="text-primary fw-bold cursor-pointer"
                    onClick={() => navigate("/view-bills")}
                    style={{ cursor: "pointer" }}
                >
                    View Bills
                </span>
            </div>
            <FormContainer>
                <h2 className="text-center mb-4">Investigation Billing</h2>
                <form onSubmit={handleSubmit}>
                    {/* First Section */}
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label className="form-label">UHID:</label>
                            <input type="text" name="uhid" value={formData.uhid} onChange={handleInputChange} className="form-control" />
                            <button type="button" onClick={fetchPatientDetails} className="btn btn-primary mt-2">Search</button>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">IP Number:</label>
                            <input type="text" name="ipNumber" value={formData.ipNumber} onChange={handleInputChange} className="form-control" />
                            <button type="button" onClick={fetchIpPatient} className="btn btn-primary mt-2">Search</button>
                        </div>

                        <div className="col-md-1">
                            <label className="form-label">Salutation:</label>
                            <input type="text" name="salutation" value={formData.salutation} onChange={handleInputChange} className="form-control" />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">First Name:</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-control" />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">Last Name:</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-control" />
                        </div>

                        <div className="col-md-1">
                            <label className="form-label">Age:</label>
                            <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="form-control" />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">Gender:</label>
                            <input type="text" name="gender" value={formData.gender} onChange={handleInputChange} className="form-control" />
                        </div>
                    </div>


                    {/* Second Section */}
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label className="form-label">Bill Date:</label>
                            <input type="date" name="investBillDate" value={formData.investBillDate} onChange={handleInputChange} className="form-control" />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">Bill Time:</label>
                            <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="form-control" />
                        </div>

                        {/* Bill Type Dropdown */}
                        <div className="col-md-3">
                            <label className="form-label">Bill Type *</label>
                            <select
                                value={selectedBillType}
                                onChange={handleBillTypeChange}
                                className="form-select"
                            >
                                <option value="">Select Bill Type</option>
                                {/* Use unique bill types */}
                                {[...new Set(billTypes.map(item => item.billType))].map((billType, index) => (
                                    <option key={index} value={billType}>
                                        {billType}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Doctor:</label>
                            <select name="doctor" value={formData.doctor} onChange={handleInputChange} className="form-select">
                                <option value="">Select Doctor</option>
                                {doctors.map((doctor) => (
                                    <option
                                        key={doctor.id}
                                        value={`${doctor.first_name} ${doctor.middle_name || ''} ${doctor.last_name}`.trim()}
                                    >
                                        {`${doctor.first_name} ${doctor.middle_name || ''} ${doctor.last_name}`.trim()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">Referred By:</label>
                            <select name="referredBy" value={formData.referredBy} onChange={handleInputChange} className="form-select">
                                <option value="">Select Doctor</option>
                                {doctors.map((doctor) => (
                                    <option
                                        key={doctor.id}
                                        value={`${doctor.first_name} ${doctor.middle_name || ''} ${doctor.last_name}`.trim()}
                                    >
                                        {`${doctor.first_name} ${doctor.middle_name || ''} ${doctor.last_name}`.trim()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>




                    {/* Product Container with Discount, Discount Remarks, and Total */}
                    <ProductContainer>
                        <h3>Investigation Items</h3>
                        <InputRow>
                            {/* Item Selection */}
                            <InputGroup>
                                <Label1>Item *</Label1>
                                <select
                                    value={selectedItem}
                                    onChange={handleItemChange}
                                    className="form-select"
                                    disabled={!selectedBillType}
                                >
                                    <option value="">Select Item</option>
                                    {items.map((item, index) => (
                                        <option key={index} value={item.itemName}>
                                            {item.itemName}
                                        </option>
                                    ))}
                                </select>
                            </InputGroup>
                            <InputGroup>
                                <Label1>Quantity *</Label1>
                                <div className="quantity-control">
                                    <input
                                        type="number"
                                        value={quantity}
                                        className="form-control"
                                        min="1"
                                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} // Ensure minimum value is 1
                                        onWheel={(e) => handleQuantityChange(e.deltaY > 0 ? -1 : 1)} // Scroll up increases, scroll down decreases
                                    />
                                </div>
                            </InputGroup>



                            {/* Price Display */}
                            <InputGroup>
                                <Label1>Price *</Label1>
                                <input
                                    type="text"
                                    value={selectedPrice}
                                    readOnly
                                    className="form-control"
                                />
                            </InputGroup>

                            {/* Add Button */}
                            <Button type="button" onClick={addProduct}>+ Add</Button>
                        </InputRow>

                        {/* Table to Display Added Items */}
                        <Table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productList.map((product, index) => (
                                    <tr key={index}>
                                        <td>{product.itemName}</td>
                                        <td>{product.quantity}</td>
                                        <td>₹ {product.price * product.quantity}</td>
                                        <td>
                                            <button onClick={() => deleteProduct(index)}>🗑</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Discount, Discount Remarks, and Total Moved Here */}
                        <InputRow>
                            <InputGroup>
                                <Label1>Total:</Label1>
                                <Input type="text" name="total" value={formData.total} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Label1>Discount(%):</Label1>
                                <Input type="text" name="discountPercent" value={formData.discountPercent} onChange={handleInputChange} />
                            </InputGroup>
                            <InputGroup>
                                <Label1>Discount:</Label1>
                                <Input type="text" name="discount" value={formData.discount} onChange={handleInputChange} />
                            </InputGroup>

                            <InputGroup>
                                <Label1>Discount Remarks:</Label1>
                                <Input type="text" name="discountRemarks" value={formData.discountRemarks} onChange={handleInputChange} />
                            </InputGroup>
                            <InputGroup>
                                <Label1>Final Price:</Label1>
                                <Input type="text" name="finalPrice" value={formData.finalPrice} readOnly />
                            </InputGroup>

                        </InputRow>

                        <ButtonGroup>
                            <ResetButton type="button" onClick={handleReset}>Reset</ResetButton>
                            <EstimateButton type="button" onClick={handleEstimate}>Make Estimate</EstimateButton>
                            <SubmitButton type="submit">Save</SubmitButton>
                        </ButtonGroup>
                    </ProductContainer>
                </form>
            </FormContainer>
        </Wrapper>
    );

};

export default InvestigationBilling;
