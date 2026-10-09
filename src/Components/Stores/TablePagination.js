import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { colors } from '../GlobalStyles';

// ─── Styled Components ──────────────────────────────────────────────────────────
const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px;
  flex-wrap: wrap;
  gap: 14px;
  background: #ffffff;
  border-top: 1px solid ${colors?.border || '#e2e8f0'};
  border-radius: 0 0 12px 12px;
  margin-top: -1px;
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: ${colors?.textMuted || '#64748b'};
  flex-wrap: wrap;

  strong {
    color: ${colors?.textMain || '#1e293b'};
    font-weight: 700;
  }
`;

const PageSizeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
`;

const PageSizeSelect = styled.select`
  height: 32px;
  padding: 0 10px;
  border: 1px solid ${colors?.border || '#cbd5e1'};
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  background: #f8fafc;
  color: ${colors?.textMain || '#1e293b'};
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$themeColor || colors?.primary || '#0d9488'};
    background: #ffffff;
  }

  &:focus {
    border-color: ${props => props.$themeColor || colors?.primary || '#0d9488'};
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PageBtn = styled.button`
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.$active ? (props.$themeColor || colors?.primary || '#0d9488') : (colors?.border || '#e2e8f0')};
  border-radius: 6px;
  background: ${props => props.$active ? (props.$themeColor || colors?.primary || '#0d9488') : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : (colors?.textMain || '#334155')};
  font-size: 0.82rem;
  font-weight: ${props => props.$active ? 700 : 500};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.35 : 1};
  transition: all 0.15s ease;
  user-select: none;
  box-shadow: ${props => props.$active ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'};

  &:hover:not(:disabled) {
    background: ${props => props.$active ? (props.$themeColor || colors?.primary || '#0d9488') : '#f1f5f9'};
    border-color: ${props => props.$themeColor || colors?.primary || '#0d9488'};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const EllipsisSpan = styled.span`
  min-width: 28px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 700;
  user-select: none;
`;

// ─── Custom Hook ───────────────────────────────────────────────────────────────
export const usePagination = (data = [], defaultPageSize = 15) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize]);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure valid current page
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (validCurrentPage - 1) * pageSize;
  const pageData = useMemo(() => {
    return data.slice(startIdx, startIdx + pageSize);
  }, [data, startIdx, pageSize]);

  const goTo = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(Number(size));
    setCurrentPage(1);
  };

  return {
    currentPage: validCurrentPage,
    pageSize,
    totalPages,
    pageData,
    goTo,
    handlePageSizeChange,
    startIdx,
    totalItems
  };
};

// ─── Pagination Component ──────────────────────────────────────────────────────
export const TablePagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 15,
  totalItems = 0,
  startIdx = 0,
  goTo = () => {},
  onPageSizeChange = () => {},
  pageSizeOptions = [10, 15, 25, 50, 100],
  itemName = 'record',
  themeColor = '#0d9488',
  className = ''
}) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const endIdx = Math.min(startIdx + pageSize, totalItems);

  return (
    <PaginationWrapper className={`no-print ${className}`}>
      <PaginationInfo>
        <span>
          Showing <strong>{totalItems === 0 ? 0 : startIdx + 1}–{endIdx}</strong> of{' '}
          <strong>{totalItems.toLocaleString()}</strong> {itemName}{totalItems === 1 ? '' : 's'}
        </span>
        <PageSizeWrapper>
          <span>Rows per page:</span>
          <PageSizeSelect
            $themeColor={themeColor}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </PageSizeSelect>
        </PageSizeWrapper>
      </PaginationInfo>

      <PaginationControls>
        <PageBtn
          $themeColor={themeColor}
          onClick={() => goTo(1)}
          disabled={currentPage === 1}
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </PageBtn>
        <PageBtn
          $themeColor={themeColor}
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </PageBtn>

        {getPageNumbers().map((p, idx) =>
          p === '...' ? (
            <EllipsisSpan key={`ellipsis-${idx}`}>…</EllipsisSpan>
          ) : (
            <PageBtn
              key={p}
              $themeColor={themeColor}
              $active={p === currentPage}
              onClick={() => goTo(p)}
            >
              {p}
            </PageBtn>
          )
        )}

        <PageBtn
          $themeColor={themeColor}
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </PageBtn>
        <PageBtn
          $themeColor={themeColor}
          onClick={() => goTo(totalPages)}
          disabled={currentPage >= totalPages}
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </PageBtn>
      </PaginationControls>
    </PaginationWrapper>
  );
};

export default TablePagination;
