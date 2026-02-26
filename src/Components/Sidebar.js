import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
// Assuming these icons or similar are available, otherwise use text
import {
  FiHome,
  FiUserPlus,
  FiRepeat,
  FiLogOut,
  FiActivity,
  FiPackage,
  FiShoppingBag,

  FiTruck,
  FiFileText,
  FiUsers,
  FiClipboard,
  FiLayers
} from "react-icons/fi";
import { hasPagePermission } from "../Auth/FrontendPageMapping";

// Use the same theme colors for consistency
const colors = {
  primary: "#0d9488",
  primaryLight: "rgba(13, 148, 136, 0.1)",
  textMain: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  surface: "#ffffff"
};

const SidebarContainer = styled.div`
  width: 260px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: ${colors.surface};
  border-right: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.02);

  @media (max-width: 1024px) { width: 200px; }
  @media (max-width: 768px) { width: 80px; } // Collapsed for tablet
`;

const BrandSection = styled.div`
  padding: 30px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
`;

const BrandLogo = styled.div`
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, ${colors.primary}, #0f766e);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
`;

const BrandName = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${colors.textMain};
  letter-spacing: -0.5px;
  @media (max-width: 768px) { display: none; }
`;

const NavMenu = styled.nav`
  flex: 1;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
`;

const NavGroupLabel = styled.div`
  padding: 10px 12px;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  @media (max-width: 768px) { display: none; }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: ${colors.textMuted};
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;

  svg {
    font-size: 1.2rem;
    min-width: 20px;
  }

  &:hover {
    background-color: #f8fafc;
    color: ${colors.primary};
  }

  &.active {
    background-color: ${colors.primaryLight};
    color: ${colors.primary};
    font-weight: 600;
  }

  @media (max-width: 768px) {
    justify-content: center;
    span { display: none; }
  }
`;

const UserSection = styled.div`
  padding: 20px;
  border-top: 1px solid ${colors.border};
  background: #fcfcfd;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  @media (max-width: 768px) { display: none; }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMain};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  span:first-child { font-size: 0.85rem; font-weight: 600; color: ${colors.textMain}; }
  span:last-child { font-size: 0.75rem; color: ${colors.textMuted}; }
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid ${colors.border};
  background: white;
  border-radius: 6px;
  color: ${colors.textMuted};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fff1f2;
    color: #e11d48;
    border-color: #fecdd3;
  }

  @media (max-width: 768px) {
    border: none;
    span { display: none; }
  }
`;

const Sidebar = ({ role, allowedActions }) => {
  // Helper to check if any route in a group is allowed
  const showGroup = (routes) => routes.some(route => hasPagePermission(route, allowedActions));

  return (
    <SidebarContainer>
      <BrandSection>
        <BrandLogo>S</BrandLogo>
        <BrandName>Shanmuga Hospital</BrandName>
      </BrandSection>

      <NavMenu>
        <NavGroupLabel>Admin Controls</NavGroupLabel>

        {/* Dummy Link for Testing */}



        {hasPagePermission("/UserPermissions", allowedActions) && (
          <StyledNavLink to="/UserPermissions">
            <FiUsers /> <span>Permission Manager</span>
          </StyledNavLink>
        )}
        <NavGroupLabel>Patient Management</NavGroupLabel>
        {hasPagePermission("/Dashboard", allowedActions) && (
          <StyledNavLink to="/Dashboard">
            <FiHome /> <span>Dashboard</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/PatientRegistrationForm", allowedActions) && (
          <StyledNavLink to="/PatientRegistrationForm">
            <FiUserPlus /> <span>Patient Registration</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/RegistrationBills", allowedActions) && (
          <StyledNavLink to="/RegistrationBills">
            <FiFileText /> <span>Registration Bills</span>
          </StyledNavLink>
        )}
        {showGroup(["/IPPharmacyStock", "/OPPharmacyStock", "/VendorManagement"]) && (
          <NavGroupLabel>Inventory</NavGroupLabel>
        )}
        {hasPagePermission("/IPPharmacyStock", allowedActions) && (
          <StyledNavLink to="/IPPharmacyStock">
            <FiPackage /> <span>IP Pharmacy Stock</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/OPPharmacyStock", allowedActions) && (
          <StyledNavLink to="/OPPharmacyStock">
            <FiShoppingBag /> <span>OP Pharmacy Stock</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/VendorManagement", allowedActions) && (
          <StyledNavLink to="/VendorManagement">
            <FiTruck /> <span>Vendor Management</span>
          </StyledNavLink>
        )}

        {showGroup(["/IPPharmacy", "/OPPharmacy", "/IPGRNGeneration", "/OPGRNGeneration"]) && (
          <NavGroupLabel>Pharmacy</NavGroupLabel>
        )}
        {hasPagePermission("/IPPharmacy", allowedActions) && (
          <StyledNavLink to="/IPPharmacy">
            <FiPackage /> <span>IP Pharmacy</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/OPPharmacy", allowedActions) && (
          <StyledNavLink to="/OPPharmacy">
            <FiShoppingBag /> <span>OP Pharmacy</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/IPGRNGeneration", allowedActions) && (
          <StyledNavLink to="/IPGRNGeneration">
            <FiActivity /> <span>IP GRN Generation</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/OPGRNGeneration", allowedActions) && (
          <StyledNavLink to="/OPGRNGeneration">
            <FiActivity /> <span>OP GRN Generation</span>
          </StyledNavLink>
        )}

        {showGroup(["/DoctorList"]) && (
          <NavGroupLabel>Doctor Management</NavGroupLabel>
        )}
        {hasPagePermission("/DoctorList", allowedActions) && (
          <StyledNavLink to="/DoctorList">
            <FiUsers /> <span>Doctors</span>
          </StyledNavLink>
        )}

        {showGroup(["/InvestigationBilling", "/ViewBills", "/ViewEstimate"]) && (
          <NavGroupLabel>Investigation Billing</NavGroupLabel>
        )}
        {hasPagePermission("/InvestigationBilling", allowedActions) && (
          <StyledNavLink to="/InvestigationBilling">
            <FiFileText /> <span>Billing Entry</span>
          </StyledNavLink>
        )}

        {showGroup(["/CTList", "/MRIList", "/USGList", "/XRayList"]) && (
          <NavGroupLabel>Investigation Reports</NavGroupLabel>
        )}
        {hasPagePermission("/CTList", allowedActions) && (
          <StyledNavLink to="/CTList">
            <FiActivity /> <span>CT Reports</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/MRIList", allowedActions) && (
          <StyledNavLink to="/MRIList">
            <FiActivity /> <span>MRI Reports</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/USGList", allowedActions) && (
          <StyledNavLink to="/USGList">
            <FiActivity /> <span>USG Reports</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/XRayList", allowedActions) && (
          <StyledNavLink to="/XRayList">
            <FiActivity /> <span>X-Ray Reports</span>
          </StyledNavLink>
        )}

        {showGroup(["/Block", "/RoomCategory", "/Room", "/Bed", "/Service", "/RoomEnquiry"]) && (
          <NavGroupLabel>Rooms</NavGroupLabel>
        )}
        {hasPagePermission("/Block", allowedActions) && (
          <StyledNavLink to="/Block">
            <FiHome /> <span>Block</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/RoomCategory", allowedActions) && (
          <StyledNavLink to="/RoomCategory">
            <FiActivity /> <span>Room Category</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/Room", allowedActions) && (
          <StyledNavLink to="/Room">
            <FiHome /> <span>Room</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/Bed", allowedActions) && (
          <StyledNavLink to="/Bed">
            <FiActivity /> <span>Bed</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/Service", allowedActions) && (
          <StyledNavLink to="/Service">
            <FiActivity /> <span>Service</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/RoomEnquiry", allowedActions) && (
          <StyledNavLink to="/RoomEnquiry">
            <FiActivity /> <span>Room Enquiry</span>
          </StyledNavLink>
        )}

        {showGroup(["/Admission", "/InsuranceProvider", "/Enquiry", "/DischargeForm", "/Summary"]) && (
          <NavGroupLabel>Front Office</NavGroupLabel>
        )}
        {hasPagePermission("/Admission", allowedActions) && (
          <StyledNavLink to="/Admission">
            <FiUserPlus /> <span>Admission</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/InsuranceProvider", allowedActions) && (
          <StyledNavLink to="/InsuranceProvider">
            <FiFileText /> <span>Insurance Provider</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/Enquiry", allowedActions) && (
          <StyledNavLink to="/Enquiry">
            <FiFileText /> <span>Enquiry</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/DischargeForm", allowedActions) && (
          <StyledNavLink to="/DischargeForm">
            <FiLogOut /> <span>Discharge Form</span>
          </StyledNavLink>
        )}
        {hasPagePermission("/Summary", allowedActions) && (
          <StyledNavLink to="/Summary">
            <FiActivity /> <span>Discharge Summary</span>
          </StyledNavLink>
        )}


        {showGroup(["/RoomShifting"]) && (
          <NavGroupLabel>Nursing Station</NavGroupLabel>
        )}
        {hasPagePermission("/RoomShifting", allowedActions) && (
          <StyledNavLink to="/RoomShifting">
            <FiRepeat /> <span>Room Shifting</span>
          </StyledNavLink>
        )}
      </NavMenu>

      <UserSection>
        <UserProfile>
          <Avatar>{role ? role.charAt(0) : "S"}</Avatar>
          <UserInfo>
            <span>Staff Member</span>
            <span>{role}</span>
          </UserInfo>
        </UserProfile>
        <LogoutButton onClick={() => { localStorage.clear(); window.location.reload(); }}>
          <FiLogOut /> <span>Logout</span>
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar;