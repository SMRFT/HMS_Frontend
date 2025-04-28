import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';

const EstimateBillsReport = () => {
    const [estimateBills, setEstimateBills] = useState([]);
    const [filters, setFilters] = useState({
        billType: '',
        doctor: '',
        patientType: 'ALL',
        uhid: ''
    });
    const [billTypes, setBillTypes] = useState([]);
    const [doctors, setDoctors] = useState([]);

    // Fetch estimate bills from backend
    useEffect(() => {
        const fetchEstimateBills = async () => {
            try {
                // Convert filters to query string
                const queryParams = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });

                const response = await fetch(`http://127.0.0.1:8000/estimate-billings/?${queryParams.toString()}`);

                if (response.ok) {
                    const data = await response.json();
                    setEstimateBills(data);
                } else {
                    console.error('Failed to fetch estimate bills');
                }
            } catch (error) {
                console.error('Error fetching estimate bills:', error);
            }
        };

        fetchEstimateBills();
    }, [filters]);

    // Fetch bill types and doctors on component mount
    useEffect(() => {
        const fetchBillTypesAndDoctors = async () => {
            try {
                // Fetch bill types
                const billTypesResponse = await fetch('http://127.0.0.1:8000/bill-types/');
                if (billTypesResponse.ok) {
                    const billTypesData = await billTypesResponse.json();
                    setBillTypes(billTypesData.items || []);
                }

                // Fetch doctors
                const doctorsResponse = await fetch('http://127.0.0.1:8000/doctor_list/');
                if (doctorsResponse.ok) {
                    const doctorsData = await doctorsResponse.json();
                    setDoctors(doctorsData);
                }
            } catch (error) {
                console.error('Error fetching bill types or doctors:', error);
            }
        };

        fetchBillTypesAndDoctors();
    }, []);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle print
    const handlePrint = (bill) => {
        // Implement print functionality for specific bill
        console.log('Printing bill:', bill);
    };

    // Handle convert
    const handleConvert = (bill) => {
        // Implement conversion functionality for specific bill
        console.log('Converting bill:', bill);
    };


    // Function to format patient name
    const formatPatientName = (salutation, firstName, middleName, lastName) => {
        return `${salutation} ${firstName} ${middleName ? middleName + " " : ""}${lastName}`;
    };

    const filteredBills = estimateBills.filter((bill) => {
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
    
    return (
        <div className="container-fluid p-3">
            <h2 className="mb-4">Estimate Bills</h2>

            {/* Filters */}
            <Form className="mb-4">
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>Bill Type</Form.Label>
                            <Form.Select
                                name="billType"
                                value={filters.billType}
                                onChange={handleFilterChange}
                            >
                                <option value="">Select Bill Type</option>
                                {billTypes.map((billType, index) => (
                                    <option key={index} value={billType.billType}>
                                        {billType.billType}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
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
                                        value={`${doctor.first_name} ${doctor.middle_name || ''} ${doctor.last_name}`.trim()}
                                    >
                                        {`${doctor.first_name} ${doctor.middle_name || ''} ${doctor.last_name}`.trim()}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
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
                    <Col>
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

                    <Col className="d-flex align-items-end">
                        {/* Search button is now unnecessary as filters trigger auto-search */}
                    </Col>
                </Row>
            </Form>

            {/* Estimate Bills Table */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Sl.No</th>
                        <th>Estimate Date</th>
                        <th>Time</th>
                        <th>Estimate No</th>
                        <th>UHID No</th>
                        <th>IP No</th>
                        <th>Patient Name</th>
                        <th>Age</th>
                        <th>Room No</th>
                        <th>Bill Type</th>
                        <th>Items</th>
                        <th>Estimate Amount</th>
                        <th>Doctor</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBills.length > 0 ? (
                        filteredBills.map((bill, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{bill.EstBillDate}</td>
                                <td>{bill.time}</td>
                                <td>{bill.EstBillNo}</td>
                                <td>{bill.uhid}</td>
                                <td>{bill.ipNumber}</td>
                                <td>{formatPatientName(bill.salutation, bill.firstName, bill.middleName, bill.lastName)}</td>
                                <td>{bill.age}</td>
                                <td>{bill.roomNo}</td>
                                <td>{bill.billType}</td>
                                <td>
                                    {Array.isArray(bill.item) ? (
                                        bill.item.map((item, index) => (
                                            <div key={index}>
                                                {item.itemName} - ₹{item.price} (Qty: {item.quantity})
                                            </div>
                                        ))
                                    ) : (
                                        "No Items"
                                    )}
                                </td>

                                <td>₹ {bill.finalPrice}</td>
                                <td>{bill.doctor}</td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handlePrint(bill)}
                                    >
                                        Print
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => handleConvert(bill)}
                                    >
                                        Convert
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" className="text-center py-4">No matching records found</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default EstimateBillsReport;