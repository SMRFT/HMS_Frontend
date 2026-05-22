import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  Maximize,
  Minimize,
  LogOut,
  Clock,
  MapPin,
  Activity,
  ChevronDown,
  Shield,
  Bell,
  User,
  Settings,
  HelpCircle,
  RefreshCw,
  Menu,
} from "lucide-react";
import { colors } from "./GlobalStyles";
import Favilogo from "./Images/smrft_logo.png";

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeSlideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1);    }
`;

const pulseDot = keyframes`
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.7; }
`;

const tickFlip = keyframes`
  0%   { opacity: 0.4; transform: translateY(-4px); }
  100% { opacity: 1;   transform: translateY(0);    }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "260px")};
  right: 0;
  height: 62px;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid ${colors.border};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 4px 20px rgba(0, 0, 0, 0.04);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    left: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "260px")};
  }

  @media (max-width: 768px) {
    left: 0;
    padding: 0 14px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding: 0 8px;
    gap: 6px;
  }
`;


/* Offset helper — add this class to your main layout wrapper */
/* e.g. <main style={{ paddingTop: "62px" }}> */

// ── Left: Branding ────────────────────────────────────────────────────────────

const BrandingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 1;
  min-width: 0;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const BrandIconWrap = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
  flex-shrink: 0;

  svg {
    color: #fff;
  }
`;

const BrandTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const HospitalName = styled.h1`
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
  color: ${colors.textMain};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  span {
    color: ${colors.primary};
  }

  @media (max-width: 480px) {
    font-size: 0.78rem;
    letter-spacing: 0.2px;
  }
`;

const BrandDivider = styled.div`
  width: 1px;
  height: 22px;
  background: ${colors.border};
  margin: 0 12px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const HospitalAddress = styled.div`
  font-size: 0.72rem;
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  font-weight: 500;

  svg {
    color: ${colors.primary};
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

// ── Clock ─────────────────────────────────────────────────────────────────────

const ClockSection = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid ${colors.border};
  border-radius: 12px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;

  @media (max-width: 640px) {
    display: none;
  }
`;

const ClockIconBox = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    color: #fff;
  }
`;

const ClockTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

const TimeText = styled.div`
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${colors.textMain};
  letter-spacing: 0.4px;
  animation: ${tickFlip} 0.25s ease both;
  line-height: 1.2;
`;

const DateText = styled.div`
  font-size: 0.66rem;
  color: ${colors.textMuted};
  font-weight: 500;
  letter-spacing: 0.2px;
  line-height: 1.2;
`;
// ── Outlet Display ────────────────────────────────────────────────────────────
const OutletSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background: rgba(13, 148, 136, 0.05);
  border: 1px solid rgba(13, 148, 136, 0.2);
  border-radius: 12px;
  margin-right: 8px;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(13, 148, 136, 0.08);
    border-color: rgba(13, 148, 136, 0.3);
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const OutletIconBox = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.2);
`;

const OutletTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

const OutletLabel = styled.span`
  font-size: 0.62rem;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const OutletName = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${colors.textMain};
  white-space: nowrap;
`;

const SwitchBtn = styled.button`
  margin-left: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(13, 148, 136, 0.2);
  background: white;
  color: ${colors.primary};
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${colors.primary};
    color: white;
    border-color: ${colors.primary};
  }
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

// ── Right: Actions ────────────────────────────────────────────────────────────

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const HeaderDivider = styled.div`
  width: 1px;
  height: 26px;
  background: ${colors.border};
  margin: 0 4px;

  @media (max-width: 480px) {
    display: none;
  }
`;

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${colors.border};
  background: white;
  color: ${colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;

  &:hover {
    background: ${colors.primaryLight || "rgba(13,148,136,0.08)"};
    color: ${colors.primary};
    border-color: rgba(13, 148, 136, 0.35);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.12);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    ${({ $hideOnMobile }) =>
      $hideOnMobile &&
      css`
        display: none;
      `}
  }
`;

const NotifBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid white;
  animation: ${pulseDot} 2s ease-in-out infinite;
`;

// ── User Profile Button ───────────────────────────────────────────────────────

const UserProfileWrapper = styled.div`
  position: relative;
`;

const UserProfileBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 10px 4px 4px;
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(13, 148, 136, 0.4);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    background: #fafffe;
  }

  ${({ $open }) =>
    $open &&
    css`
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    `}

  @media (max-width: 480px) {
    padding: 4px;
    gap: 0;
    border-radius: 9px;
  }
`;

const UserAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
`;

const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  line-height: 1.3;

  @media (max-width: 640px) {
    display: none;
  }
`;

const UserNameText = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${colors.textMain};
  white-space: nowrap;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRoleText = styled.span`
  font-size: 0.67rem;
  color: ${colors.textMuted};
  text-transform: capitalize;
`;

const ChevronBox = styled.div`
  color: ${colors.textMuted};
  transition: transform 0.25s ease;
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
  display: flex;

  @media (max-width: 640px) {
    display: none;
  }
`;

// ── Dropdown ──────────────────────────────────────────────────────────────────

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 252px;
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 16px;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  animation: ${fadeSlideDown} 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
  z-index: 1300;
`;

const DropdownProfileHeader = styled.div`
  padding: 16px;
  background: linear-gradient(
    135deg,
    rgba(13, 148, 136, 0.07),
    rgba(13, 148, 136, 0.03)
  );
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DropdownBigAvatar = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
`;

const DropdownUserBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;

  strong {
    font-size: 0.88rem;
    font-weight: 700;
    color: ${colors.textMain};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 0.7rem;
    color: ${colors.textMuted};
  }
`;

const RolePill = styled.div`
  margin-top: 3px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(13, 148, 136, 0.1);
  color: ${colors.primary};
  font-size: 0.67rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.4px;

  svg {
    width: 10px;
    height: 10px;
  }
`;

const DropdownSection = styled.div`
  padding: 8px;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 9px;
  font-size: 0.83rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  color: ${({ $danger }) => ($danger ? "#ef4444" : colors.textMain)};
  text-align: left;

  svg {
    width: 16px;
    height: 16px;
    color: ${({ $danger }) => ($danger ? "#ef4444" : colors.textMuted)};
    flex-shrink: 0;
  }

  &:hover {
    background: ${({ $danger }) => ($danger ? "#fef2f2" : colors.background)};
    color: ${({ $danger }) => ($danger ? "#dc2626" : colors.primary)};

    svg {
      color: ${({ $danger }) => ($danger ? "#dc2626" : colors.primary)};
    }
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${colors.border};
  margin: 4px 8px;
`;

const SessionInfo = styled.div`
  padding: 10px 16px;
  border-top: 1px solid ${colors.border};
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SessionText = styled.div`
  font-size: 0.68rem;
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SessionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #22c55e;
`;

// ─── Main Component ───────────────────────────────────────────────────────────

const Header = ({ isSidebarCollapsed, setIsSidebarCollapsed, onSwitchOutlet, hasMultipleOutlets }) => {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasNotif] = useState(true);
  const [sessionStart] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState("0m");
  const dropdownRef = useRef(null);

  const employeeId = localStorage.getItem("employeeId") || "EMP001";
  const employeeName = localStorage.getItem("name") || "Hospital Staff";
  const userRole = localStorage.getItem("role") || "Member";

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      const diff = Math.floor((Date.now() - sessionStart.getTime()) / 60000);
      setSessionDuration(
        diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h ${diff % 60}m`,
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStart]);

  // Close dropdown outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ESC key close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/secure";
    }
  };

  const handleRefresh = () => window.location.reload();

  const formatTime = (d) =>
    d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const loginTime = sessionStart.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <HeaderContainer $isCollapsed={isSidebarCollapsed}>
      {/* Sidebar Toggle */}
      <IconBtn
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        style={{ marginRight: "8px" }}
      >
        <Menu size={20} />
      </IconBtn>

      {/* ── Left: Branding ── */}
      <BrandingSection>
        <img src={Favilogo} alt="Logo" style={{ height: "30px", width: "auto", objectFit: "contain", borderRadius: "4px" }} />

        <BrandTextGroup>
          <HospitalName>
            <span>Shanmuga</span>&nbsp;Hospital Limited
          </HospitalName>
          <HospitalAddress>
            <MapPin size={11} />
            51/24, Saradha College Road, Salem – 636007
          </HospitalAddress>
        </BrandTextGroup>
      </BrandingSection>

      <div style={{ flex: 1 }} />

      {/* ── Outlet Info ── */}
      {localStorage.getItem("selected_outlet") && (
        <OutletSection>
          <OutletIconBox>
            <MapPin size={14} />
          </OutletIconBox>
          <OutletTextGroup>
            <OutletLabel>Active Outlet</OutletLabel>
            <OutletName>{localStorage.getItem("selected_outlet_name") || localStorage.getItem("selected_outlet")}</OutletName>
          </OutletTextGroup>
          {hasMultipleOutlets && (
            <SwitchBtn onClick={onSwitchOutlet}>
              <RefreshCw size={10} /> Switch
            </SwitchBtn>
          )}
        </OutletSection>
      )}

      {/* ── Clock ── */}
      <ClockSection>
        <ClockIconBox>
          <Clock size={14} />
        </ClockIconBox>
        <ClockTexts>
          <TimeText key={time.getSeconds()}>{formatTime(time)}</TimeText>
          <DateText>{formatDate(time)}</DateText>
        </ClockTexts>
      </ClockSection>

      {/* ── Right: Actions ── */}
      <ActionSection>
        {/* Refresh */}
        <IconBtn onClick={handleRefresh} title="Refresh Page" $hideOnMobile>
          <RefreshCw size={17} />
        </IconBtn>

        {/* Fullscreen */}
        <IconBtn
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          $hideOnMobile
        >
          {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
        </IconBtn>

        {/* Notifications */}
        {/* <IconBtn title="Notifications">
          <Bell size={17} />
          {hasNotif && <NotifBadge />}
        </IconBtn> */}

        <HeaderDivider />

        {/* User Dropdown */}
        <UserProfileWrapper ref={dropdownRef}>
          <UserProfileBtn
            $open={dropdownOpen}
            onClick={() => setDropdownOpen((p) => !p)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <UserAvatar>{employeeName.charAt(0).toUpperCase()}</UserAvatar>
            <UserMeta>
              <UserNameText>{employeeName}</UserNameText>
              <UserRoleText>
                {userRole} · {employeeId}
              </UserRoleText>
            </UserMeta>
            <ChevronBox $open={dropdownOpen}>
              <ChevronDown size={14} />
            </ChevronBox>
          </UserProfileBtn>

          {/* ── Dropdown Panel ── */}
          {dropdownOpen && (
            <DropdownMenu role="menu">
              {/* User Card */}
              <DropdownProfileHeader>
                <DropdownBigAvatar>
                  {employeeName.charAt(0).toUpperCase()}
                </DropdownBigAvatar>
                <DropdownUserBlock>
                  <strong>{employeeName}</strong>
                  <span>ID: {employeeId}</span>
                  <RolePill>
                    <Shield /> {userRole}
                  </RolePill>
                </DropdownUserBlock>
              </DropdownProfileHeader>

              {/* Menu Items */}
              <DropdownSection>
                <DropdownItem onClick={() => setDropdownOpen(false)}>
                  <User /> My Profile
                </DropdownItem>
                <DropdownItem onClick={() => setDropdownOpen(false)}>
                  <Settings /> Account Settings
                </DropdownItem>
                <DropdownItem onClick={() => setDropdownOpen(false)}>
                  <HelpCircle /> Help & Support
                </DropdownItem>
                {hasMultipleOutlets && (
                  <DropdownItem onClick={() => { setDropdownOpen(false); onSwitchOutlet(); }}>
                    <MapPin /> Switch Outlet
                  </DropdownItem>
                )}
              </DropdownSection>

              <DropdownDivider />

              <DropdownSection>
                <DropdownItem $danger onClick={handleLogout}>
                  <LogOut /> Sign Out
                </DropdownItem>
              </DropdownSection>

              {/* Session Info Footer */}
              <SessionInfo>
                <SessionText>
                  <Clock size={11} /> Logged in at {loginTime}
                </SessionText>
                <SessionStatus>{sessionDuration}</SessionStatus>
              </SessionInfo>
            </DropdownMenu>
          )}
        </UserProfileWrapper>
      </ActionSection>
    </HeaderContainer>
  );
};

export default Header;