import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styled Components
const StyledFormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const StyledForm = styled.div`
  background: white;
  color: black;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
`;

const StyledButton = styled.button`
  width: fit-content;
  padding: 10px 20px;
  background-color: #ff9900;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #e68a00;
  }
`;

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  & > div {
    flex: 1;
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    role: "Admin",
    department: "IT",
    password: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      toast.error(
        "Password must be at least 7 characters long, include one uppercase letter, one number, and one special character."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/register/",
        formData
      );
      toast.success("Registration successful!");
      console.log(response.data);
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <StyledFormContainer>
      <ToastContainer />
      <StyledForm>
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* ID and Name Row */}
          <FlexRow>
            <div>
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
            <div>
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
          </FlexRow>

          {/* Role and Department Row */}
          <FlexRow>
            <div>
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
            <div>
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
              </select>
            </div>
          </FlexRow>

          {/* Password and Confirm Password Row */}
          <FlexRow>
            <div>
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
            <div>
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
          </FlexRow>

          {/* Submit Button */}
          <StyledButton type="submit">Register</StyledButton>
        </form>
      </StyledForm>
    </StyledFormContainer>
  );
};

export default Register;
