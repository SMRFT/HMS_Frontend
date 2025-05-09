import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaUserPlus } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa"; // Import the report icon

// Keyframes for background animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Sidebar Container
const SidebarContainer = styled.div`
  background: linear-gradient(135deg, #a9d1ea, #e68fae, #7d2378);
  background-size: 200% 200%;
  animation: ${gradientAnimation} 10s ease infinite;
  color: white;
  height: 100vh;
  width: 260px;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  z-index: 1000;
  transform: ${({ isOpen }) =>
    isOpen ? "translateX(0)" : "translateX(-100%)"};
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  @media (min-width: 769px) {
    transform: translateX(0); // Keep the sidebar open on larger screens
  }
`;

// Sidebar Toggle Button
const SidebarToggle = styled.button`
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1100;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border: none;
  border-radius: 50%;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  @media (max-width: 768px) {
    display: block;
  }
`;

// Sidebar Content
const SidebarContent = styled.div`
  padding: 15px;
`;

// Navigation Link
const SidebarNavLink = styled(NavLink)`
  color: white;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  text-decoration: none;
  font-size: 16px;
  border-radius: 30px;
  white-space: nowrap;
  transition: background 0.3s ease, transform 0.2s ease;
  &.active {
    background: rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
`;

// Sidebar Icon Wrapper
const IconWrapper = styled.span`
  margin-right: 10px;
`;

const Sidebar = () => {
  // Initialize state with the value from localStorage (default is false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    JSON.parse(localStorage.getItem("sidebarOpen")) || false
  );
  const [isDoctorDetailsOpen, setIsDoctorDetailsOpen] = useState(true);

  const toggleDoctorDetails = () => {
    setIsDoctorDetailsOpen(!isDoctorDetailsOpen);
  };

  // UseEffect to update localStorage when the sidebar state changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <SidebarToggle onClick={toggleSidebar}>
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </SidebarToggle>
      <SidebarContainer isOpen={isSidebarOpen}>
        <SidebarContent>
          <SidebarNavLink to="/Enquiry">
            <IconWrapper>
              <FaUserPlus />
            </IconWrapper>
            Enquiry
          </SidebarNavLink>
          <SidebarNavLink to="/Registration">
            <IconWrapper>
              <FaUserPlus />
            </IconWrapper>
            Registration
          </SidebarNavLink>
          <SidebarNavLink to="/Admission">
            <IconWrapper>
              <FaUserPlus />
            </IconWrapper>
            Admission
          </SidebarNavLink>
          <div>
            {/* Doctor Details Group */}
            <SidebarNavLink
              to="/DepartmentBilling"
              onClick={toggleDoctorDetails}
              style={{ fontWeight: "bold", padding: "10px 0" }}
            >
              Department Billing
            </SidebarNavLink>

            {/* Collapsible Links */}
            {isDoctorDetailsOpen && (
              <div style={{ paddingLeft: "20px" }}>
                <SidebarNavLink to="/InvestigationBilling">
                  <IconWrapper>
                    <FaUserPlus />
                  </IconWrapper>
                  Billing
                </SidebarNavLink>
                <SidebarNavLink to="/PatientDebit">
                  <IconWrapper>
                    <FaFileAlt />
                  </IconWrapper>
                  Patient Debit
                </SidebarNavLink>
                <SidebarNavLink to="/BillType">
                  <IconWrapper>
                    <FaFileAlt />
                  </IconWrapper>
                  Bill Type
                </SidebarNavLink>
              </div>
            )}
          </div>

          <div>
            {/* Doctor Details Group */}
            <SidebarNavLink
              to="/DoctorDetails"
              onClick={toggleDoctorDetails}
              style={{ fontWeight: "bold", padding: "10px 0" }}
            >
              Doctor Details
            </SidebarNavLink>

            {/* Collapsible Links */}
            {isDoctorDetailsOpen && (
              <div style={{ paddingLeft: "20px" }}>
                <SidebarNavLink to="/Doctor">
                  <IconWrapper>
                    <FaUserPlus />
                  </IconWrapper>
                  Doctor
                </SidebarNavLink>
                <SidebarNavLink to="/DoctorList">
                  <IconWrapper>
                    <FaFileAlt />
                  </IconWrapper>
                  Doctor List
                </SidebarNavLink>
              </div>
            )}
          </div>

          <div>
            {/* Doctor Details Group */}
            <SidebarNavLink
              to="/FileUploading"
              onClick={toggleDoctorDetails}
              style={{ fontWeight: "bold", padding: "10px 0" }}
            >
              MR/File Uploading
            </SidebarNavLink>

            {/* Collapsible Links */}
            {isDoctorDetailsOpen && (
              <div style={{ paddingLeft: "20px" }}>
                <SidebarNavLink to="/CTList">
                  <IconWrapper>
                    <FaFileAlt />
                  </IconWrapper>
                  CT
                </SidebarNavLink>
                <SidebarNavLink to="/MRIList">
                  <IconWrapper>
                    <FaFileAlt />
                  </IconWrapper>
                  MRI
                </SidebarNavLink>
                <SidebarNavLink to="/USGList">
                  <IconWrapper>
                    <FaFileAlt />
                  </IconWrapper>
                  USG
                </SidebarNavLink>
                <SidebarNavLink to="/XRayList">
                  <IconWrapper>
                    <FaFileAlt />
                  </IconWrapper>
                  X-Ray
                </SidebarNavLink>
              </div>
            )}

            <SidebarNavLink to="/Summary">
              <IconWrapper>
                <FaUserPlus />
              </IconWrapper>
              Summary
            </SidebarNavLink>
          </div>
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
