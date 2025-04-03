import React, { useState } from "react";
import { Form, Alert, Container, Row, Col } from "react-bootstrap";
import styled, { keyframes } from "styled-components";

// Button animation
const clickAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

const SubmitButton = styled.button`
  width: 80px;
  height: 35px;
  background-color: #007BFF;
  color: white;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(0.95);
  }
  &:active {
    animation: ${clickAnimation} 0.2s ease-in-out;
  }
`;

const QRScanForm= () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    company: "",
    searchFor: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://hms.shinovadatabase.in/qrsubmit_form/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <Container>
      {submitted ? (
        <Alert variant="success" className="text-center">
          <h4>Thanks for contacting us!</h4>
          <p>We will get back to you soon.</p>
        </Alert>
      ) : (
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} className="p-4 border rounded shadow-lg">
            <h3 className="text-center mb-4">Contact Form</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email ID</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mobile No</Form.Label>
                <Form.Control type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control type="text" name="company" value={formData.company} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Searching For</Form.Label>
                <Form.Control type="text" name="searchFor" value={formData.searchFor} onChange={handleChange} required />
              </Form.Group>
              <div className="text-center">
                <SubmitButton type="submit">Submit</SubmitButton>
              </div>
            </Form>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default QRScanForm;
