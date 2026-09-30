import React from "react";
import styled, { keyframes, css } from "styled-components";

/* ─────────────────────────────────────────────────────────────────────────────
   UNIFIED INVENTORY DESIGN TOKENS (Hospital Teal & Slate Palette)
   ───────────────────────────────────────────────────────────────────────────── */
export const InvTheme = {
  primary:      "#0d9488",
  primaryDark:  "#0f766e",
  primaryLight: "#f0fdfa",
  primaryBorder:"#ccfbf1",
  accent:       "#f97316",
  accentHover:  "#ea580c",
  surface:      "#ffffff",
  background:   "#f8fafc",
  border:       "#e2e8f0",
  borderMedium: "#cbd5e1",
  textMain:     "#0f172a",
  textMuted:    "#64748b",
  success:      "#16a34a",
  successLight: "#dcfce7",
  danger:       "#dc2626",
  dangerLight:  "#fee2e2",
  warning:      "#d97706",
  warningLight: "#fef3c7",
  font:         "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  shadowSm:     "0 1px 3px rgba(0,0,0,0.06)",
  shadowMd:     "0 4px 12px rgba(0,0,0,0.08)",
  shadowLg:     "0 10px 25px rgba(0,0,0,0.12)",
};

const fadeIn = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`;
const popIn = keyframes`from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}`;

/* ─── Header ──────────────────────────────────────────────────────────────── */
export const InvPageHeader = styled.div`
  background: linear-gradient(135deg, ${InvTheme.primary} 0%, ${InvTheme.primaryDark} 100%);
  color: #ffffff;
  padding: 14px 22px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  box-shadow: ${InvTheme.shadowSm};
`;

export const InvPageTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const InvPageSubtitle = styled.p`
  margin: 3px 0 0 0;
  font-size: 0.78rem;
  opacity: 0.88;
`;

export const InvAddBtn = styled.button`
  height: 34px;
  padding: 0 16px;
  font-size: 0.82rem;
  font-weight: 700;
  background: ${p => p.danger ? InvTheme.danger : (p.secondary ? "#475569" : InvTheme.accent)};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  transition: all 0.18s ease;
  &:hover {
    background: ${p => p.danger ? "#b91c1c" : (p.secondary ? "#334155" : InvTheme.accentHover)};
    transform: translateY(-1px);
  }
`;

/* ─── Top Toolbar (Show Upto, Date Filter, Search, Custom Filters) ────────── */
/* ─── Top Toolbar (Show Upto, Date Filter, Search, Custom Filters) ────────── */
export const InvToolbarWrapper = styled.div`
  background: #f8fafc;
  border: 1px solid ${InvTheme.border};
  border-radius: 8px 8px 0 0;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-bottom: 0;
  box-sizing: border-box;
  width: 100%;
`;

export const InvToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1 1 auto;
`;

export const InvToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex: 0 0 auto;
`;

export const InvFieldGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export const InvFieldLabel = styled.label`
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
`;

export const InvSelect = styled.select`
  height: 32px;
  padding: 0 8px;
  font-size: 0.8rem;
  border: 1px solid ${InvTheme.borderMedium};
  border-radius: 6px;
  background: #ffffff;
  color: ${InvTheme.textMain};
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
  &:focus {
    border-color: ${InvTheme.primary};
    box-shadow: 0 0 0 2px ${InvTheme.primaryBorder};
  }
`;

export const InvInput = styled.input`
  height: 32px;
  padding: 0 8px;
  font-size: 0.8rem;
  border: 1px solid ${InvTheme.borderMedium};
  border-radius: 6px;
  background: #ffffff;
  color: ${InvTheme.textMain};
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
  &:focus {
    border-color: ${InvTheme.primary};
    box-shadow: 0 0 0 2px ${InvTheme.primaryBorder};
  }
`;

export const InvPillBtn = styled.button`
  height: 30px;
  padding: 0 9px;
  font-size: 0.74rem;
  font-weight: 600;
  border-radius: 5px;
  border: 1px solid ${p => p.active ? InvTheme.primary : InvTheme.borderMedium};
  background: ${p => p.active ? InvTheme.primaryLight : "#ffffff"};
  color: ${p => p.active ? InvTheme.primaryDark : "#475569"};
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: all 0.15s;
  &:hover {
    border-color: ${InvTheme.primary};
    background: ${InvTheme.primaryLight};
    color: ${InvTheme.primaryDark};
  }
`;

export const InvCountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  background: #e2e8f0;
  color: #334155;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
`;

/* ─── Top Toolbar Component ──────────────────────────────────────────────── */
export const InvTopToolbar = ({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  search,
  onSearchChange,
  searchPlaceholder = "Search records...",
  date,
  dateFilter,
  onDateChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClearDate,
  onSetToday,
  totalRecords,
  customFilters,
}) => {
  const activeDateVal = date || dateFilter || "";
  const isDateActive = Boolean(activeDateVal || fromDate || toDate);

  const handleDefaultToday = () => {
    const t = getTodayDateString();
    if (onFromDateChange) onFromDateChange(t);
    if (onToDateChange) onToDateChange(t);
    if (onDateChange) onDateChange(t);
  };

  const handleDefaultClear = () => {
    if (onFromDateChange) onFromDateChange("");
    if (onToDateChange) onToDateChange("");
    if (onDateChange) onDateChange("");
  };

  return (
    <InvToolbarWrapper>
      {/* Left: Show Entries & Date Filters */}
      <InvToolbarLeft>
        {onPageSizeChange && (
          <InvFieldGroup>
            <InvFieldLabel>Show:</InvFieldLabel>
            <InvSelect
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </InvSelect>
          </InvFieldGroup>
        )}

        {/* Date Filter (Single or From - To Range) */}
        {onFromDateChange ? (
          <InvFieldGroup>
            <InvFieldLabel>From:</InvFieldLabel>
            <InvInput
              type="date"
              style={{ width: 130 }}
              value={fromDate || ""}
              onChange={(e) => onFromDateChange(e.target.value)}
            />
            {onToDateChange && (
              <>
                <InvFieldLabel style={{ marginLeft: 2 }}>To:</InvFieldLabel>
                <InvInput
                  type="date"
                  style={{ width: 130 }}
                  value={toDate || ""}
                  onChange={(e) => onToDateChange(e.target.value)}
                />
              </>
            )}
          </InvFieldGroup>
        ) : onDateChange ? (
          <InvFieldGroup>
            <InvFieldLabel>Date:</InvFieldLabel>
            <InvInput
              type="date"
              style={{ width: 130 }}
              value={activeDateVal}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </InvFieldGroup>
        ) : null}

        {/* Quick Date Pills */}
        {(onSetToday || (onFromDateChange && !onSetToday)) && (
          <InvPillBtn onClick={onSetToday || handleDefaultToday} title="Set filter to today">
            Today
          </InvPillBtn>
        )}
        {(onClearDate || (onFromDateChange && !onClearDate)) && isDateActive && (
          <InvPillBtn onClick={onClearDate || handleDefaultClear} title="Show all dates">
            ✕ Clear
          </InvPillBtn>
        )}
      </InvToolbarLeft>

      {/* Right: Custom Filters, Search & Live Count */}
      <InvToolbarRight>
        {customFilters}

        {onSearchChange && (
          <InvFieldGroup>
            <InvInput
              style={{ minWidth: 180, width: "100%", maxWidth: 260 }}
              type="text"
              placeholder={searchPlaceholder}
              value={search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search && (
              <InvPillBtn onClick={() => onSearchChange("")} title="Clear search">
                ✕
              </InvPillBtn>
            )}
          </InvFieldGroup>
        )}

        {totalRecords !== undefined && (
          <InvCountBadge>
            {totalRecords} record{totalRecords === 1 ? "" : "s"}
          </InvCountBadge>
        )}
      </InvToolbarRight>
    </InvToolbarWrapper>
  );
};

/* ─── Bottom Pagination Component ────────────────────────────────────────── */
export const InvPagerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #ffffff;
  border-left: 1px solid ${InvTheme.border};
  border-right: 1px solid ${InvTheme.border};
  border-bottom: 1px solid ${InvTheme.border};
  border-radius: 0 0 8px 8px;
  flex-wrap: wrap;
  gap: 12px;
`;

export const InvPagerInfo = styled.span`
  font-size: 0.8rem;
  color: ${InvTheme.textMuted};
  strong {
    color: ${InvTheme.textMain};
  }
`;

export const InvPagerControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const InvPageBtn = styled.button`
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid ${p => p.active ? InvTheme.primary : InvTheme.borderMedium};
  border-radius: 5px;
  background: ${p => p.active ? InvTheme.primary : "#ffffff"};
  color: ${p => p.active ? "#ffffff" : InvTheme.textMain};
  font-size: 0.78rem;
  font-weight: ${p => p.active ? 700 : 500};
  cursor: ${p => p.disabled ? "not-allowed" : "pointer"};
  opacity: ${p => p.disabled ? 0.35 : 1};
  transition: all 0.15s ease;
  &:hover:not(:disabled) {
    background: ${p => p.active ? InvTheme.primaryDark : InvTheme.primaryLight};
    border-color: ${InvTheme.primary};
  }
`;

export const InvPagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalRecords = 0,
  onPageChange,
}) => {
  const startIdx = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalRecords);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const goTo = (p) => {
    if (p >= 1 && p <= totalPages && p !== currentPage && onPageChange) {
      onPageChange(p);
    }
  };

  return (
    <InvPagerWrapper>
      <InvPagerInfo>
        Showing <strong>{startIdx}–{endIdx}</strong> of <strong>{totalRecords}</strong> records
      </InvPagerInfo>

      <InvPagerControls>
        <InvPageBtn onClick={() => goTo(1)} disabled={currentPage === 1} title="First Page">
          «
        </InvPageBtn>
        <InvPageBtn onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} title="Previous Page">
          ‹
        </InvPageBtn>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <InvPageBtn key={`ellipsis-${idx}`} disabled style={{ cursor: "default" }}>…</InvPageBtn>
          ) : (
            <InvPageBtn key={p} active={p === currentPage} onClick={() => goTo(p)}>
              {p}
            </InvPageBtn>
          )
        )}

        <InvPageBtn onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} title="Next Page">
          ›
        </InvPageBtn>
        <InvPageBtn onClick={() => goTo(totalPages)} disabled={currentPage === totalPages} title="Last Page">
          »
        </InvPageBtn>
      </InvPagerControls>
    </InvPagerWrapper>
  );
};

/* ─── Modal / Form Components ────────────────────────────────────────────── */
export const InvModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const InvModalContainer = styled.div`
  background: #ffffff;
  border-radius: 10px;
  width: 100%;
  max-width: ${p => p.maxWidth || "850px"};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${InvTheme.shadowLg};
  animation: ${popIn} 0.25s ease both;
  overflow: hidden;
`;

export const InvModalHeader = styled.div`
  background: linear-gradient(135deg, ${InvTheme.primary} 0%, ${InvTheme.primaryDark} 100%);
  color: #ffffff;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const InvModalTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
`;

export const InvModalCloseBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.85);
  font-size: 1.3rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s;
  &:hover {
    background: rgba(255,255,255,0.18);
    color: #ffffff;
  }
`;

export const InvModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

export const InvModalFooter = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${InvTheme.border};
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

/* ─── Modern Table Components ────────────────────────────────────────────── */
export const InvTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  background: #ffffff;
  border-left: 1px solid ${InvTheme.border};
  border-right: 1px solid ${InvTheme.border};
`;

export const InvTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  font-family: ${InvTheme.font};
`;

export const InvTh = styled.th`
  background: #0d9488;
  color: #ffffff;
  padding: 10px 14px;
  font-weight: 700;
  text-align: ${p => p.align || "left"};
  border-right: 1px solid rgba(255,255,255,0.12);
  white-space: nowrap;
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  &:last-child {
    border-right: none;
  }
`;

export const InvTd = styled.td`
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  border-right: 1px solid #f8fafc;
  color: ${InvTheme.textMain};
  text-align: ${p => p.align || "left"};
  vertical-align: middle;
  &:last-child {
    border-right: none;
  }
`;

export const InvTr = styled.tr`
  transition: background 0.12s ease;
  &:nth-child(even) {
    background: #fcfdfd;
  }
  &:hover {
    background: ${InvTheme.primaryLight} !important;
  }
`;

export const InvBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${p => p.bg || InvTheme.primaryLight};
  color: ${p => p.color || InvTheme.primaryDark};
  border: 1px solid ${p => p.border || InvTheme.primaryBorder};
`;

export const InvActionBtn = styled.button`
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
  background: ${p => p.danger ? "#fee2e2" : (p.secondary ? "#e2e8f0" : InvTheme.primaryLight)};
  color: ${p => p.danger ? "#b91c1c" : (p.secondary ? "#334155" : InvTheme.primaryDark)};
  &:hover {
    background: ${p => p.danger ? "#fca5a5" : (p.secondary ? "#cbd5e1" : "#ccfbf1")};
    transform: translateY(-1px);
  }
`;

export const getTodayDateString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/* ─── Common Form & Card Components ──────────────────────────────────────── */
export const InvCard = styled.div`
  background: #ffffff;
  border: 1px solid ${InvTheme.border};
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: ${InvTheme.shadowSm};
  overflow: hidden;
`;

export const InvCardHeader = styled.div`
  padding: 12px 18px;
  border-bottom: 1px solid ${InvTheme.border};
  background: #f8fafc;
  font-weight: 700;
  font-size: 0.88rem;
  color: ${InvTheme.primaryDark};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const InvCardBody = styled.div`
  padding: 18px;
`;

export const InvFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${p => p.minWidth || "220px"}, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

export const InvFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
`;

export const InvFormLabel = styled.label`
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  ${p => p.required && css`
    &::after {
      content: " *";
      color: ${InvTheme.danger};
    }
  `}
`;

export const InvFormError = styled.span`
  color: ${InvTheme.danger};
  font-size: 0.73rem;
  margin-top: 2px;
`;

export const InvEmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${InvTheme.textMuted};
  font-size: 0.9rem;
`;

export const InvTabWrapper = styled.div`
  display: flex;
  border-bottom: 2px solid ${InvTheme.border};
  background: #f8fafc;
  padding: 0 16px;
  gap: 8px;
`;

export const InvTabBtn = styled.button`
  padding: 10px 18px;
  font-size: 0.84rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: ${p => p.active ? InvTheme.primary : InvTheme.textMuted};
  border-bottom: 3px solid ${p => p.active ? InvTheme.primary : "transparent"};
  cursor: pointer;
  margin-bottom: -2px;
  transition: all 0.15s ease;
  &:hover {
    color: ${InvTheme.primary};
  }
`;

export const InvToast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  padding: 12px 20px;
  border-radius: 8px;
  background: ${p => p.error ? InvTheme.danger : InvTheme.success};
  color: #ffffff;
  font-weight: 600;
  font-size: 0.88rem;
  box-shadow: ${InvTheme.shadowMd};
  animation: ${fadeIn} 0.3s ease;
`;

