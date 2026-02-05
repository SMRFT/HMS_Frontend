import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";

// Modal Background
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Modal Container
const ModalContainer = styled.div`
  background: white;
  width: 650px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

// Header with Color
const ModalHeader = styled.div`
  background: #2f7e77;
  color: white;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  border-radius: 10px 10px 0 0;
`;

// Close Button
const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
`;

// Form Row
const FormRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

// Form Group
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

// Input Field
const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

// Buttons
const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: ${(props) => (props.cancel ? "#999" : "#2f7e77")};
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  flex: 1;
  margin: 0 5px;
`;

const ReferenceDoctorForm = ({ closeModal, setReferredBy, fetchReferenceDoctors }) => {
  const [formData, setFormData] = useState({
    doctor: "",
    qualification: "",
    mobile1: "",
    area: "",
    clinic_name: "",
    email: "",
    clinic_address: ["", "", ""],
    clinic_phone: "",
  });

  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddressChange = (e, index) => {
    const newAddress = [...formData.clinic_address];
    newAddress[index] = e.target.value;
    setFormData({
      ...formData,
      clinic_address: newAddress,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${Hmsbaseurl}add-reference-doctor/`, formData);
      alert("Doctor added successfully!");
      if (typeof setReferredBy === "function") {
        setReferredBy(formData.doctor);
      }
      if (typeof fetchReferenceDoctors === "function") {
        fetchReferenceDoctors();
      }
      closeModal();
    } catch (error) {
      console.error("Error saving doctor:", error);
      alert("Failed to save doctor.");
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          Reference Doctor
          <CloseButton onClick={closeModal}>×</CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          <FormRow>
            <FormGroup>
              <label>Doctor</label>
              <Input type="text" name="doctor" value={formData.doctor} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <label>Qualification</label>
              <Input type="text" name="qualification" value={formData.qualification} onChange={handleChange} />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label>Mobile</label>
              <Input type="text" name="mobile1" value={formData.mobile1} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <label>Area</label>
              <Input type="text" name="area" value={formData.area} onChange={handleChange} />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label>Clinic Name</label>
              <Input type="text" name="clinic_name" value={formData.clinic_name} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <label>Email</label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} />
            </FormGroup>
          </FormRow>

          <h4>Clinic Address</h4>
          <FormRow>
            {formData.clinic_address.map((addr, index) => (
              <FormGroup key={index}>
                <Input type="text" value={addr} onChange={(e) => handleAddressChange(e, index)} />
              </FormGroup>
            ))}
          </FormRow>

          <FormRow>
            <FormGroup>
              <label>Clinic Phone</label>
              <Input type="text" name="clinic_phone" value={formData.clinic_phone} onChange={handleChange} />
            </FormGroup>
          </FormRow>

          <ButtonRow>
            <Button cancel onClick={closeModal} type="button">Cancel</Button>
            <Button type="submit">Save</Button>
          </ButtonRow>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ReferenceDoctorForm;
