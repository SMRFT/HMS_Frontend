import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const DoctorContainer = styled.div`
  max-width: 400px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const FeeContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;
`;

const FeeItem = styled.div`
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: calc(100% - 20px);
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &.reset {
    background-color: #6abf69;
  }

  &.save {
    background-color: #007bff;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [consultingFee, setConsultingFee] = useState(0);
  const [totalFees, setTotalFees] = useState(0);

  useEffect(() => {
    axios
      .get("https://hms.shinovadatabase.in/doctor_list/")
      .then((response) => {
        const doctorsData = response.data.map((doctor) => ({
          name: `${doctor.first_name} ${doctor.middle_name || ""} ${doctor.last_name}`.trim(),
          registrationFee: parseFloat(doctor.registration_fee),
          consultingFee: parseFloat(doctor.consulting_fee),
        }));
        setDoctors(doctorsData);
      })
      .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  const handleDoctorChange = (event) => {
    const doctorName = event.target.value;
    const selected = doctors.find((doctor) => doctor.name === doctorName);
    setSelectedDoctor(selected);

    if (selected) {
      const registrationFee = selected.registrationFee || 0;
      const consultingFee = selected.consultingFee || 0;

      setRegistrationFee(registrationFee);
      setConsultingFee(consultingFee);
      setTotalFees(registrationFee + consultingFee);
    } else {
      setRegistrationFee(0);
      setConsultingFee(0);
      setTotalFees(0);
    }
  };

  const handleFeeChange = (feeType, value) => {
    const newFee = parseFloat(value) || 0;
    if (feeType === "registration") {
      setRegistrationFee(newFee);
      setTotalFees(newFee + consultingFee);
    } else if (feeType === "consulting") {
      setConsultingFee(newFee);
      setTotalFees(registrationFee + newFee);
    }
  };

  const handleReset = () => {
    setSelectedDoctor(null);
    setRegistrationFee(0);
    setConsultingFee(0);
    setTotalFees(0);
  };

  const handleSave = () => {
    alert("Details saved successfully!");
  };

  return (
    <DoctorContainer>
      <h2>Doctor Fee Calculator</h2>
      <div>
        <Label htmlFor="doctorSelect">Doctor</Label>
        <Select id="doctorSelect" onChange={handleDoctorChange}>
          <option value="">-- Select a Doctor --</option>
          {doctors.map((doctor, index) => (
            <option key={index} value={doctor.name}>
              {doctor.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedDoctor && (
        <FeeContainer>
          <FeeItem>
            <Label htmlFor="registrationFee">Registration Fee (₹):</Label>
            <Input
              id="registrationFee"
              type="number"
              value={registrationFee.toFixed(2)}
              onChange={(e) => handleFeeChange("registration", e.target.value)}
            />
          </FeeItem>
          <FeeItem>
            <Label htmlFor="consultingFee">Consulting Fee (₹):</Label>
            <Input
              id="consultingFee"
              type="number"
              value={consultingFee.toFixed(2)}
              onChange={(e) => handleFeeChange("consulting", e.target.value)}
            />
          </FeeItem>
          <FeeItem>
            <strong>Total Fees:</strong> ₹{totalFees.toFixed(2)}
          </FeeItem>
        </FeeContainer>
      )}

      <ButtonContainer>
        <Button className="reset" onClick={handleReset}>
          Reset
        </Button>
        <Button className="save" onClick={handleSave}>
          Save
        </Button>
      </ButtonContainer>
    </DoctorContainer>
  );
};

export default DoctorList;
