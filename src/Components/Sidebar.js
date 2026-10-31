import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  Home,
  UserPlus,
  Repeat,
  LogOut,
  Activity,
  Package,
  ShoppingBag,
  Truck,
  FileText,
  Users,
  Clipboard,
  Layers,
  Tag,
  Code,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  LayoutDashboard,
  AlertTriangle,

} from "lucide-react";
import { hasPagePermission } from "../Auth/FrontendPageMapping";
import { fetchSidebarMapping } from "../Auth/apiRequest";
import LOGO from "../Components/Images/smrft.png";

const iconMap = {
  Home,
  FiHome: Home,
  UserPlus,
  FiUserPlus: UserPlus,
  Repeat,
  FiRepeat: Repeat,
  LogOut,
  FiLogOut: LogOut,
  Activity,
  FiActivity: Activity,
  Package,
  FiPackage: Package,
  ShoppingBag,
  FiShoppingBag: ShoppingBag,
  Truck,
  FiTruck: Truck,
  FileText,
  FiFileText: FileText,
  Users,
  FiUsers: Users,
  Clipboard,
  FiClipboard: Clipboard,
  Layers,
  FiLayers: Layers,
  Tag,
  FiTag: Tag,
  Code,
  FiCode: Code,
  LayoutDashboard,
  AlertTriangle,

};

// Use the same theme colors for consistency
const colors = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  primaryLight: "rgba(13, 148, 136, 0.1)",
  textMain: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  surface: "#ffffff",
  background: "#f8fafc",
};

// --- Styled Components ---

const SidebarContainer = styled.div`
  width: 260px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #f1f5f9;
  border-right: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  z-index: 200;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.02);
  transform: ${({ $isCollapsed }) =>
    $isCollapsed ? "translateX(-100%)" : "translateX(0)"};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  @media (max-width: 1024px) {
    width: 260px;
    transform: ${({ $isCollapsed }) =>
    $isCollapsed ? "translateX(-100%)" : "translateX(0)"};
  }

  @media (max-width: 768px) {
    z-index: 1400;
    width: 260px;
    height: 100vh;
    top: 0;
    transform: ${({ $isCollapsed }) =>
    $isCollapsed ? "translateX(0)" : "translateX(-100%)"};
    transition: transform 0.3s ease;
  }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $isCollapsed }) => ($isCollapsed ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(2px);
    z-index: 199;
  }
`;

const CloseMobileBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border: 1px solid #cbd5e1;
  color: ${colors.textMuted};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1010;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &:hover {
    color: #e11d48;
    border-color: #fecaca;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const BrandSection = styled.div`
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 62px;
  background: #ffffff;
  border-bottom: 1px solid ${colors.border};
  flex-shrink: 0;

  @media (max-width: 1024px) {
    padding: 0 14px;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    padding: 0 16px;
    justify-content: space-between;
  }
`;

const BrandLogo = styled.img`
  height: 44px;
  width: auto;
  object-fit: contain;

  @media (max-width: 1024px) {
    height: 40px;
  }
  @media (max-width: 768px) {
    height: 36px;
  }
`;

const SearchContainer = styled.div`
  padding: 12px 14px 6px 14px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    padding: 10px 10px 4px 10px;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 34px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  font-size: 0.86rem;
  color: ${colors.textMain};
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${colors.primary};
    background-color: ${colors.surface};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 16px;
  height: 16px;
`;

const NavMenu = styled.nav`
  flex: 1;
  padding: 8px 12px;
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  @media (max-width: 1024px) {
    padding: 8px 8px;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const NavGroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 5px 10px;
  margin-top: 4px;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background-color: #e2e8f0;
  }

  span {
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: block;
    transition: color 0.15s ease;
  }

  svg {
    color: #94a3b8;
    transition: transform 0.2s ease, color 0.15s ease;
    display: block;
  }

  &:hover span {
    color: ${colors.primaryDark};
  }

  &:hover svg {
    color: ${colors.primaryDark};
  }

  @media (max-width: 768px) {
    justify-content: space-between;
    padding: 10px 10px 5px 10px;
    span,
    svg {
      display: block;
    }
  }
`;

const NavGroupContentWrapper = styled.div`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? "1fr" : "0fr")};
  transition: grid-template-rows 0.3s ease-in-out;

  @media (max-width: 1024px) {
    grid-template-rows: 1fr;
  }
  @media (max-width: 768px) {
    grid-template-rows: ${({ $isOpen }) => ($isOpen ? "1fr" : "0fr")};
  }
`;

const NavGroupContent = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  opacity: ${({ $isOpen }) => ($isOpen ? "1" : "0")};
  transition:
    opacity 0.25s ease-in-out,
    padding 0.25s ease-in-out;
  padding-bottom: ${({ $isOpen }) => ($isOpen ? "4px" : "0")};

  @media (max-width: 1024px) {
    opacity: 1;
    overflow: visible;
    padding-bottom: 4px;
  }
  @media (max-width: 768px) {
    opacity: ${({ $isOpen }) => ($isOpen ? "1" : "0")};
    overflow: hidden;
    padding-bottom: ${({ $isOpen }) => ($isOpen ? "4px" : "0")};
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 11px;
  padding: 9px 12px;
  text-decoration: none;
  white-space: nowrap;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 500;
  border-radius: 7px;
  transition: all 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #64748b;
    transition: color 0.15s ease;
  }

  span {
    display: block;
    @media (max-width: 768px) {
      display: block;
    }
  }

  &:hover {
    background-color: #e2e8f0;
    color: ${colors.primary};

    svg {
      color: ${colors.primary};
    }
  }

  &.active {
    background-color: #ffffff;
    color: #047857;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border-left: 3px solid #059669;

    svg {
      color: #059669;
    }
  }

  @media (max-width: 768px) {
    justify-content: flex-start;
    padding: 9px 12px;
    gap: 10px;
  }
`;

const UserSection = styled.div`
  padding: 20px;
  border-top: 1px solid ${colors.border};
  background: ${colors.background};
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 260px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 20px;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  span:first-child {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${colors.textMain};
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  span:last-child {
    font-size: 0.75rem;
    color: ${colors.textMuted};
    text-transform: capitalize;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #fee2e2;
  background: white;
  border-radius: 10px;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  span {
    display: block;
    @media (max-width: 768px) {
      display: block;
    }
  }

  &:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }
`;

// --- Main Component ---

const Sidebar = ({ role, allowedActions, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [sidebarData, setSidebarData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Accordion state: single active open group index (null = all collapsed by default)
  const [openGroupIndex, setOpenGroupIndex] = useState(null);

  useEffect(() => {
    const loadSidebarData = async () => {
      const data = await fetchSidebarMapping();
      setSidebarData(data);
    };
    loadSidebarData();
  }, []);

  // Ensures default state is collapsed except for active route, and navigations auto-open active group
  useEffect(() => {
    if (sidebarData.length > 0) {
      const activeGroupIndex = sidebarData.findIndex((group) =>
        (group.pages || []).some((page) =>
          location.pathname.startsWith(page.route),
        ),
      );
      setOpenGroupIndex(activeGroupIndex !== -1 ? activeGroupIndex : null);
    }
  }, [sidebarData, location.pathname]);

  // Accordion toggle: opening one collapses all others; clicking the open one collapses it
  const toggleGroup = (index) => {
    setOpenGroupIndex((prev) => (prev === index ? null : index));
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth <= 768) setIsCollapsed(false);
  };
  const toggleDesktopCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      <Overlay $isCollapsed={isCollapsed} onClick={closeMobileSidebar} />

      <SidebarContainer $isCollapsed={isCollapsed}>
        <BrandSection>
          <BrandLogo src={LOGO} alt="Logo" />
          <CloseMobileBtn onClick={closeMobileSidebar}>
            <X size={20} />
          </CloseMobileBtn>
        </BrandSection>

        <SearchContainer>
          <SearchInputWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputWrapper>
        </SearchContainer>

        <NavMenu>
          {sidebarData.map((group, groupIndex) => {
            // Use globally configured integer ID array for permission-based rendering
            const storedHmsPages = (() => {
              try {
                const raw = JSON.parse(localStorage.getItem("hms_pages") || "[]");
                return Array.isArray(raw) ? raw.map(Number) : [];
              } catch {
                return [];
              }
            })();

            const currentOutlet = localStorage.getItem("selected_outlet");
            const allowedPages = (group.pages || []).filter((page) => {
              const perms = page.permissions || [];
              // Check if permissions are defined (either as non-empty array or non-empty object)
              const hasDefinedPermissions = Array.isArray(perms)
                ? perms.length > 0
                : perms &&
                typeof perms === "object" &&
                Object.keys(perms).length > 0;

              if (
                hasDefinedPermissions &&
                page.page_id != null &&
                !storedHmsPages.includes(Number(page.page_id))
              ) {
                return false;
              }

              // Check if the page is bound to a specific outlet
              if (page.outlet_code && page.outlet_code.trim() !== "") {
                // If it is bound, only show if it matches the current active outlet
                if (page.outlet_code !== currentOutlet) {
                  return false;
                }
              }

              return true;
            });

            const groupNameMatches =
              group.group &&
              group.group.toLowerCase().includes(searchTerm.toLowerCase());

            const searchFilteredPages = allowedPages.filter((page) =>
              page.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );

            // Hide the entire group if user has no access to any of its pages after search
            const pagesToShow = groupNameMatches
              ? allowedPages
              : searchFilteredPages;

            if (pagesToShow.length === 0) return null;

            // Open if searching, else only open the single active group index (accordion)
            const isOpen = searchTerm ? true : openGroupIndex === groupIndex;

            return (
              <React.Fragment key={groupIndex}>
                {group.group && (
                  <NavGroupHeader onClick={() => toggleGroup(groupIndex)}>
                    <span>{group.group}</span>
                    {isOpen ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </NavGroupHeader>
                )}

                <NavGroupContentWrapper $isOpen={isOpen}>
                  <NavGroupContent $isOpen={isOpen}>
                    {pagesToShow.map((page, pageIndex) => {
                      const IconComponent = iconMap[page.icon] || Activity;

                      return (
                        <StyledNavLink
                          to={page.route}
                          key={pageIndex}
                          onClick={closeMobileSidebar}
                        >
                          <IconComponent /> <span>{page.name}</span>
                        </StyledNavLink>
                      );
                    })}
                  </NavGroupContent>
                </NavGroupContentWrapper>
              </React.Fragment>
            );
          })}
        </NavMenu>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
