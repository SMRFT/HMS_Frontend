"use client"

import { useState } from "react"
import styled, { ThemeProvider } from "styled-components"
import { Link, useLocation } from "react-router-dom"
import {
  Search,
  Clock,
  Calendar,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Settings,
  User,
  Clipboard,
  Activity,
  Menu,
  X,
} from "lucide-react"

// Theme definition
const theme = {
  colors: {
    background: "#1A1D1F",
    text: "#E6E8EA",
    textSecondary: "#9DA3A8",
    accent: "#F97316", // Orange accent for active items
    border: "#2A2D30",
    moduleHeader: "#2A2D30",
  },
}

// Styled components - updated to support collapsed state
const SidebarContainer = styled.div`
  width: ${props => props.$collapsed ? "0" : "280px"};
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  transition: width 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }
  
  ${props => props.$collapsed && `
    overflow: hidden;
  `}
`

const SearchBar = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.background};
`

const SearchInput = styled.input`
  background-color: transparent;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  width: 100%;
  padding: 8px 8px 8px 40px;
  outline: none;
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 24px;
  color: ${props => props.theme.colors.textSecondary};
`

const DashboardItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  text-decoration: none;
  color: ${props => props.theme.colors.text};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  ${props =>
    props.$isActive &&
    `
    background-color: rgba(255, 255, 255, 0.05);
  `}
`

const IconWrapper = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`

const ModuleHeader = styled.div`
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  background-color: ${props => props.theme.colors.moduleHeader};
`

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  ${props =>
    props.$isActive &&
    `
    background-color: rgba(255, 255, 255, 0.05);
  `}
`

const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
`

const MenuItemText = styled.span`
  margin-left: 12px;
`

const SubMenu = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
`

const SubMenuItem = styled(Link)`
  display: block;
  padding: 12px 12px 12px 52px;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${props => props.theme.colors.text};
  }
  
  ${props =>
    props.$isActive &&
    `
    color: ${props.theme.colors.accent};
  `}
`

// Updated HeaderContainer to support collapsed sidebar
const HeaderContainer = styled.div`
  height: 60px;
  background-color: #1E5F74;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: ${props => props.$collapsed ? "0" : "280px"};
  right: 0;
  z-index: 5;
  transition: left 0.3s ease;
`

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`

const HospitalInfo = styled.div`
  display: flex;
  align-items: center;
`

const HospitalName = styled.div`
  font-size: 18px;
  font-weight: 600;
`

const HeaderAddress = styled.span`
  font-size: 14px;
  font-weight: 400;
  margin-left: 8px;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const DateDisplay = styled.div`
  font-size: 14px;
`

// Updated MainContent to support collapsed sidebar
const MainContent = styled.div`
  margin-left: ${props => props.$collapsed ? "0" : "280px"};
  margin-top: 60px;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  transition: margin-left 0.3s ease;
`

const App = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    frontOffice: true,
    pharmacy: false,
    doctor: false,
    radiology: false,
    inpatient: false,
    qrScan: false,
    enquiryDesk: false,
  });
  
  // State to track sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMenu = (menu) => {
    setExpandedMenus({
      ...expandedMenus,
      [menu]: !expandedMenus[menu],
    });
  };
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatDate = () => {
    const date = new Date();
    return (
      date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      " " +
      date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase()
    );
  };

  // Function to check if current path or its parent menu is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const isMenuActive = (pathPrefix) => {
    return location.pathname.startsWith(pathPrefix);
  };

  // Special pages without sidebar (login and QR scan)
  const isSpecialPage = location.pathname === "/login" || location.pathname === "/QRScan";

  if (isSpecialPage) {
    return (
      <div className={`App ${location.pathname === "/login" ? "login-page" : "qr-scan-page"}`}>
        <div className="content">
          {/* Your login or QR scan page content */}
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <SidebarContainer $collapsed={sidebarCollapsed}>
          {!sidebarCollapsed && (
            <>
              <SearchBar>
                <SearchIconWrapper>
                  <Search size={18} />
                </SearchIconWrapper>
                <SearchInput placeholder="Search.." />
              </SearchBar>

              <DashboardItem to="/Enquiry" $isActive={isActive("/Enquiry")}>
                <IconWrapper>
                  <Clock size={20} />
                </IconWrapper>
                <span>Dashboard</span>
              </DashboardItem>

              <ModuleHeader>ADMINISTRATIVE MODULES</ModuleHeader>

              <MenuItem onClick={() => toggleMenu("enquiryDesk")} $isActive={isActive("/Enquiry")}>
                <MenuItemContent>
                  <IconWrapper>
                    <Search size={20} />
                  </IconWrapper>
                  <MenuItemText>Enquiry Desk</MenuItemText>
                </MenuItemContent>
                {expandedMenus.enquiryDesk ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </MenuItem>
              
              {expandedMenus.enquiryDesk && (
                <SubMenu>
                  <SubMenuItem to="/Enquiry" $isActive={isActive("/Enquiry")}>Enquiry</SubMenuItem>
                </SubMenu>
              )}

              <MenuItem onClick={() => toggleMenu("frontOffice")} $isActive={isMenuActive("/Patient") || isMenuActive("/Reference")}>
                <MenuItemContent>
                  <IconWrapper>
                    <Users size={20} />
                  </IconWrapper>
                  <MenuItemText>Front Office</MenuItemText>
                </MenuItemContent>
                {expandedMenus.frontOffice ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </MenuItem>

              {expandedMenus.frontOffice && (
                <SubMenu>
                  <SubMenuItem to="/PatientRegistrationForm" $isActive={isActive("/PatientRegistrationForm")}>Registration</SubMenuItem>
                  <SubMenuItem to="/Admission" $isActive={isActive("/Admission")}>Admission</SubMenuItem>
                </SubMenu>
              )}

              <MenuItem onClick={() => toggleMenu("pharmacy")} $isActive={isMenuActive("/Pharmacy") || isMenuActive("/Stock") || isMenuActive("/HSN") || isMenuActive("/Ventor")}>
                <MenuItemContent>
                  <IconWrapper>
                    <FileText size={20} />
                  </IconWrapper>
                  <MenuItemText>Pharmacy</MenuItemText>
                </MenuItemContent>
                {expandedMenus.pharmacy ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </MenuItem>

              {expandedMenus.pharmacy && (
                <SubMenu>
                  <SubMenuItem to="/PharmacyBilling" $isActive={isActive("/PharmacyBilling")}>Pharmacy Billing</SubMenuItem>
                  <SubMenuItem to="/StockEntry" $isActive={isActive("/StockEntry")}>Stock Entry</SubMenuItem>
                  <SubMenuItem to="/StockDisplay" $isActive={isActive("/StockDisplay")}>Stock Display</SubMenuItem>
                  <SubMenuItem to="/HSNCodeForm" $isActive={isActive("/HSNCodeForm")}>HSN Code</SubMenuItem>
                  <SubMenuItem to="/VentorForm" $isActive={isActive("/VentorForm")}>Vendor Form</SubMenuItem>
                </SubMenu>
              )}

              <MenuItem onClick={() => toggleMenu("doctor")} $isActive={isMenuActive("/Doctor")}>
                <MenuItemContent>
                  <IconWrapper>
                    <User size={20} />
                  </IconWrapper>
                  <MenuItemText>Doctor Management</MenuItemText>
                </MenuItemContent>
                {expandedMenus.doctor ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </MenuItem>

              {expandedMenus.doctor && (
                <SubMenu>
                  <SubMenuItem to="/Doctor" $isActive={isActive("/Doctor")}>Add Doctor</SubMenuItem>
                  <SubMenuItem to="/DoctorList" $isActive={isMenuActive("/DoctorList")}>Doctor List</SubMenuItem>
                  <SubMenuItem to="/DoctorBill" $isActive={isActive("/DoctorBill")}>Doctor Bill</SubMenuItem>
                </SubMenu>
              )}

              <MenuItem onClick={() => toggleMenu("radiology")} $isActive={isMenuActive("/CTList") || isMenuActive("/MRIList")}>
                <MenuItemContent>
                  <IconWrapper>
                    <Activity size={20} />
                  </IconWrapper>
                  <MenuItemText>Radiology</MenuItemText>
                </MenuItemContent>
                {expandedMenus.radiology ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </MenuItem>

              {expandedMenus.radiology && (
                <SubMenu>
                  <SubMenuItem to="/CTList" $isActive={isMenuActive("/CTList")}>CT Scan</SubMenuItem>
                  <SubMenuItem to="/MRIList" $isActive={isMenuActive("/MRIList")}>MRI Scan</SubMenuItem>
                </SubMenu>
              )}

              <MenuItem onClick={() => toggleMenu("inpatient")} $isActive={isMenuActive("/Summary")}>
                <MenuItemContent>
                  <IconWrapper>
                    <Clipboard size={20} />
                  </IconWrapper>
                  <MenuItemText>Inpatient Care</MenuItemText>
                </MenuItemContent>
                {expandedMenus.inpatient ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </MenuItem>

              {expandedMenus.inpatient && (
                <SubMenu>
                  <SubMenuItem to="/Summary" $isActive={isMenuActive("/Summary")}>Discharge Summary</SubMenuItem>
                </SubMenu>
              )}

              <MenuItem onClick={() => toggleMenu("qrScan")}>
                <MenuItemContent>
                  <IconWrapper>
                    <Search size={20} />
                  </IconWrapper>
                  <MenuItemText>QR Scanning</MenuItemText>
                </MenuItemContent>
                {expandedMenus.qrScan ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </MenuItem>

              {expandedMenus.qrScan && (
                <SubMenu>
                  <SubMenuItem to="/QRScanForm">QR Scan Form</SubMenuItem>
                  <SubMenuItem to="/QRScan">QR Scanner</SubMenuItem>
                </SubMenu>
              )}
            </>
          )}
        </SidebarContainer>

        <HeaderContainer $collapsed={sidebarCollapsed}>
          <HospitalInfo>
            <ToggleButton onClick={toggleSidebar}>
              {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
            </ToggleButton>
            <HospitalName>
              SHANMUGA HOSPITAL LIMITED
              <HeaderAddress>| 51/24.Saradha College Road, Salem - 636007</HeaderAddress>
            </HospitalName>
          </HospitalInfo>
          <HeaderRight>
            <DateDisplay>{formatDate()}</DateDisplay>
          </HeaderRight>
        </HeaderContainer>
        
        <MainContent $collapsed={sidebarCollapsed}>
          {/* Your page content goes here */}
        </MainContent>
      </div>
    </ThemeProvider>
  );
};

export default App;