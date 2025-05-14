import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { Button, Form, Table } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";


const StyledFormContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  width: 100%;
  background: #d9e6e8; /* Custom background color */
  // margin-top: 60px;
  // margin-left: 280px;
  max-width: 1200px;
  padding: 20px;
`;

const StyledTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: bold;
  color: #15616d;
`;

const StyledTable = styled(Table)`
  margin-top: 1rem;
  border: 1px solid #ddd;
  th,
  td {
    text-align: center;
    vertical-align: middle;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px; /* Adds a gap of 20px between buttons */
  margin-top: 1rem;
`;

const StyledButton = styled(Button)`
  padding: 10px 20px;
  background: #15616d; /* Button color */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #15616d, #1d7686); /* Gradient effect */
  }
`;

const PharmacyBilling = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [formData, setFormData] = useState({
    opNumber: "",
    inpatientNo: "",
    name: "",
    doctor: "",
    roomNo: "",
    billNo: "",
    billDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get("https://hms.shinovadatabase.in/create-stock/");
        const fetchedData = response.data;
        const formattedMedicines = fetchedData.map((item) => ({
          name: item.medicine_name,
          batch_number: item.batch_number,
          mrp: parseFloat(item.mrp),
          cgst_rate: parseFloat(item.cgst_rate),
          cgst_amount: parseFloat(item.cgst_amount),
          sgst_rate: parseFloat(item.sgst_rate),
          sgst_amount: parseFloat(item.sgst_amount),
          quantity: 1, // Default quantity
        }));
        setMedicines(formattedMedicines);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };
    fetchMedicines();
  }, []);

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMedicineInput = (e) => {
    const typedMedicineName = e.target.value;
    setSearchTerm(typedMedicineName);

    const matchedMedicine = medicines.find(
      (medicine) =>
        medicine.name.toLowerCase() === typedMedicineName.toLowerCase()
    );

    if (
      matchedMedicine &&
      !addedMedicines.some((m) => m.name === matchedMedicine.name)
    ) {
      setAddedMedicines([...addedMedicines, { ...matchedMedicine, quantity: 0, total: 0 }]);
      setSearchTerm("");
    }
  };    

  const handleQuantityChange = (index, value) => {
    const updatedMedicines = [...addedMedicines];
    const quantity = Math.max(0, parseInt(value, 10) || 0); // Prevent negative or invalid values
    updatedMedicines[index].quantity = quantity;
    setAddedMedicines(updatedMedicines);
  };
  const handleSave = () => {
    alert("Data saved successfully!");
  };

  const handlePrint = () => {
    const printableContent = `
      <html>
    <head>
      <title>Pharmacy Billing</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #000;
        }
        .container {
          width: 80%;
          margin: 20px auto;
          padding: 10px;
          border: 1px solid #000;
          font-size: 14px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .hospital-details {
          text-align: left; /* Left alignment */
          font-size: 12px;
          line-height: 1.6;
          // white-space: pre-line;
          margin-bottom: 20px;
        }
        .details table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .details td {
          padding: 4px;
          font-size: 12px;
        }
        .medicine-info table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .medicine-info th, .medicine-info td {
          border: 1px solid #ddd;
          text-align: left;
          padding: 8px;
          font-size: 12px;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
          font-size: 14px;
        }
          .net-amount {
           text-align: right;
}

      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SHANMUGA HOSPITALS PVT. LTD.</h1>
        </div>
        <div class="hospital-details">
          51/24, Saradha College Road, Salem - 636007, Ph: 0427 - 2706666,<br/>
          SLS 7788 20,21 3993 20B 3848 21B,TIN No: 33692663526,CIN: U85110TZ2020PTC033974<br/>
          GST No: 33ABDC8326A1ZP    No. RM/3G/012
          
        </div>
          <div class="details">
            <h2>Patient Details</h2>
            <table>
              <tr>
                <td><strong>OP Number:</strong> ${formData.opNumber || 'NIL'}</td>
                <td><strong>Bill No:</strong> ${formData.billNo || 'NIL'}</td>
              </tr>
              <tr>
                <td><strong>Inpatient No:</strong>  ${formData.inpatientNo || 'NIL'}</td>
                <td><strong>Bill Date:</strong>  ${formData.billDate || 'NIL'}</td>
              </tr>
              <tr>
                <td><strong>Name:</strong>  ${formData.name || 'NIL'}</td> 
              </tr>

                <tr>
                <td><strong>Bill No:</strong>  ${formData.doctor || 'NIL'}</td>
             </tr>

              <tr>
                <td><strong>Bill Date:</strong>  ${formData.roomNo || 'NIL'}</td>
              </tr>

            </table>
          </div>
          <div class="medicine-info">
            <h2>Medicines</h2>
          <table>
  <thead>
    <tr>
      <th>S.No</th>
      <th>Particulars</th>
       <th>Batch</th>
      <th>Quantity</th>
      <th>EXpiry</th>
      <th>Price</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    ${addedMedicines
      .map(
        (medicine, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${medicine.name}</td>
        <td>${medicine.batch_number}</td>
        <td>${medicine.quantity}</td>
        <td>${medicine.expiry_date}</td>
        <td>${medicine.mrp.toFixed(2)}</td>
        <td>${(medicine.mrp * medicine.quantity).toFixed(2)}</td>
      </tr>
    `
      )
      .join("")}
  </tbody>
</table>

<div class="net-amount">
  <strong>Net Amount:</strong> ₹
  ${addedMedicines
    .reduce((sum, medicine) => sum + (medicine.mrp * medicine.quantity), 0)
    .toFixed(2)}
</div>

           <center> <p>MEDICINE ONCE SOLD WILL NOT BE TAKEN AGAIN<p></center>
          </div>
        </div>
      </body>
      </html>
    `;
  
    // Open new window and print content
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };
  
  
  const handleDelete = (medicineName) => {
    setAddedMedicines(
      addedMedicines.filter((medicine) => medicine.name !== medicineName)
    );
  };

  return (
    <StyledFormContainer>
      <StyledTitle>Pharmacy Billing</StyledTitle>
      <Form onSubmit={handleSubmit}>
      <Form.Group className="row">
      <div className="col-md-2">
        <Form.Label>OP Number</Form.Label>
        <Form.Control
          type="text"
          name="opNumber"
          placeholder="Enter OP Number"
          value={formData.opNumber}
          onChange={handleChange}
        />
      </div>
      <div className="col-md-2">
        <Form.Label>Inpatient No</Form.Label>
        <Form.Control
          type="text"
          name="inpatientNo"
          placeholder="Enter Inpatient No"
          value={formData.inpatientNo}
          onChange={handleChange}
        />
      </div>
      <div className="col-md-2">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="col-md-2">
        <Form.Label>Doctor</Form.Label>
        <Form.Control
          type="text"
          name="doctor"
          placeholder="Enter Doctor Name"
          value={formData.doctor}
          onChange={handleChange}
        />
      </div>
      <div className="col-md-2">
        <Form.Label>Room No</Form.Label>
        <Form.Control
          type="text"
          name="roomNo"
          placeholder="Enter Room No"
          value={formData.roomNo}
          onChange={handleChange}
        />
      </div>
      <div className="col-md-2">
        <Form.Label>Bill No</Form.Label>
        <Form.Control
          type="text"
          name="billNo"
          placeholder="Enter Bill No"
          value={formData.billNo}
          onChange={handleChange}
        />
      </div>
      <div className="col-md-2">
        <Form.Label>Bill Date</Form.Label>
        <Form.Control
          type="date"
          name="billDate"
          value={formData.billDate}
          onChange={handleChange}
        />
      </div>
    
  </Form.Group>
        <Form.Group>
          <Form.Label>Search Medicine</Form.Label>
          <Form.Control
            type="text"
            placeholder="Type medicine name..."
            value={searchTerm}
            onChange={handleMedicineInput}
            list="medicine-options"
          />
          <datalist id="medicine-options">
            {filteredMedicines.map((medicine, index) => (
              <option key={index} value={medicine.name} />
            ))}
          </datalist>
        </Form.Group>
      </Form>
      {addedMedicines.length > 0 && (
  <>
    <StyledTable striped bordered hover>
      <thead>
        <tr>
          <th>Particulars</th>
          <th>Batch</th>
          <th>Quantity</th>
          <th>MRP</th>
          <th>CGST% </th>
          <th>CGST Amount</th>
          <th>SGST%</th>
          <th>SGST Amount</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {addedMedicines.map((medicine, index) => (
          <tr key={index}>
            <td>{medicine.name}</td>
            <td>{medicine.batch_number}</td>
            <td>
              <Form.Control
                type="number"
                min="0"
                value={medicine.quantity || ""}
                onChange={(e) => {
                  const newQty = parseFloat(e.target.value) || 0;
                  const newTotal = newQty * medicine.mrp;

                  setAddedMedicines((prev) =>
                    prev.map((m, i) =>
                      i === index ? { ...m, quantity: newQty, total: newTotal } : m
                    )
                  );
                }}
              />
            </td>
            <td>{medicine.mrp.toFixed(2)}</td>
            <td>{medicine.cgst_rate.toFixed(2)}</td>
            <td>{medicine.cgst_amount.toFixed(2)}</td>
            <td>{medicine.sgst_rate.toFixed(2)}</td>
            <td>{medicine.sgst_amount.toFixed(2)}</td>
            <td>{medicine.total.toFixed(2)}</td>
            <td>
              <Button
                variant="danger"
                onClick={() => handleDelete(medicine.name)}
              >
                <FaTrashAlt />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="8" style={{ textAlign: "right", fontWeight: "bold" }}>
            Net Amount:
          </td>
          <td colSpan="2" style={{ fontWeight: "bold" }}>
            ₹
            {addedMedicines
              .reduce((sum, medicine) => sum + (medicine.total || 0), 0)
              .toFixed(2)}
          </td>
        </tr>
      </tfoot>
    </StyledTable>
    <ButtonRow>
      <StyledButton onClick={handleSave}>Save</StyledButton>
      <StyledButton onClick={handlePrint}>Print</StyledButton>
    </ButtonRow>
  </>
)}

    </StyledFormContainer>
  );
};

export default PharmacyBilling;
