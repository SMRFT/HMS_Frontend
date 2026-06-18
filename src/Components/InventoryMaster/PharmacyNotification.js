import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import styled, { keyframes, css } from "styled-components";

// ─── Animations ───────────────────────────────────────────────────────────────

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1);    }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.18); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Bell Button ──────────────────────────────────────────────────────────────

const BellWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const BellButton = styled.button`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  flex-shrink: 0;

  &:hover {
    background: rgba(13, 148, 136, 0.08);
    color: #0d9488;
    border-color: rgba(13, 148, 136, 0.35);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.12);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 17px;
    height: 17px;
    ${({ $hasAlerts }) =>
      $hasAlerts &&
      css`
        animation: ${pulse} 2.5s ease-in-out infinite;
      `}
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  pointer-events: none;
  line-height: 1;
`;

// ─── Panel ────────────────────────────────────────────────────────────────────

const PanelOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 998;
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 370px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 999;
  overflow: hidden;
  animation: ${slideIn} 0.2s ease;

  @media (max-width: 420px) {
    width: calc(100vw - 24px);
    right: -8px;
  }
`;

const PanelHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelTitle = styled.h3`
  margin: 0;
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
`;

const PanelMeta = styled.span`
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.75);
`;

const TabRow = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? "#0d9488" : "#64748b")};
  border-bottom: ${({ $active }) =>
    $active ? "2px solid #0d9488" : "2px solid transparent"};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    color: #0d9488;
    background: rgba(13, 148, 136, 0.05);
  }
`;

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  padding: 0 4px;
  background: ${({ $variant }) =>
    $variant === "red" ? "#fef2f2" : "#fffbeb"};
  color: ${({ $variant }) =>
    $variant === "red" ? "#dc2626" : "#d97706"};
`;

// ─── List ─────────────────────────────────────────────────────────────────────

const List = styled.div`
  max-height: 340px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  padding: 8px 14px 5px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
  cursor: default;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
  }
`;

const IconBox = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  background: ${({ $variant }) =>
    $variant === "red"
      ? "#fef2f2"
      : $variant === "orange"
      ? "#fff7ed"
      : "#fffbeb"};
  color: ${({ $variant }) =>
    $variant === "red"
      ? "#dc2626"
      : $variant === "orange"
      ? "#ea580c"
      : "#d97706"};
`;

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
`;

const ItemSub = styled.div`
  font-size: 0.72rem;
  color: #64748b;
`;

const ItemMeta = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const Pill = styled.span`
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9px;
  background: ${({ $variant }) =>
    $variant === "red"
      ? "#fef2f2"
      : $variant === "orange"
      ? "#fff7ed"
      : "#fffbeb"};
  color: ${({ $variant }) =>
    $variant === "red"
      ? "#dc2626"
      : $variant === "orange"
      ? "#ea580c"
      : "#d97706"};
`;

const ItemDays = styled.div`
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 3px;
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.82rem;

  span {
    display: block;
    font-size: 1.8rem;
    margin-bottom: 8px;
  }
`;

// ─── Footer ───────────────────────────────────────────────────────────────────

const PanelFooter = styled.div`
  padding: 10px 14px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #0d9488;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  transition: background 0.15s;

  &:hover {
    background: rgba(13, 148, 136, 0.08);
  }

  svg {
    width: 13px;
    height: 13px;
    ${({ $loading }) =>
      $loading &&
      css`
        animation: ${spin} 0.8s linear infinite;
      `}
  }
`;

const FooterMeta = styled.span`
  font-size: 0.7rem;
  color: #94a3b8;
`;

// ─── Loading Spinner ──────────────────────────────────────────────────────────

const LoadingWrap = styled.div`
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 0.8rem;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2.5px solid #e2e8f0;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function BellIcon({ hasAlerts }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PharmacyNotification = () => {
  const [open, setOpen]               = useState(false);
  const [activeTab, setActiveTab]     = useState("expiry");
  const [loading, setLoading]         = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastSynced, setLastSynced]   = useState(null);
  const [expiryAlerts, setExpiryAlerts]   = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const panelRef  = useRef(null);
  const wrapRef   = useRef(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAlerts = useCallback(
    async (silent = false) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const response = await apiRequest(
          `${HmsBaseUrl}pharmacy/notifications/`,
          "GET"
        );
        if (response && !response.error) {
          setExpiryAlerts(response.data?.expiry_alerts ?? []);
          setLowStockAlerts(response.data?.low_stock_alerts ?? []);
          setLastSynced(new Date());
        } else {
          if (!silent) toast.error("Failed to load notifications");
        }
      } catch {
        if (!silent) toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [HmsBaseUrl]
  );

  // Fetch on mount and every 5 minutes
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ── Computed ───────────────────────────────────────────────────────────────

  const expiry30 = expiryAlerts.filter((a) => a.urgency === "critical");
  const expiry90 = expiryAlerts.filter((a) => a.urgency === "warning");
  const totalCount = expiryAlerts.length + lowStockAlerts.length;

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderExpiryTab = () => {
    if (loading) return <LoadingWrap><Spinner /><span>Loading alerts...</span></LoadingWrap>;
    if (expiryAlerts.length === 0)
      return (
        <EmptyState>
          <span>✅</span>
          No expiry alerts at this time
        </EmptyState>
      );

    return (
      <>
        {expiry30.length > 0 && (
          <>
            <SectionLabel>⚠ Expiring within 30 days</SectionLabel>
            {expiry30.map((item) => (
              <AlertItem key={`${item.stock_id}-exp`}>
                <IconBox $variant="red"><AlertTriangleIcon /></IconBox>
                <ItemBody>
                  <ItemName title={item.item_name}>{item.item_name}</ItemName>
                  <ItemSub>
                    Batch: {item.batch_number} · Qty: {item.available}
                  </ItemSub>
                </ItemBody>
                <ItemMeta>
                  <Pill $variant="red">{item.days_left}d left</Pill>
                  <ItemDays>{item.expiry_date}</ItemDays>
                </ItemMeta>
              </AlertItem>
            ))}
          </>
        )}

        {expiry90.length > 0 && (
          <>
            <SectionLabel>🕐 Expiring within 90 days</SectionLabel>
            {expiry90.map((item) => (
              <AlertItem key={`${item.stock_id}-warn`}>
                <IconBox $variant="amber"><ClockIcon /></IconBox>
                <ItemBody>
                  <ItemName title={item.item_name}>{item.item_name}</ItemName>
                  <ItemSub>
                    Batch: {item.batch_number} · Qty: {item.available}
                  </ItemSub>
                </ItemBody>
                <ItemMeta>
                  <Pill $variant="amber">{item.days_left}d left</Pill>
                  <ItemDays>{item.expiry_date}</ItemDays>
                </ItemMeta>
              </AlertItem>
            ))}
          </>
        )}
      </>
    );
  };

  const renderLowStockTab = () => {
    if (loading) return <LoadingWrap><Spinner /><span>Loading alerts...</span></LoadingWrap>;
    if (lowStockAlerts.length === 0)
      return (
        <EmptyState>
          <span>✅</span>
          All items are sufficiently stocked
        </EmptyState>
      );

    return (
      <>
        <SectionLabel>📦 Below reorder level</SectionLabel>
        {lowStockAlerts.map((item) => (
          <AlertItem key={`low-${item.item_id}`}>
            <IconBox $variant={item.urgency === "critical" ? "red" : "orange"}>
              <PackageIcon />
            </IconBox>
            <ItemBody>
              <ItemName title={item.item_name}>{item.item_name}</ItemName>
              <ItemSub>
                Available: {item.available} · Reorder at: {item.reorder_level}
              </ItemSub>
            </ItemBody>
            <ItemMeta>
              <Pill $variant={item.urgency === "critical" ? "red" : "orange"}>
                {item.urgency === "critical" ? "Critical" : "Low"}
              </Pill>
              <ItemDays>{item.deficit} units</ItemDays>
            </ItemMeta>
          </AlertItem>
        ))}
      </>
    );
  };

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <BellWrapper ref={wrapRef}>
      <BellButton
        onClick={() => setOpen((prev) => !prev)}
        $hasAlerts={totalCount > 0}
        title="Stock Notifications"
        aria-label={`Stock notifications, ${totalCount} alerts`}
      >
        <BellIcon />
        {totalCount > 0 && (
          <Badge>{totalCount > 99 ? "99+" : totalCount}</Badge>
        )}
      </BellButton>

      {open && (
        <>
          <PanelOverlay onClick={() => setOpen(false)} />
          <Panel ref={panelRef}>
            {/* Header */}
            <PanelHeader>
              <div>
                <PanelTitle>🔔 Stock Alerts</PanelTitle>
              </div>
              <PanelMeta>
                {lastSynced ? `Synced ${formatTime(lastSynced)}` : "Syncing..."}
              </PanelMeta>
            </PanelHeader>

            {/* Tabs */}
            <TabRow>
              <Tab
                $active={activeTab === "expiry"}
                onClick={() => setActiveTab("expiry")}
              >
                Nearby Expiry
                <TabCount $variant="red">{expiryAlerts.length}</TabCount>
              </Tab>
              <Tab
                $active={activeTab === "lowstock"}
                onClick={() => setActiveTab("lowstock")}
              >
                Low Stock
                <TabCount $variant="amber">{lowStockAlerts.length}</TabCount>
              </Tab>
            </TabRow>

            {/* List */}
            <List>
              {activeTab === "expiry"
                ? renderExpiryTab()
                : renderLowStockTab()}
            </List>

            {/* Footer */}
            <PanelFooter>
              <RefreshBtn
                $loading={refreshing}
                onClick={() => fetchAlerts(true)}
                disabled={refreshing}
              >
                <RefreshIcon />
                {refreshing ? "Refreshing..." : "Refresh"}
              </RefreshBtn>
              <FooterMeta>
                {totalCount} total alert{totalCount !== 1 ? "s" : ""}
              </FooterMeta>
            </PanelFooter>
          </Panel>
        </>
      )}
    </BellWrapper>
  );
};

export default PharmacyNotification;