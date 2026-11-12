import React from "react";
import styled, { keyframes, css } from "styled-components";
import { SquarePen, Trash2, History, Save } from "lucide-react";
import SearchSelect from "../Common/SearchSelect";

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
export const InvCustomFiltersWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: nowrap;
  & > * {
    max-width: 135px !important;
    min-width: 95px !important;
    height: 28px !important;
  }
  & .search-select-wrapper, & div[data-search-select-trigger] {
    width: 125px !important;
    max-width: 135px !important;
    height: 28px !important;
    min-height: 28px !important;
    font-size: 0.74rem !important;
    padding: 0 6px !important;
  }
`;

export const InvToolbarWrapper = styled.div`
  background: #f8fafc;
  border: 1px solid ${InvTheme.border};
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap !important;
  gap: 6px 8px;
  margin-bottom: 0;
  box-sizing: border-box;
  width: 100%;
  min-height: 38px;
  overflow-x: auto;
  overflow-y: hidden;
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
`;

export const InvToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap !important;
  flex: 0 1 auto;
  min-width: 0;
`;

export const InvToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap !important;
  justify-content: flex-end;
  flex: 0 0 auto;
  margin-left: auto;
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

export const InvNativeSelect = styled.select`
  height: 28px;
  width: 100%;
  min-width: 0;
  padding: 0 6px;
  font-size: 0.76rem;
  font-family: ${InvTheme.font};
  border: 1px solid ${InvTheme.borderMedium};
  border-radius: 6px;
  background: #ffffff;
  color: ${InvTheme.textMain};
  outline: none;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.18s ease;
  &:hover {
    border-color: #94a3b8;
  }
  &:focus {
    border-color: ${InvTheme.primary};
    box-shadow: 0 0 0 3px ${InvTheme.primaryBorder};
  }
`;

export const InvSelect = SearchSelect;
export { SearchSelect, SearchSelect as InvSearchSelect };

export const InvInput = styled.input`
  height: 28px;
  width: 100%;
  min-width: 0;
  padding: 0 8px;
  font-size: 0.76rem;
  font-family: ${InvTheme.font};
  border: 1px solid ${InvTheme.borderMedium};
  border-radius: 6px;
  background: #ffffff;
  color: ${InvTheme.textMain};
  outline: none;
  box-sizing: border-box;
  transition: all 0.18s ease;
  &:hover {
    border-color: #94a3b8;
  }
  &:focus {
    border-color: ${InvTheme.primary};
    box-shadow: 0 0 0 3px ${InvTheme.primaryBorder};
  }
  &::placeholder {
    color: #94a3b8;
    font-size: 0.8rem;
  }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

export const InvPillBtn = styled.button`
  height: 26px;
  padding: 0 7px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid ${p => p.active ? InvTheme.primary : InvTheme.borderMedium};
  background: ${p => p.active ? InvTheme.primaryLight : "#ffffff"};
  color: ${p => p.active ? InvTheme.primaryDark : "#475569"};
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
  &:hover {
    border-color: ${InvTheme.primary};
    background: ${InvTheme.primaryLight};
    color: ${InvTheme.primaryDark};
  }
`;

export const InvCountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  height: 24px;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.68rem;
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
  totalCount,
  customFilters,
}) => {
  const displayTotal = totalRecords !== undefined ? totalRecords : totalCount;
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
      {/* Left: Show Entries, Date Filters & Custom Filters */}
      <InvToolbarLeft>
        {onPageSizeChange && (
          <InvFieldGroup>
            <InvFieldLabel>Show:</InvFieldLabel>
            <InvNativeSelect
              style={{ width: 54, minWidth: 54, height: 28 }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </InvNativeSelect>
          </InvFieldGroup>
        )}

        {/* Date Filter (Single or From - To Range) */}
        {onFromDateChange ? (
          <InvFieldGroup>
            <InvFieldLabel>From:</InvFieldLabel>
            <InvInput
              type="date"
              style={{ width: 105, height: 28 }}
              value={fromDate || ""}
              onChange={(e) => onFromDateChange(e.target.value)}
            />
            {onToDateChange && (
              <>
                <InvFieldLabel style={{ marginLeft: 2 }}>To:</InvFieldLabel>
                <InvInput
                  type="date"
                  style={{ width: 105, height: 28 }}
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
              style={{ width: 105, height: 28 }}
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

        {/* Custom Filters (e.g. Category Filter) on the same line */}
        {customFilters && (
          <InvCustomFiltersWrapper>
            {customFilters}
          </InvCustomFiltersWrapper>
        )}
      </InvToolbarLeft>

      {/* Right: Search & Live Count */}
      <InvToolbarRight>
        {onSearchChange && (
          <InvFieldGroup>
            <InvInput
              style={{ width: 165, minWidth: 120, maxWidth: 200, height: 28 }}
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

        {displayTotal !== undefined && (
          <InvCountBadge>
            {displayTotal} record{displayTotal === 1 ? "" : "s"}
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
  page,
  totalPages = 1,
  pageSize = 10,
  totalRecords = 0,
  totalCount,
  onPageChange,
}) => {
  const activePage = page || currentPage || 1;
  const count = totalRecords !== undefined && totalRecords !== null && totalRecords !== 0 ? totalRecords : (totalCount || 0);
  const pages = Math.max(1, totalPages || Math.ceil(count / (pageSize || 10)));
  const sz = pageSize || 10;
  const startIdx = count === 0 ? 0 : (activePage - 1) * sz + 1;
  const endIdx = count === 0 ? 0 : Math.min(activePage * sz, count);

  const getPageNumbers = () => {
    const list = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) list.push(i);
    } else {
      list.push(1);
      if (activePage > 3) list.push("...");
      const start = Math.max(2, activePage - 1);
      const end = Math.min(pages - 1, activePage + 1);
      for (let i = start; i <= end; i++) list.push(i);
      if (activePage < pages - 2) list.push("...");
      list.push(pages);
    }
    return list;
  };

  const goTo = (p) => {
    if (p >= 1 && p <= pages && p !== activePage && onPageChange) {
      onPageChange(p);
    }
  };

  return (
    <InvPagerWrapper>
      <InvPagerInfo>
        Showing <strong>{startIdx}–{endIdx}</strong> of <strong>{count}</strong> records
      </InvPagerInfo>

      <InvPagerControls>
        <InvPageBtn onClick={() => goTo(1)} disabled={activePage === 1} title="First Page">
          «
        </InvPageBtn>
        <InvPageBtn onClick={() => goTo(activePage - 1)} disabled={activePage === 1} title="Previous Page">
          ‹
        </InvPageBtn>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <InvPageBtn key={`ellipsis-${idx}`} disabled style={{ cursor: "default" }}>…</InvPageBtn>
          ) : (
            <InvPageBtn key={p} active={p === activePage} onClick={() => goTo(p)}>
              {p}
            </InvPageBtn>
          )
        )}

        <InvPageBtn onClick={() => goTo(activePage + 1)} disabled={activePage === pages} title="Next Page">
          ›
        </InvPageBtn>
        <InvPageBtn onClick={() => goTo(pages)} disabled={activePage === pages} title="Last Page">
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
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const InvModalContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: ${p => p.maxWidth || "860px"};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(226, 232, 240, 0.9);
  animation: ${popIn} 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
  overflow: hidden;
  box-sizing: border-box;
`;

export const InvModalHeader = styled.div`
  background: linear-gradient(135deg, ${InvTheme.primary} 0%, ${InvTheme.primaryDark} 100%);
  color: #ffffff;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
`;

export const InvModalTitle = styled.h3`
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const InvModalCloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.16s ease;
  &:hover {
    background: #ef4444;
    border-color: #ef4444;
    color: #ffffff;
    transform: scale(1.06);
  }
`;

export const InvModalBody = styled.div`
  padding: 20px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

export const InvModalFooter = styled.div`
  padding: 12px 24px;
  border-top: 1px solid ${InvTheme.border};
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
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
  padding: 11px 14px;
  font-weight: 700;
  text-align: ${p => p.align || "left"};
  border-right: 1px solid rgba(255,255,255,0.12);
  white-space: nowrap;
  font-size: 0.77rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
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
    background: #fbfdfc;
  }
  &:hover {
    background: #f0fdfa !important;
  }
`;

export const InvBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  background: ${p => p.bg || InvTheme.primaryLight};
  color: ${p => p.color || InvTheme.primaryDark};
  border: 1px solid ${p => p.border || InvTheme.primaryBorder};
`;

export const InvActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

export const InvActionBtn = styled.button`
  min-width: 28px;
  height: 28px;
  padding: ${p => p.$iconOnly ? "0" : "0 6px"};
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  transition: background-color 0.16s ease, color 0.16s ease, transform 0.14s ease;
  background: transparent;
  border: none;
  box-shadow: none;
  line-height: 1;

  ${(p) => {
    if (p.danger || p.variant === "danger" || p.variant === "delete") {
      return css`
        color: #ef4444;
        &:hover:not(:disabled) {
          background: #fee2e2;
          color: #dc2626;
          transform: translateY(-1px);
        }
      `;
    }
    if (p.variant === "history" || p.variant === "track" || p.variant === "info") {
      return css`
        color: #0369a1;
        &:hover:not(:disabled) {
          background: #e0f2fe;
          color: #0c4a6e;
          transform: translateY(-1px);
        }
      `;
    }
    if (p.variant === "edit") {
      return css`
        color: #0284c7;
        &:hover:not(:disabled) {
          background: #e0f2fe;
          color: #0369a1;
          transform: translateY(-1px);
        }
      `;
    }
    if (p.variant === "save") {
      return css`
        color: #0d9488;
        &:hover:not(:disabled) {
          background: #ccfbf1;
          color: #0f766e;
          transform: translateY(-1px);
        }
      `;
    }
    if (p.secondary || p.variant === "secondary") {
      return css`
        color: #475569;
        &:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1e293b;
          transform: translateY(-1px);
        }
      `;
    }
    return css`
      color: #0f766e;
      &:hover:not(:disabled) {
        background: #ccfbf1;
        color: #0d9488;
        transform: translateY(-1px);
      }
    `;
  }}

  &:active:not(:disabled) {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
  }
`;

export const InvEditBtn = ({ title = "Edit", size = 17, ...props }) => (
  <InvActionBtn type="button" variant="edit" $iconOnly title={title} aria-label={title} {...props}>
    <SquarePen size={size} strokeWidth={2} />
  </InvActionBtn>
);

export const InvDeleteBtn = ({ title = "Delete", size = 17, ...props }) => (
  <InvActionBtn type="button" variant="delete" $iconOnly title={title} aria-label={title} {...props}>
    <Trash2 size={size} strokeWidth={2} />
  </InvActionBtn>
);

export const InvHistoryBtn = ({ title = "Purchase History", size = 17, ...props }) => (
  <InvActionBtn type="button" variant="history" $iconOnly title={title} aria-label={title} {...props}>
    <History size={size} strokeWidth={2} />
  </InvActionBtn>
);

export const InvSaveBtn = ({ title = "Save", size = 17, ...props }) => (
  <InvActionBtn type="button" variant="save" $iconOnly title={title} aria-label={title} {...props}>
    <Save size={size} strokeWidth={2} />
  </InvActionBtn>
);

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
  gap: 14px 16px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
`;

export const InvFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
  min-width: 0;
  box-sizing: border-box;
`;

export const InvFormLabel = styled.label`
  font-size: 0.76rem;
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

/* ─── Slide Down Form Panel Components ───────────────────────────────────── */
const slideDownAnim = keyframes`
  from {
    max-height: 0;
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    max-height: 2500px;
    opacity: 1;
    transform: translateY(0);
  }
`;

export const InvSlideFormPanel = styled.div`
  background: #ffffff;
  border-bottom: 2px solid ${InvTheme.primary};
  overflow: hidden;
  animation: ${slideDownAnim} 0.35s ease both;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
`;

export const InvSlideFormHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  border-bottom: 1px solid #99f6e4;
`;

export const InvSlideFormTitle = styled.div`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${InvTheme.primaryDark};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const InvSlideFormCloseBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #99f6e4;
  background: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  &:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
  }
`;

export const InvSlideFormBody = styled.div`
  padding: 18px 22px;
`;

export const InvSlideFormFooter = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 22px 16px;
  background: #f8fafc;
  border-top: 1px solid ${InvTheme.border};
`;

/* ─── Unified Dropdown Primitives (Admission / PO standard) ─────────────── */
export const InvDropBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  line-height: 1;
  color: #64748b;
  transition: all 0.15s ease;
  &:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }
`;

export const InvDropMenu = styled.div`
  position: fixed;
  ${p => p.placement === "top" ? `bottom: ${p.bottom}px;` : `top: ${p.top}px;`}
  left: ${p => p.left}px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.16);
  z-index: 9999;
  min-width: 190px;
  max-height: ${p => p.maxHeight || 280}px;
  overflow-y: auto;
  overflow-x: hidden;
  animation: ${fadeIn} 0.14s ease;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

export const InvMenuItem = styled.button`
  width: 100%;
  padding: 9px 14px;
  text-align: left;
  font-size: 0.78rem;
  font-weight: 500;
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${p => p.disabled ? '#94a3b8' : p.danger ? '#dc2626' : p.$mail ? '#7c3aed' : p.$success ? '#166534' : '#334155'};
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.12s, color 0.12s;
  &:hover:not(:disabled), &:focus:not(:disabled) {
    background: ${p => p.danger ? '#fff1f2' : p.$mail ? '#f5f3ff' : p.$success ? '#f0fdf4' : '#f0fdfa'};
    color: ${p => p.danger ? '#dc2626' : p.$mail ? '#6d28d9' : p.$success ? '#166534' : '#0d9488'};
    box-shadow: inset 3px 0 0 ${p => p.danger ? '#dc2626' : p.$mail ? '#7c3aed' : p.$success ? '#16a34a' : '#0d9488'};
  }
`;

export const InvCodePill = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  background: #f0fdfa;
  color: #0d9488;
  font-weight: 700;
  font-size: 0.78rem;
  font-family: monospace;
  border: 1px solid #ccfbf1;
`;

export const InvStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
  ${p => {
    const s = String(p.status || p.$s || "").toLowerCase();
    if (s.includes("appr") || s.includes("active") || s.includes("restock") || s.includes("done")) {
      return `background: #dcfce7; color: #166534; border: 1px solid #86efac; &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #16a34a; }`;
    }
    if (s.includes("rej") || s.includes("canc") || s.includes("fail") || s.includes("expired") || s.includes("inactive")) {
      return `background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #dc2626; }`;
    }
    if (s.includes("veri") || s.includes("po") || s.includes("init")) {
      return `background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #2563eb; }`;
    }
    return `background: #fef9c3; color: #92400e; border: 1px solid #fde68a; &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #d97706; }`;
  }}
`;

export const useInvDropMenu = () => {
  const [openId, setOpenId] = React.useState(null);
  const [menuPos, setMenuPos] = React.useState({ top: 0, bottom: 0, left: 0, placement: "bottom" });

  const openMenu = React.useCallback((e, id) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (openId === id) {
      setOpenId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement = spaceBelow < 220 ? "top" : "bottom";
    setMenuPos({
      top: rect.bottom + 4,
      bottom: window.innerHeight - rect.top + 4,
      left: Math.max(10, rect.right - 200),
      placement,
    });
    setOpenId(id);
  }, [openId]);

  const closeMenu = React.useCallback(() => {
    setOpenId(null);
  }, []);

  React.useEffect(() => {
    if (!openId) return;
    const handleClose = () => setOpenId(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [openId]);

  return { openId, menuPos, openMenu, closeMenu };
};



