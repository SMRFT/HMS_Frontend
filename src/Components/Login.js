import React, { useState } from "react";
import styled from "styled-components";
import { FaUser, FaLock } from "react-icons/fa";
import { MdOutlineLogin } from "react-icons/md";
import smrftLogo from "../Components/Images/smrft.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import vectorImage1 from "../Components/Images/home1.png";
import vectorImage2 from "../Components/Images/home2.png";
import Video from "../Components/Images/doctor.mp4";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

const OuterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #eaedef;
  font-family: "Poppins", sans-serif; /* Modern font */
`;

const Container = styled.div`
  display: flex;
  width: 90%;
  max-width: 1200px;
  margin: auto;
  background: white;
  border-radius: 30px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden; /* For seamless corners */
`;

const LeftSection = styled.div`
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;

  img {
    width: 180px;
    margin-bottom: 25px;
  }

  h2 {
    color: #333;
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 15px;
  }

  p {
    color: #555;
    text-align: center;
    margin-bottom: 35px;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 25px;
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #666;
  font-size: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    border-color: #4f88ff;
    box-shadow: 0 0 6px rgba(79, 136, 255, 0.3);
  }
`;

const Button = styled.button`
  width: 100%;
  max-width: 300px;
  padding: 12px 20px;
  background-color: #ff9900;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #e68a00;
    transform: translateY(-2px);
  }
`;

const RightSection = styled.div`
  flex: 1;
  background: #004d40;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 30px;

  h2 {
    font-size: 26px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  p {
    max-width: 300px;
    line-height: 1.6;
    font-size: 14px;
  }

  video {
    width: 100%;
    max-width: 600px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const Login = () => {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error messages
    setError("");

    // Check for empty fields
    if (!name || !userId || !password) {
      const emptyFieldError = "All fields are required!";
      setError(emptyFieldError);
      toast.error(emptyFieldError, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
      });
      return; // Stop execution if validation fails
    }

    const loginData = { name, id: userId, password };

    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
        });

        setTimeout(() => {
          navigate("/PatientRegistrationForm");
        }, 3000);
      } else {
        const errorMessage = result.error || "An unexpected error occurred.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (err) {
      const connectionError =
        "Failed to connect to the server. Please try again later.";
      setError(connectionError);
      toast.error(connectionError, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  return (
    <>
      <ToastContainer />
      <OuterContainer>
        <Container>
          <LeftSection>
            <img src={smrftLogo} alt="Shanmuga Hospital Logo" />
            <p>To Deliver the Best Patient Care with Passion and Empathy</p>
            <h2>Login</h2>
            <LoginBox>
              <form onSubmit={handleSubmit}>
                <InputWrapper>
                  <Icon>
                    <FaUser />
                  </Icon>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Icon>
                    <FaUser />
                  </Icon>
                  <Input
                    type="text"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Icon>
                    <FaLock />
                  </Icon>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "15px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#666",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </InputWrapper>
                <Button type="submit">
                  Login <MdOutlineLogin style={{ fontSize: "18px" }} />
                </Button>
              </form>
              {error && (
                <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
              )}
            </LoginBox>
          </LeftSection>
          <RightSection>
            <video
              autoPlay
              loop
              muted
              style={{
                width: "100%",
                borderRadius: "15px",
                marginBottom: "20px",
              }}
            >
              <source src={Video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div>
              <h2>Hospital Management System</h2>
              <p>Enabling operational excellence</p>
            </div>
          </RightSection>
        </Container>
      </OuterContainer>
    </>
  );
};

export default Login;
