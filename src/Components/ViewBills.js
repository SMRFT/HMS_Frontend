import React, { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import { FaPrint, FaEdit, FaTrash } from "react-icons/fa";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const BillsReport = () => {
  const [estimateBills, setEstimateBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [filters, setFilters] = useState({
    billType: "",
    doctor: "",
    patientType: "ALL",
    uhid: "",
  });
  const [billTypes, setBillTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate(); // Initialize navigation
  useEffect(() => {
    // Set today's date initially
    const today = dayjs().format("YYYY-MM-DD");
    setFromDate(today);
    setToDate(today);
  }, []);

  // Fetch estimate bills from backend
  useEffect(() => {
    const fetchEstimateBills = async () => {
      try {
        // Convert filters to query string
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const response = await fetch(
          `http://127.0.0.1:8000/investBillingGet/?${queryParams.toString()}`
        );

        if (response.ok) {
          const data = await response.json();
          setEstimateBills(data);
        } else {
          console.error("Failed to fetch estimate bills");
        }
      } catch (error) {
        console.error("Error fetching estimate bills:", error);
      }
    };

    fetchEstimateBills();
  }, [filters]);

  // Fetch bill types and doctors on component mount
  useEffect(() => {
    const fetchBillTypesAndDoctors = async () => {
      try {
        // Fetch bill types
        const billTypesResponse = await fetch(
          "http://127.0.0.1:8000/bill-types/"
        );
        if (billTypesResponse.ok) {
          const billTypesData = await billTypesResponse.json();
          setBillTypes(billTypesData.items || []);
        }

        // Fetch doctors
        const doctorsResponse = await fetch(
          "http://127.0.0.1:8000/doctor_list/"
        );
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          setDoctors(doctorsData);
        }
      } catch (error) {
        console.error("Error fetching bill types or doctors:", error);
      }
    };

    fetchBillTypesAndDoctors();
  }, []);

  // Apply client-side filtering when estimateBills changes
  useEffect(() => {
    const filtered = estimateBills.filter((bill) => {
      // Filter by date if needed (in case API doesn't handle date filtering)
      if (fromDate && toDate) {
        const billDate = new Date(bill.investBillDate);
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        // Set hours to 0 for proper date comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999); // End of day

        if (billDate < startDate || billDate > endDate) {
          return false;
        }
      }

      // Filter by Patient Type
      if (filters.patientType === "IP" && !(bill.uhid && bill.ipNumber)) {
        return false; // Show only rows with both uhid & ipNumber
      }
      if (filters.patientType === "OP" && !(bill.uhid && !bill.ipNumber)) {
        return false; // Show only rows with uhid and no ipNumber
      }

      // Filter by Bill Type
      if (filters.billType && bill.billType !== filters.billType) {
        return false;
      }

      // Filter by Doctor
      if (filters.doctor && bill.doctor !== filters.doctor) {
        return false;
      }

      // Filter by UHID
      if (filters.uhid && !bill.uhid.includes(filters.uhid)) {
        return false;
      }

      return true; // Show row if all conditions pass
    });

    setFilteredBills(filtered);
  }, [estimateBills, filters, fromDate, toDate]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle date changes
  const handleDateChange = (date, dateType) => {
    if (dateType === "from") {
      setFromDate(date ? date.format("YYYY-MM-DD") : "");
    } else {
      setToDate(date ? date.format("YYYY-MM-DD") : "");
    }
  };

  // Handle print
  const handlePrint = (bill) => {
    // Create a new window for the print document
    const printWindow = window.open("", "_blank", "height=600,width=800");

    // Format date for the header
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

    // Format patient name
    const formatPatientName = (salutation, firstName, middleName, lastName) => {
      return `${salutation || ""} ${firstName || ""} ${
        middleName ? middleName + " " : ""
      }${lastName || ""}`.trim();
    };

    // Generate HTML content for the print window
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estimate Bill Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .hospital-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 3px;
          }
          .address {
            margin-bottom: 3px;
          }
          .bill-title {
            font-weight: bold;
            display: inline-block;
            margin-right: 10px;
          }
          .bill-subtitle {
            font-weight: bold;
            display: inline-block;
            margin-left: 10px;
          }
          .bill-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .bill-details-left, .bill-details-right {
            width: 48%;
          }
          .bill-row {
            display: flex;
            margin-bottom: 5px;
          }
          .bill-label {
            font-weight: bold;
            width: 100px;
          }
          .bill-value {
            flex-grow: 1;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .text-right {
            text-align: right;
          }
          .signature {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
          }
          .total-section {
            margin-top: 10px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .total-label {
            font-weight: bold;
          }
          .net-amount {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
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
              <div class="bill-value">: ${formatDateTime(
                bill.investBillDate,
                bill.time
              )}</div>
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
            ${
              Array.isArray(bill.item)
                ? bill.item
                    .map(
                      (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.itemName || ""}</td>
                  <td>${item.quantity || 1}</td>
                  <td>${parseFloat(item.price).toFixed(2)}</td>
                  <td>${(
                    parseFloat(item.price) * parseInt(item.quantity || 1)
                  ).toFixed(2)}</td>
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
            <div class="total-value">${parseFloat(bill.total || 0).toFixed(2)}
</div>
          </div>
          <div class="total-row">
            <div class="total-label">Discount</div>
            <div class="total-value">${bill.discount || ""}</div>
          </div>
          
          <div class="total-row net-amount">
            <div class="total-label">Net Amount</div>
            <div class="total-value">${bill.finalPrice || ""}</div>
          </div>
        </div>
        
        <div class="signature">
          <div>${bill.uhid || ""}</div>
          <div>(Signature)</div>
        </div>
      </body>
      </html>
    `;

    // Write the HTML to the new window and print
    printWindow.document.write(html);
    printWindow.document.close();

    // Add a slight delay before printing to ensure content is fully loaded
    setTimeout(() => {
      printWindow.print();
      // Uncomment below if you want the print window to close after printing
      // printWindow.close();
    }, 500);

    console.log("Printing bill:", bill);
  };

  // Handle convert
  const handleEdit = (bill) => {
    navigate("/InvestigationBilling", { state: { patientData: bill } });
  };
  const handleDelete = async (bill) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete bill: ${bill.investBillNo}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/delete-bill/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billId: bill._id,
          billType: bill.billType,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Bill deleted and moved to Recycle Bin.");
        // Optionally refresh the UI here
      } else {
        console.error(result);
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the bill.");
    }
  };

  // Function to format patient name
  const formatPatientName = (salutation, firstName, middleName, lastName) => {
    return `${salutation} ${firstName} ${
      middleName ? middleName + " " : ""
    }${lastName}`;
  };

  return (
    <div className="container-fluid p-3">
      <h2 className="mb-4">Bills</h2>

      {/* Filters */}
      <Form className="mb-4">
        <Row>
          <Col xs={12} md={2}>
            <Form.Group>
              <label>From Date</label>
              <DatePicker
                value={fromDate ? dayjs(fromDate) : null}
                onChange={(date) => handleDateChange(date, "from")}
                format="YYYY-MM-DD"
                className="form-control"
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={2}>
            <Form.Group>
              <label>To Date</label>
              <DatePicker
                value={toDate ? dayjs(toDate) : null}
                onChange={(date) => handleDateChange(date, "to")}
                format="YYYY-MM-DD"
                className="form-control"
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={2}>
            <Form.Group>
              <Form.Label>Bill Type</Form.Label>
              <Form.Select
                name="billType"
                value={filters.billType}
                onChange={handleFilterChange}
              >
                <option value="">Select Bill Type</option>
                {[...new Set(billTypes.map((bill) => bill.billType))].map(
                  (billType, index) => (
                    <option key={index} value={billType}>
                      {billType}
                    </option>
                  )
                )}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={2}>
            <Form.Group>
              <Form.Label>Doctor</Form.Label>
              <Form.Select
                name="doctor"
                value={filters.doctor}
                onChange={handleFilterChange}
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option
                    key={doctor.id}
                    value={`${doctor.first_name} ${doctor.middle_name || ""} ${
                      doctor.last_name
                    }`.trim()}
                  >
                    {`${doctor.first_name} ${doctor.middle_name || ""} ${
                      doctor.last_name
                    }`.trim()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={2}>
            <Form.Group>
              <Form.Label>UHID</Form.Label>
              <Form.Control
                type="text"
                name="uhid"
                value={filters.uhid}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          {/* Patient Type Filter */}
          <Col xs={12} md={2}>
            <Form.Group>
              <Form.Label>Patient Type</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="OP"
                  name="patientType"
                  value="OP"
                  checked={filters.patientType === "OP"}
                  onChange={handleFilterChange}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="IP"
                  name="patientType"
                  value="IP"
                  checked={filters.patientType === "IP"}
                  onChange={handleFilterChange}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="ALL"
                  name="patientType"
                  value="ALL"
                  checked={filters.patientType === "ALL"}
                  onChange={handleFilterChange}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Bills Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Bill Date</th>
            <th>Time</th>
            <th>Bill No</th>
            <th>UHID No</th>
            <th>IP No</th>
            <th>Patient Name</th>
            <th>Age</th>
            <th>Room No</th>
            <th>Bill Type</th>
            <th>Items</th>
            <th>Bill Amount</th>
            <th>Payment Method</th>
            <th>Doctor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBills.length > 0 ? (
            filteredBills.map((bill, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td style={{ whiteSpace: "nowrap" }}>{bill.investBillDate}</td>
                <td>{bill.time}</td>
                <td>{bill.investBillNo}</td>
                <td>{bill.uhid}</td>
                <td>{bill.ipNumber}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {formatPatientName(
                    bill.salutation,
                    bill.firstName,
                    bill.middleName,
                    bill.lastName
                  )}
                </td>
                <td>{bill.age}</td>
                <td>{bill.roomNo}</td>
                <td>{bill.billType}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {Array.isArray(bill.item)
                    ? bill.item.map((item, index) => (
                        <div key={index}>
                          {item.itemName} - ₹{item.price} (Qty: {item.quantity})
                        </div>
                      ))
                    : "No Items"}
                </td>

                <td style={{ whiteSpace: "nowrap" }}>₹ {bill.finalPrice}</td>
                <td>{bill.paymentMethod}</td>
                <td style={{ whiteSpace: "nowrap" }}>{bill.doctor}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <FaPrint
                    title="Print"
                    style={{
                      cursor: "pointer",
                      marginRight: "10px",
                      color: "#0d6efd",
                    }}
                    onClick={() => handlePrint(bill)}
                  />
                  <FaEdit
                    title="Edit"
                    style={{
                      cursor: "pointer",
                      marginRight: "10px",
                      color: "#6c757d",
                    }}
                    onClick={() => handleEdit(bill)}
                  />
                  <FaTrash
                    title="Delete"
                    style={{ cursor: "pointer", color: "#dc3545" }}
                    onClick={() => handleDelete(bill)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className="text-center py-4">
                No matching records found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default BillsReport;
