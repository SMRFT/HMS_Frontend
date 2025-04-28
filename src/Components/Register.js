import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Styled Components
const StyledFormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to right, #4facfe, #00f2fe);
`;

const StyledForm = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const StyledButton = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 5px;
  font-size: 1rem;
  margin-top: 1rem;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(38, 143, 255, 0.5);
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    role: "Admin",
    department: "IT",
    designation: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setSuccessMessage("");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/register/",
        formData
      );
      setSuccessMessage("Registration successful!");
      setErrorMessage("");
      console.log(response.data);
    } catch (error) {
      console.error("Error registering user:", error);
      setErrorMessage("Registration failed. Please try again.");
      setSuccessMessage("");
    }
  };
  

  return (
    <StyledFormContainer>
      <StyledForm>
        <h2 className="text-center mb-4">Register</h2>
         {/* Show success or error message */}
         {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="id" className="form-label">
                ID
              </label>
              <input
                type="text"
                className="form-control"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="Enter your ID"
                required
                autoComplete="off"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                autoComplete="off"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                className="form-select"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                autoComplete="off"
              >
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <select
                className="form-select"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                autoComplete="off"
              >
                <option value="IT">IT</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="NURSE">NURSE</option>
                <option value="HR">HR</option>
                <option value="LAB">LAB</option>
                <option value="RT TECH">RT TECH</option>
                <option value="PHARMACY">PHARMACY</option>
                <option value="TELECALLER">TELECALLER</option>
                <option value="FRONT OFFICE">FRONT OFFICE</option>
                <option value="SECURITY">SECURITY</option>
                <option value="ELECTRICIAN">ELECTRICIAN</option>
                <option value="ACCOUNTS">ACCOUNTS</option>
                <option value="NURSING">NURSING</option>
                <option value="HOUSE KEEPING">HOUSE KEEPING</option>
                <option value="DENTIST CONSULTANT">DENTIST CONSULTANT</option>
                <option value="COOK">COOK</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="designation" className="form-label">
                Designation
              </label>
              <input
                type="text"
                className="form-control"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter your designation"
                required
                autoComplete="off"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-group">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                >
                   {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <StyledButton type="submit">Register</StyledButton>
        </form>
      </StyledForm>
    </StyledFormContainer>
  );
};

export default Register;
