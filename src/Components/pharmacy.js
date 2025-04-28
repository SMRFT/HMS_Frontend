import React from "react";
import styled from "styled-components";
import { Button, Form } from "react-bootstrap";

// Styled Components
const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to right, #4facfe, #00f2fe);
`;

const StyledFormContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const StyledTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const StyledInput = styled(Form.Control)`
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(38, 143, 255, 0.5);
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
  background-color: #007bff;
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 1rem;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(38, 143, 255, 0.5);
  }
`;

const PharmacyBilling = () => {
  return (
    <StyledContainer>
      <StyledFormContainer>
        <StyledTitle>Pharmacy Billing</StyledTitle>
        <Form>
          <StyledInput
            type="text"
            placeholder="Enter Medicine Name"
            required
          />
          <StyledButton type="submit">Submit</StyledButton>
        </Form>
      </StyledFormContainer>
    </StyledContainer>
  );
};

export default PharmacyBilling;
