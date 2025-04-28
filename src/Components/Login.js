import React from "react";
import styled from "styled-components";
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom"; // Import Link from React Router

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #3a8bff, #6f73ff);
`;

const LoginBox = styled.div`
  width: 350px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: white;
  margin-bottom: 20px;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  color: #ffffff;
  font-size: 12px;
`;

const Input = styled.input`
  width: 90%;
  padding: 6px 6px 6px 30px;
  font-size: 13px;
  border: none;
  border-radius: 12px;
  outline: none;
  background: rgba(255, 255, 255, 0.3);
  color: white;

  ::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const RememberMe = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 14px;

  a {
    color: white;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Button = styled.button`
  width: 90%;
  padding: 8px;
  background: #4f88ff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;

  &:hover {
    background: #3a6fcc;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 10px;
  color: white;
  font-size: 14px;

  a {
    color: white;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  return (
    <LoginContainer>
      <LoginBox>
        <Title>Login</Title>
        <InputWrapper>
          <Icon>
            <FaUser />
          </Icon>
          <Input type="text" placeholder="Username" />
        </InputWrapper>
        <InputWrapper>
          <Icon>
            <FaLock />
          </Icon>
          <Input type="password" placeholder="Password" />
        </InputWrapper>
        <RememberMe>
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Forgot Password?</a>
        </RememberMe>
        <Button>Login</Button>
        <Footer>
          Don't have an account? <Link to="/Register">Register</Link>
        </Footer>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;
