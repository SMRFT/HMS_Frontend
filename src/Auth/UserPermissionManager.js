import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import { fetchUserPermissions, updateUserPermissions, fetchAllEmployees, fetchSidebarMapping } from './apiRequest';
import { PAGE_PERMISSIONS } from './FrontendPageMapping';
import { FiSave, FiSearch, FiCheck, FiShield, FiCopy, FiX, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  background: #f8fafc;
  height: calc(100vh - 64px);
  overflow: hidden;
  padding: 20px 32px;
  font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: 900px) {
    padding: 16px;
    height: auto;
    overflow: auto;
  }
`;

const TopBanner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;

  .title-group {
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 0.88rem;
      color: #64748b;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .btn-discard {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-size: 0.88rem;
      font-weight: 700;
      padding: 9px 18px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover { background: #f8fafc; }
    }

    .btn-copy {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid #0d9488;
      color: #0d9488;
      font-size: 0.88rem;
      font-weight: 700;
      padding: 9px 18px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

      &:hover {
        background: #f0fdf4;
      }
    }

    .btn-save {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #0d9488;
      color: #ffffff;
      border: none;
      font-size: 0.88rem;
      font-weight: 700;
      padding: 9px 24px;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
      transition: all 0.2s ease;

      &:hover {
        background: #0f766e;
      }
    }
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// ── Left Panel: Employees List ──
const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 160px);
  overflow: hidden;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 16px;
  }

  input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    font-size: 0.85rem;
    color: #0f172a;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }
  }
`;

const DeptChipsRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const Chip = styled.button`
  background: ${props => props.$active ? '#0d9488' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#475569'};
  border: ${props => props.$active ? 'none' : '1px solid #e2e8f0'};
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#0d9488' : '#f1f5f9'};
  }
`;

const EmployeeCardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const EmployeeCard = styled.div`
  background: ${props => props.$active ? '#0d9488' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#0f172a'};
  border: ${props => props.$active ? 'none' : '1px solid #f1f5f9'};
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? '0 8px 20px rgba(13, 148, 136, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.04)'};

  &:hover {
    transform: translateY(-1px);
    border-color: #0d9488;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0'};
    color: ${props => props.$active ? '#ffffff' : '#475569'};
    font-weight: 800;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .emp-info {
    flex: 1;
    min-width: 0;

    .name-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;

      h4 {
        font-size: 0.92rem;
        font-weight: 700;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .badge-id {
        font-size: 0.7rem;
        font-weight: 600;
        background: ${props => props.$active ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9'};
        color: ${props => props.$active ? '#ffffff' : '#64748b'};
        padding: 2px 6px;
        border-radius: 6px;
      }
    }

    .meta {
      font-size: 0.75rem;
      color: ${props => props.$active ? 'rgba(255, 255, 255, 0.85)' : '#64748b'};
      margin-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pages-count {
      font-size: 0.72rem;
      font-weight: 600;
      color: ${props => props.$active ? 'rgba(255, 255, 255, 0.9)' : '#0d9488'};
    }
  }

  .check-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    flex-shrink: 0;
  }
`;

// ── Right Panel: Permissions Management ──
const RightPanel = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  height: calc(100vh - 210px);
  overflow: hidden;
`;

const PermissionsScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
  }
`;

const SelectedEmpHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;

  .emp-title {
    h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    span {
      font-size: 0.82rem;
      color: #64748b;
    }
  }

  .controls-group {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
`;

const StatusPillGroup = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 10px;

  button {
    border: none;
    background: transparent;
    padding: 6px 12px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #64748b;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    }
  }
`;

const SmallSearchInput = styled.div`
  position: relative;
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 14px;
  }
  input {
    padding: 6px 12px 6px 32px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    font-size: 0.8rem;
    width: 180px;
    &:focus {
      outline: none;
      border-color: #0d9488;
    }
  }
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .cat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 8px;

    .cat-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .cat-actions {
      display: flex;
      gap: 12px;
      span {
        font-size: 0.78rem;
        font-weight: 700;
        color: #0d9488;
        cursor: pointer;
        &:hover { text-decoration: underline; }
        &.clear { color: #94a3b8; }
      }
    }
  }
`;

const PermCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const PermCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;

    .info {
      h5 {
        font-size: 0.92rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 2px 0;
      }
      .route {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    }
  }

  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: #cbd5e1;
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: #0d9488;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
`;

const SubActionPill = styled.button`
  border: ${props => props.$active ? 'none' : '1px solid #cbd5e1'};
  background: ${props => props.$active ? '#0d9488' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#64748b'};
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.$active ? '#0d9488' : '#f1f5f9'};
  }
`;

// ── Bottom Fixed Action Footer ──
const StickyFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 14px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);

  .status-text {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
  }

  .btns {
    display: flex;
    gap: 12px;

    .btn-discard {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 9px 20px;
      border-radius: 10px;
      cursor: pointer;
      &:hover { background: #f8fafc; }
    }

    .btn-save {
      background: #0d9488;
      color: #ffffff;
      border: none;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 9px 24px;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
      &:hover { background: #0f766e; }
    }
  }
`;

// ── Copy Permissions Modal Component ──
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalCard = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  padding: 24px;
  position: relative;
  animation: ${fadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`;

const ModalCloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
`;

// MAIN COMPONENT
const UserPermissionManager = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  const [permissions, setPermissions] = useState([]);
  const [selectedSubPerms, setSelectedSubPerms] = useState({});
  const [legacyPermissions, setLegacyPermissions] = useState({});
  const [empPermissionsMap, setEmpPermissionsMap] = useState({});
  const [pageSearchTerm, setPageSearchTerm] = useState("");
  const [pageStatusFilter, setPageStatusFilter] = useState("all");
  const [sidebarData, setSidebarData] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Copy Permissions Modal state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceEmpId, setCopySourceEmpId] = useState(null);
  const [copyTargetEmpIds, setCopyTargetEmpIds] = useState([]);

  useEffect(() => {
    const init = async () => {
      setIsLoadingList(true);
      try {
        const [empData, sidebar] = await Promise.all([
          fetchAllEmployees(),
          fetchSidebarMapping()
        ]);
        setEmployees(empData || []);
        setSidebarData(sidebar || []);

        const initialMap = {};
        (empData || []).forEach(emp => {
          let count = 0;
          if (Array.isArray(emp.hms_pages) && emp.hms_pages.length > 0) {
            count = emp.hms_pages.length;
          } else if (emp.allowed_pages) {
            if (Array.isArray(emp.allowed_pages)) {
              count = emp.allowed_pages.length;
            } else if (typeof emp.allowed_pages === 'object') {
              count = Object.keys(emp.allowed_pages).length;
            }
          }
          initialMap[emp.employeeId] = count;
        });
        setEmpPermissionsMap(initialMap);

        if (empData && empData.length > 0) {
          setSelectedEmpId(empData[0].employeeId);
        }
      } catch (e) {
        toast.error("Failed to load initial data");
      } finally {
        setIsLoadingList(false);
      }
    };
    init();
  }, []);

  const departmentList = useMemo(() => {
    const set = new Set(["All"]);
    (employees || []).forEach(emp => {
      if (emp?.department) set.add(emp.department);
    });
    return Array.from(set);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return (employees || []).filter(emp => {
      if (!emp) return false;
      const name = (emp.employeeName || "").toLowerCase();
      const id = String(emp.employeeId || "").toLowerCase();
      const term = (searchTerm || "").toLowerCase();
      const matchesSearch = !term || name.includes(term) || id.includes(term);
      const matchesDept = selectedDept === "All" || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDept]);

  const selectedEmployeeObj = useMemo(() => {
    return (employees || []).find(e => e?.employeeId === selectedEmpId) || null;
  }, [employees, selectedEmpId]);

  useEffect(() => {
    if (!selectedEmpId || sidebarData.length === 0) {
      setPermissions([]);
      setSelectedSubPerms({});
      return;
    }

    const loadPerms = async () => {
      setIsLoadingPerms(true);
      try {
        const response = await fetchUserPermissions(selectedEmpId);

        if (response) {
          const sub = {};
          const managedStrings = new Set();
          let allIncomingMapping = {};

          if (response.allowed_pages && typeof response.allowed_pages === 'object' && !Array.isArray(response.allowed_pages)) {
            allIncomingMapping = { ...response.allowed_pages };
          } else if (Array.isArray(response.allowed_pages)) {
            response.allowed_pages.forEach(s => {
              allIncomingMapping[String(s).trim()] = String(s).trim();
            });
          }

          const incomingHmsPages = new Set((response.hms_pages || []).map(id => Number(id)));
          const allIncomingValues = new Set(Object.values(allIncomingMapping).map(v => String(v).trim()));
          const allIncomingKeys = new Set(Object.keys(allIncomingMapping).map(k => String(k).trim()));

          const activePageIds = new Set();

          sidebarData.forEach(group => {
            (group.pages || []).forEach(page => {
              const pMap = page.permissions || {};
              const pId = Number(page.page_id);
              const pRoute = String(page.route || '').trim();

              Object.values(pMap).forEach(v => managedStrings.add(String(v).trim()));

              let isPageActive = false;

              // Match by HMS page ID
              if (incomingHmsPages.has(pId)) {
                isPageActive = true;
              }

              // Match by route
              if (pRoute && (allIncomingKeys.has(pRoute) || allIncomingValues.has(pRoute))) {
                isPageActive = true;
              }

              // Match sub-permissions
              const activeKeys = [];
              if (typeof pMap === 'object' && !Array.isArray(pMap)) {
                Object.entries(pMap).forEach(([k, v]) => {
                  const normV = String(v).trim();
                  if (allIncomingKeys.has(k) || allIncomingValues.has(normV) || incomingHmsPages.has(pId)) {
                    activeKeys.push(k);
                    isPageActive = true;
                  }
                });
              }

              if (isPageActive) {
                activePageIds.add(pId);
                sub[pId] = activeKeys.length > 0 ? activeKeys : (typeof pMap === 'object' ? Object.keys(pMap) : []);
              }
            });
          });

          const legacy = {};
          Object.entries(allIncomingMapping).forEach(([k, v]) => {
            if (!managedStrings.has(String(v).trim()) && !allIncomingKeys.has(k)) {
              legacy[k] = v;
            }
          });

          setPermissions(Array.from(activePageIds));
          setSelectedSubPerms(sub);
          setLegacyPermissions(legacy);
          setEmpPermissionsMap(prev => ({
            ...prev,
            [selectedEmpId]: activePageIds.size
          }));
        } else {
          setPermissions([]);
          setSelectedSubPerms({});
        }
      } catch (error) {
        toast.error("Failed to load permissions");
      } finally {
        setIsLoadingPerms(false);
      }
    };

    loadPerms();
  }, [selectedEmpId, sidebarData]);

  const togglePagePermission = (pageId) => {
    if (pageId == null) return;

    setPermissions(prev => {
      if (prev.includes(pageId)) {
        setSelectedSubPerms(s => {
          const next = { ...s };
          delete next[pageId];
          return next;
        });
        return prev.filter(p => p !== pageId);
      }

      const pageInfo = sidebarData.flatMap(g => g.pages || []).find(p => p.page_id === pageId);
      if (pageInfo && pageInfo.permissions && typeof pageInfo.permissions === 'object') {
        setSelectedSubPerms(s => ({
          ...s,
          [pageId]: Object.keys(pageInfo.permissions)
        }));
      }

      return [...prev, pageId];
    });
  };

  const toggleSubPermission = (pageId, subKey) => {
    setSelectedSubPerms(prev => {
      const current = prev[pageId] || [];
      const next = current.includes(subKey)
        ? current.filter(k => k !== subKey)
        : [...current, subKey];
      return { ...prev, [pageId]: next };
    });
  };

  const enableAllCategoryPages = (categoryPages) => {
    const newPageIds = new Set(permissions);
    const newSubPerms = { ...selectedSubPerms };

    (categoryPages || []).forEach(p => {
      if (!p) return;
      newPageIds.add(p.page_id);
      if (p.permissions && typeof p.permissions === 'object') {
        newSubPerms[p.page_id] = Object.keys(p.permissions);
      }
    });

    setPermissions(Array.from(newPageIds));
    setSelectedSubPerms(newSubPerms);
  };

  const clearCategoryPages = (categoryPages) => {
    const idsToRemove = new Set((categoryPages || []).map(p => p?.page_id).filter(id => id != null));
    setPermissions(prev => prev.filter(id => !idsToRemove.has(id)));
    setSelectedSubPerms(prev => {
      const next = { ...prev };
      idsToRemove.forEach(id => delete next[id]);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedEmpId) return;

    setIsSaving(true);
    const activePageIds = permissions;
    const allowedPagesObj = { ...legacyPermissions };
    const hmsOutlets = new Set();

    if (sidebarData && sidebarData.length > 0) {
      sidebarData.forEach(group => {
        (group.pages || []).forEach(page => {
          if (page.page_id != null && activePageIds.includes(page.page_id)) {
            if (page.outlet_code) hmsOutlets.add(page.outlet_code);

            if (page.permissions && typeof page.permissions === 'object' && !Array.isArray(page.permissions)) {
              const activeKeys = selectedSubPerms[page.page_id] || [];
              activeKeys.forEach(k => {
                if (page.permissions[k]) {
                  allowedPagesObj[k] = page.permissions[k];
                }
              });
            } else {
              const permsArr = Array.isArray(page.permissions) ? page.permissions : [PAGE_PERMISSIONS[page.route] || page.route];
              permsArr.forEach(p => {
                allowedPagesObj[String(p)] = p;
              });
            }
          }
        });
      });
    }

    try {
      const result = await updateUserPermissions(selectedEmpId, allowedPagesObj, activePageIds, Array.from(hmsOutlets));
      if (result.success || result.message) {
        toast.success("Permissions saved successfully!");
        setEmpPermissionsMap(prev => ({
          ...prev,
          [selectedEmpId]: activePageIds.length
        }));
      } else {
        toast.error(result.error || "Save failed");
      }
    } catch (error) {
      toast.error("Error saving permissions");
    } finally {
      setIsSaving(false);
    }
  };

  const groupedPermissions = useMemo(() => {
    const groups = {};
    if (!sidebarData || !Array.isArray(sidebarData) || sidebarData.length === 0) return groups;

    sidebarData.forEach(group => {
      if (!group) return;
      const category = (group.group || group.category || "General").trim();
      if (!groups[category]) groups[category] = [];

      (group.pages || []).forEach(page => {
        if (!page) return;
        if (!groups[category].some(p => p.page_id === page.page_id)) {
          groups[category].push({
            pageName: page.name,
            route: page.route,
            page_id: page.page_id,
            permissions: page.permissions
          });
        }
      });
    });
    return groups;
  }, [sidebarData]);

  const filteredGroupedPermissions = useMemo(() => {
    const term = (pageSearchTerm || "").toLowerCase();
    const groups = {};

    Object.entries(groupedPermissions || {}).forEach(([category, pages]) => {
      const filteredPages = (pages || []).filter(page => {
        if (!page) return false;
        const pageName = page.pageName || "";
        const route = page.route || "";
        const matchesSearch = pageName.toLowerCase().includes(term) || route.toLowerCase().includes(term);
        if (!matchesSearch) return false;

        const isEnabled = (permissions || []).includes(page.page_id);
        if (pageStatusFilter === 'enabled' && !isEnabled) return false;
        if (pageStatusFilter === 'disabled' && isEnabled) return false;

        return true;
      });

      if (filteredPages.length > 0) {
        groups[category] = filteredPages;
      }
    });

    return groups;
  }, [groupedPermissions, pageSearchTerm, pageStatusFilter, permissions]);

  const handleApplyCopyPermissions = async () => {
    if (!copySourceEmpId || copyTargetEmpIds.length === 0) {
      toast.warning("Select source and at least one target employee");
      return;
    }

    try {
      const sourcePermsRes = await fetchUserPermissions(copySourceEmpId);
      if (!sourcePermsRes) return;

      for (const targetId of copyTargetEmpIds) {
        await updateUserPermissions(
          targetId,
          sourcePermsRes.allowed_pages || {},
          sourcePermsRes.hms_pages || [],
          sourcePermsRes.hms_outlets || []
        );
      }

      toast.success(`Copied permissions to ${copyTargetEmpIds.length} employee(s)!`);
      setShowCopyModal(false);
      if (selectedEmpId && copyTargetEmpIds.includes(selectedEmpId)) {
        window.location.reload();
      }
    } catch (e) {
      toast.error("Failed to copy permissions");
    }
  };

  const totalPagesCount = useMemo(() => {
    return Object.values(groupedPermissions).reduce((acc, list) => acc + list.length, 0);
  }, [groupedPermissions]);

  const activePagesCount = permissions.length;

  const getEmpPageCount = (emp) => {
    if (emp.employeeId === selectedEmpId) {
      return permissions.length;
    }
    if (empPermissionsMap[emp.employeeId] !== undefined) {
      return empPermissionsMap[emp.employeeId];
    }
    if (Array.isArray(emp.hms_pages) && emp.hms_pages.length > 0) {
      return emp.hms_pages.length;
    }
    if (emp.allowed_pages) {
      if (Array.isArray(emp.allowed_pages)) return emp.allowed_pages.length;
      if (typeof emp.allowed_pages === 'object') return Object.keys(emp.allowed_pages).length;
    }
    return 0;
  };

  return (
    <PageWrapper>
      {/* Top Title & Header Actions */}
      <TopBanner>
        <div className="title-group">
          <h1>User permissions</h1>
          <p>Grant page and action access per employee, or copy one person's access to another</p>
        </div>
        <div className="header-actions">
          <button className="btn-discard" onClick={() => window.location.reload()}>
            Discard
          </button>
          <button className="btn-copy" onClick={() => { setCopySourceEmpId(selectedEmpId); setShowCopyModal(true); }}>
            <FiCopy /> Copy permissions
          </button>
          <button className="btn-save" onClick={handleSave} disabled={isSaving}>
            <FiSave /> {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </TopBanner>

      <MainLayout>
        {/* Left Side: Employees Directory */}
        <LeftPanel>
          <SearchInputWrapper>
            <FiSearch />
            <input
              placeholder="Search employee or ID"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </SearchInputWrapper>

          <EmployeeCardsList>
            {isLoadingList ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading employees...</div>
            ) : filteredEmployees.map(emp => {
              const isActive = selectedEmpId === emp.employeeId;
              return (
                <EmployeeCard
                  key={emp.employeeId}
                  $active={isActive}
                  onClick={() => setSelectedEmpId(emp.employeeId)}
                >
                  <div className="avatar">
                    {(emp.employeeName || "E").charAt(0).toUpperCase()}
                  </div>
                  <div className="emp-info">
                    <div className="name-row">
                      <h4>{emp.employeeName}</h4>
                      <span className="badge-id">#{emp.employeeId}</span>
                    </div>
                    <div className="meta">
                      {[emp.department, emp.designation].filter(Boolean).join(' · ') || "Staff"}
                    </div>
                    <div className="pages-count">
                      {getEmpPageCount(emp)} of {totalPagesCount} pages
                    </div>
                  </div>
                  {isActive && (
                    <div className="check-icon">
                      <FiCheck size={14} />
                    </div>
                  )}
                </EmployeeCard>
              );
            })}
          </EmployeeCardsList>
        </LeftPanel>

        {/* Right Side: Permissions Card Grid */}
        <RightPanel>
          <SelectedEmpHeader>
            <div className="emp-title">
              <h3>{selectedEmployeeObj?.employeeName || "Select Employee"}</h3>
              <span>
                ID {selectedEmployeeObj?.employeeId || "-"} · {[selectedEmployeeObj?.department, selectedEmployeeObj?.designation].filter(Boolean).join(' · ') || "Staff"}
              </span>
            </div>

            <div className="controls-group">
              <StatusPillGroup>
                <button
                  className={pageStatusFilter === 'all' ? 'active' : ''}
                  onClick={() => setPageStatusFilter('all')}
                >
                  All {totalPagesCount}
                </button>
                <button
                  className={pageStatusFilter === 'enabled' ? 'active' : ''}
                  onClick={() => setPageStatusFilter('enabled')}
                >
                  Enabled {activePagesCount}
                </button>
                <button
                  className={pageStatusFilter === 'disabled' ? 'active' : ''}
                  onClick={() => setPageStatusFilter('disabled')}
                >
                  Disabled {totalPagesCount - activePagesCount}
                </button>
              </StatusPillGroup>

              <SmallSearchInput>
                <FiSearch />
                <input
                  placeholder="Search permission"
                  value={pageSearchTerm}
                  onChange={e => setPageSearchTerm(e.target.value)}
                />
              </SmallSearchInput>
            </div>
          </SelectedEmpHeader>

          <PermissionsScrollArea>
            {isLoadingPerms ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading permissions...</div>
            ) : Object.keys(filteredGroupedPermissions).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No permissions found for current filter.</div>
            ) : (
              Object.entries(filteredGroupedPermissions).map(([category, pages]) => (
                <CategorySection key={category}>
                  <div className="cat-header">
                    <div className="cat-title">{category}</div>
                    <div className="cat-actions">
                      <span onClick={() => enableAllCategoryPages(pages)}>Enable all</span>
                      <span className="clear" onClick={() => clearCategoryPages(pages)}>Clear</span>
                    </div>
                  </div>

                  <PermCardsGrid>
                    {pages.map(page => {
                      const isChecked = permissions.includes(page.page_id);
                      const subKeys = (page.permissions && typeof page.permissions === 'object')
                        ? Object.keys(page.permissions)
                        : [];
                      const activeSubKeys = selectedSubPerms[page.page_id] || [];

                      return (
                        <PermCard key={page.page_id}>
                          <div className="card-top">
                            <div className="info">
                              <h5>{page.pageName}</h5>
                              <div className="route">{page.route}</div>
                            </div>

                            <ToggleSwitch>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePagePermission(page.page_id)}
                              />
                              <span className="slider" />
                            </ToggleSwitch>
                          </div>

                          {isChecked && subKeys.length > 0 && (
                            <div className="actions-row">
                              {subKeys.map(k => {
                                const isSubActive = activeSubKeys.includes(k);
                                return (
                                  <SubActionPill
                                    key={k}
                                    $active={isSubActive}
                                    onClick={() => toggleSubPermission(page.page_id, k)}
                                  >
                                    {k.charAt(0).toUpperCase() + k.slice(1).toLowerCase()}
                                  </SubActionPill>
                                );
                              })}
                            </div>
                          )}
                        </PermCard>
                      );
                    })}
                  </PermCardsGrid>
                </CategorySection>
              ))
            )}
          </PermissionsScrollArea>
        </RightPanel>
      </MainLayout>

      {/* Copy Permissions Modal (Screenshot 2) */}
      {showCopyModal && (
        <ModalOverlay onClick={() => setShowCopyModal(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalCloseBtn onClick={() => setShowCopyModal(false)}>
              <FiX size={16} />
            </ModalCloseBtn>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>Copy permissions</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px 0' }}>Take one employee's access and apply it to others</p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '8px' }}>COPY FROM</div>
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {employees.map(emp => {
                  const isSrc = copySourceEmpId === emp.employeeId;
                  return (
                    <div
                      key={emp.employeeId}
                      onClick={() => setCopySourceEmpId(emp.employeeId)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: isSrc ? '2px solid #0d9488' : '1px solid #e2e8f0',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{emp.employeeName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{[emp.department, emp.designation].filter(Boolean).join(' · ')}</div>
                      </div>
                      {isSrc && <FiCheckCircle color="#0d9488" size={18} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.5px' }}>COPY TO</span>
                <span
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', cursor: 'pointer' }}
                  onClick={() => setCopyTargetEmpIds(employees.filter(e => e.employeeId !== copySourceEmpId).map(e => e.employeeId))}
                >
                  Select all
                </span>
              </div>
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {employees.filter(e => e.employeeId !== copySourceEmpId).map(emp => {
                  const isTarget = copyTargetEmpIds.includes(emp.employeeId);
                  return (
                    <div
                      key={emp.employeeId}
                      onClick={() => {
                        setCopyTargetEmpIds(prev =>
                          prev.includes(emp.employeeId)
                            ? prev.filter(id => id !== emp.employeeId)
                            : [...prev, emp.employeeId]
                        );
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: isTarget ? '1px solid #0d9488' : '1px solid #e2e8f0',
                        background: isTarget ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{emp.employeeName}</span>
                      <input type="checkbox" checked={isTarget} readOnly style={{ accentColor: '#0d9488' }} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCopyModal(false)}
                style={{ padding: '8px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCopyPermissions}
                style={{ padding: '8px 24px', borderRadius: '10px', border: 'none', background: '#0d9488', fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}
              >
                Apply
              </button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default UserPermissionManager;
