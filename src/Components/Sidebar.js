import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
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
  FiMenu,
  FiX
} from "react-icons/fi";
import { hasPagePermission } from "../Auth/FrontendPageMapping";
import { fetchSidebarMapping } from "../Auth/apiRequest";
import LOGO from "../Components/Images/smrft.png";

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
  FiLayers,
  FiTag,
  FiCode
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

// --- Styled Components ---

const MobileToggleBtn = styled.button`
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 998;
  background: ${colors.surface};
  color: ${colors.primary};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }

  svg {
    font-size: 1.4rem;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(2px);
    z-index: 999;
    transition: opacity 0.3s ease;
  }
`;

const SidebarContainer = styled.div`
  width: 240px;
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
  transition: transform 0.3s ease, width 0.3s ease;

  @media (max-width: 1024px) {
    width: 80px;
  }

  @media (max-width: 768px) {
    width: 260px;
    transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(-100%)")};
  }
`;

const BrandSection = styled.div`
  padding: 20px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
  min-height: 72px;

  @media (max-width: 1024px) {
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const BrandName = styled.span`
  font-weight: 800;
  font-size: 1.15rem;
  color: ${colors.primary};
  letter-spacing: -0.5px;
  
  @media (max-width: 1024px) {
    display: none;
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const CloseMobileBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${colors.textMuted};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  svg { font-size: 1.4rem; }

  &:hover { color: #e11d48; background: #fff1f2; }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

const NavMenu = styled.nav`
  flex: 1;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 4px;
  }
`;

const NavGroupLabel = styled.div`
  padding: 12px 12px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  color: ${colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 1024px) {
    display: none;
  }
  
  @media (max-width: 768px) {
    display: block;
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
    font-size: 1.25rem;
    min-width: 20px;
  }

  span {
    @media (max-width: 1024px) { display: none; }
    @media (max-width: 768px) { display: block; }
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

  @media (max-width: 1024px) {
    justify-content: center;
    padding: 12px;
  }
  
  @media (max-width: 768px) {
    justify-content: flex-start;
    padding: 12px 16px;
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

  @media (max-width: 1024px) {
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${colors.primary};
  flex-shrink: 0;
`;

const BrandLogo = styled.img`
  width: 200px;
  height: auto;
  object-fit: contain;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  span:first-child {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${colors.textMain};
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  span:last-child {
    font-size: 0.75rem;
    color: ${colors.textMuted};
  }

  @media (max-width: 1024px) { display: none; }
  @media (max-width: 768px) { display: flex; }
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid ${colors.border};
  background: white;
  border-radius: 8px;
  color: ${colors.textMuted};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  span {
    @media (max-width: 1024px) { display: none; }
    @media (max-width: 768px) { display: block; }
  }

  &:hover {
    background: #fff1f2;
    color: #e11d48;
    border-color: #fecdd3;
  }

  @media (max-width: 1024px) { padding: 12px 0; }
  @media (max-width: 768px) { padding: 12px; }
`;

// --- Main Component ---

const Sidebar = ({ role, allowedActions }) => {
  const [sidebarData, setSidebarData] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state

  useEffect(() => {
    const loadSidebarData = async () => {
      const data = await fetchSidebarMapping();
      setSidebarData(data);
    };
    loadSidebarData();
  }, []);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Floating Toggle Button visible ONLY on mobile */}
      <MobileToggleBtn onClick={() => setIsOpen(true)}>
        <FiMenu />
      </MobileToggleBtn>

      {/* Backdrop overlay for mobile */}
      <Overlay $isOpen={isOpen} onClick={closeSidebar} />

      <SidebarContainer $isOpen={isOpen}>
        <BrandSection>
          {/* <BrandName>Shanmuga Hospital</BrandName> */}
          <BrandLogo src={LOGO} alt="Logo" />
          <CloseMobileBtn onClick={closeSidebar}>
            <FiX />
          </CloseMobileBtn>
        </BrandSection>

        <NavMenu>
          {sidebarData.map((group, groupIndex) => {
            // Check if at least one page in this group is allowed
            const hasAllowedPage = group.pages.some((page) =>
              hasPagePermission(page.route, allowedActions)
            );

            if (!hasAllowedPage) return null;

            return (
              <React.Fragment key={groupIndex}>
                {group.group && <NavGroupLabel>{group.group}</NavGroupLabel>}

                {group.pages.map((page, pageIndex) => {
                  if (!hasPagePermission(page.route, allowedActions)) return null;

                  const IconComponent = iconMap[page.icon] || FiActivity;

                  return (
                    <StyledNavLink
                      to={page.route}
                      key={pageIndex}
                      onClick={closeSidebar} // Auto-close on mobile when link is clicked
                    >
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
            <Avatar>{role ? role.charAt(0).toUpperCase() : "S"}</Avatar>
            <UserInfo>
              <span>Staff Member</span>
              <span>{role || "Unknown Role"}</span>
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
    </>
  );
};

export default Sidebar;
