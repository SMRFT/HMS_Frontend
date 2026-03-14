import React, { useState, useEffect } from "react";
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
  FiLayers,
  FiTag,
  FiCode,
} from "react-icons/fi";
import { hasPagePermission } from "../Auth/FrontendPageMapping";
import { fetchSidebarMapping } from "../Auth/apiRequest";

const iconMap = {
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
};

// Use the same theme colors for consistency
const colors = {
  primary: "#0d9488",
  primaryLight: "rgba(13, 148, 136, 0.1)",
  textMain: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  surface: "#ffffff",
};

const SidebarContainer = styled.div`
  width: 200px;
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

  @media (max-width: 1024px) {
    width: 200px;
  }
  @media (max-width: 768px) {
    width: 80px;
  } // Collapsed for tablet
`;

const BrandSection = styled.div`
  padding: 20px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
`;


const BrandName = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${colors.primary};
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    display: none;
  }
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
  white-space: nowrap;
  color: ${colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  white-space: nowrap;
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
    span {
      display: none;
    }
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
  @media (max-width: 768px) {
    display: none;
  }
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
  span:first-child {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${colors.textMain};
  }
  span:last-child {
    font-size: 0.75rem;
    color: ${colors.textMuted};
  }
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
    span {
      display: none;
    }
  }
`;

const Sidebar = ({ role, allowedActions }) => {
  const [sidebarData, setSidebarData] = useState([]);

  useEffect(() => {
    const loadSidebarData = async () => {
      const data = await fetchSidebarMapping();
      setSidebarData(data);
    };
    loadSidebarData();
  }, []);

  return (
    <SidebarContainer>
      <BrandSection>
        <BrandName>Shanmuga Hospital</BrandName>
      </BrandSection>

      <NavMenu>
        {sidebarData.map((group, groupIndex) => {
          // Check if at least one page in this group is allowed
          const hasAllowedPage = group.pages.some(page => hasPagePermission(page.route, allowedActions));

          if (!hasAllowedPage) return null;

          return (
            <React.Fragment key={groupIndex}>
              {group.group && <NavGroupLabel>{group.group}</NavGroupLabel>}
              {group.pages.map((page, pageIndex) => {
                if (!hasPagePermission(page.route, allowedActions)) return null;

                const IconComponent = iconMap[page.icon] || FiActivity;

                return (
                  <StyledNavLink to={page.route} key={pageIndex}>
                    <IconComponent /> <span>{page.name}</span>
                  </StyledNavLink>
                );
              })}
            </React.Fragment>
          );
        })}
      </NavMenu>

      <UserSection>
        <UserProfile>
          <Avatar>{role ? role.charAt(0) : "S"}</Avatar>
          <UserInfo>
            <span>Staff Member</span>
            <span>{role}</span>
          </UserInfo>
        </UserProfile>
        <LogoutButton
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          <FiLogOut /> <span>Logout</span>
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar;
