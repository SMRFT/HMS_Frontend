import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import { fetchUserPermissions, updateUserPermissions, fetchAllEmployees, fetchSidebarMapping } from './apiRequest';
import { PAGE_PERMISSIONS } from './FrontendPageMapping';
import { FiSave, FiSearch, FiUser, FiCheck, FiShield, FiLock, FiSettings, FiActivity } from 'react-icons/fi';

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(13, 148, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
`;

// --- Styled Components ---

const PageContainer = styled.div`
  padding: 24px 32px;
  background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

  @media (max-width: 768px) {
    padding: 16px;
    height: auto;
    min-height: calc(100vh - 64px);
    overflow: auto;
  }
`;

const Container = styled.div`
  padding: 32px 40px;
  background: #f8fafc;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  font-family: 'Outfit', 'Inter', sans-serif;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -200px;
    left: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 16px;
    height: auto;
    min-height: calc(100vh - 64px);
    overflow: auto;
  }
`;

const HeaderContainer = styled.div`
  margin-bottom: 24px; /* Reduced from 32 to free up space */
  flex-shrink: 0; /* Prevents header from shrinking and crushing */
  display: flex;
  align-items: center;
  gap: 16px;
  animation: ${fadeInUp} 0.4s ease-out;
  
  h2 {
    color: #0f172a;
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    color: #0d9488;

    @media (max-width: 768px) {
      width: 40px;
      height: 40px;
      svg { width: 20px; height: 20px; }
    }
  }
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0; /* Extremely important flexbox fix for inner scrolling containers */

  @media (max-width: 850px) {
    flex-direction: column;
    min-height: auto;
  }
`;

// --- Left Panel: User List ---

const ListPanel = styled.div`
  width: 380px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideInLeft} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1;

  @media (max-width: 850px) {
    width: 100%;
    min-height: 300px;
    max-height: 400px;
    flex-shrink: 0;
  }
`;

const SearchContainer = styled.div`
  padding: 24px;
  background: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  z-index: 2;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 1.1rem;
    transition: color 0.2s;
  }

  input {
    width: 100%;
    padding: 14px 16px 14px 44px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    font-size: 0.95rem;
    background: #f8fafc;
    transition: all 0.2s ease;
    outline: none;
    color: #334155;
    font-weight: 500;
    
    &::placeholder {
      color: #94a3b8;
      font-weight: 400;
    }
    
    &:focus {
      background: white;
      border-color: #0d9488;
      box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
      
      + svg { color: #0d9488; }
    }
  }
`;

const EmployeeList = styled.div`
  flex: 1;
  padding: 16px 8px 16px 16px; /* Reduced right padding for inline scrollbar breathing room */
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px; /* Increased space between employee list items */

  /* Inline Scrollbar Styling */
  &::-webkit-scrollbar { 
    width: 6px; 
  }
  &::-webkit-scrollbar-track { 
    background: transparent; 
    margin: 8px 0; /* Keeps scrollbar from touching the top/bottom edges */
  }
  &::-webkit-scrollbar-thumb { 
    background: #cbd5e1; 
    border-radius: 10px; 
    &:hover { background: #94a3b8; }
  }
`;

const EmployeeItem = styled.div`
  padding: 16px 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  background: ${props => props.active ? 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)' : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid ${props => props.active ? 'transparent' : 'rgba(255, 255, 255, 0.8)'};
  box-shadow: ${props => props.active ? '0 10px 24px rgba(13, 148, 136, 0.3)' : '0 2px 8px rgba(0,0,0,0.02)'};
  margin-right: 8px; /* Extra space to prevent inline scrollbar overlap */
  color: ${props => props.active ? 'white' : 'inherit'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)' : 'rgba(255, 255, 255, 0.9)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.active ? '0 12px 28px rgba(13, 148, 136, 0.35)' : '0 6px 16px rgba(0,0,0,0.04)'};
    animation: ${props => props.active ? pulseGlow : 'none'} 2s infinite;
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.active ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'};
  color: ${props => props.active ? 'white' : '#475569'};
  border: 1px solid ${props => props.active ? 'rgba(255,255,255,0.3)' : 'transparent'};
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: ${props => props.active ? '0 4px 10px rgba(0, 0, 0, 0.1)' : 'inset 0 2px 4px rgba(255,255,255,0.5)'};
  transition: all 0.3s ease;
`;

const EmpInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  .emp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
    gap: 8px;
  }
  
  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
    color: ${props => props.active ? 'white' : '#0f172a'};
  }
  
  .emp-id {
    font-size: 0.75rem;
    color: ${props => props.active ? '#0f766e' : '#64748b'};
    font-weight: 700;
    background: ${props => props.active ? 'rgba(255, 255, 255, 0.9)' : '#f1f5f9'};
    padding: 3px 8px;
    border-radius: 8px;
    white-space: nowrap;
    box-shadow: ${props => props.active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'};
  }
  
  .emp-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    line-height: 1.3;
  }
  
  .dept {
    color: ${props => props.active ? 'rgba(255, 255, 255, 0.9)' : '#64748b'};
    font-weight: 500;
  }
  
  .desig {
    color: ${props => props.active ? 'rgba(255, 255, 255, 0.95)' : '#475569'};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: ${props => props.active ? 'rgba(255, 255, 255, 0.6)' : '#cbd5e1'};
    }
  }
`;

const GroupBadge = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
`;

// --- Right Panel: Details ---

const DetailPanel = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 850px) {
    width: 100%;
    min-height: 500px;
    flex: none;
  }
`;

const DetailHeader = styled.div`
  padding: 28px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }
`;

const UserHeaderInfo = styled.div`
  h3 {
    margin: 0;
    color: #0f172a;
    font-size: 1.4rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  span {
    color: #64748b;
    font-size: 0.9rem;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;

    strong {
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 6px;
      color: #334155;
    }
  }

  @media (max-width: 768px) {
    h3 {
      font-size: 1.2rem;
    }
  }
`;

const SaveButton = styled.button`
  padding: 12px 24px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);

  &:hover {
    background: #1e293b;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PermissionsContent = styled.div`
  flex: 1;
  padding: 32px;
  background: transparent;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { 
    background: #cbd5e1; 
    border-radius: 10px; 
    border: 1px solid rgba(255,255,255,0.5);
  }
`;

const SectionTitle = styled.h4`
  font-size: 0.85rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 800;
  margin: 36px 0 20px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  
  &:first-child { margin-top: 0; }
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, #e2e8f0 0%, transparent 100%);
  }
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const PermissionCard = styled.div`
  background: ${props => props.active ? 'linear-gradient(135deg, rgba(204, 251, 241, 0.4) 0%, rgba(255, 255, 255, 0.8) 100%)' : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid ${props => props.active ? 'rgba(20, 184, 166, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? '0 12px 24px rgba(20, 184, 166, 0.1)' : '0 4px 16px rgba(0,0,0,0.03)'};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.active ? '0 16px 32px rgba(20, 184, 166, 0.15)' : '0 10px 24px rgba(0,0,0,0.06)'};
    background: ${props => props.active ? 'linear-gradient(135deg, rgba(204, 251, 241, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)' : 'rgba(255, 255, 255, 0.9)'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const SubPermGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const SubToggle = styled.div`
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  background: ${props => props.active ? '#0d9488' : '#f8fafc'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: 1px solid ${props => props.active ? '#0d9488' : '#e2e8f0'};

  &:hover {
    background: ${props => props.active ? '#0f766e' : '#f1f5f9'};
    transform: scale(1.02);
  }
`;

const PermLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.active ? '#f0fdfa' : '#f1f5f9'};
    color: ${props => props.active ? '#0d9488' : '#94a3b8'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    transition: all 0.3s ease;
  }

  .text-box {
    display: flex;
    flex-direction: column;
    
    strong {
      font-size: 0.95rem;
      color: ${props => props.active ? '#0f172a' : '#64748b'};
      font-weight: 700;
      transition: color 0.3s ease;
    }

    span {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 500;
    }
  }
`;

const Switch = styled.div`
  width: 44px;
  height: 24px;
  background: ${props => props.active ? '#0d9488' : '#cbd5e1'};
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::after {
    content: '';
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
    transform: ${props => props.active ? 'translateX(20px)' : 'translateX(0)'};
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  &:hover {
     box-shadow: 0 0 0 4px ${props => props.active ? 'rgba(13, 148, 136, 0.15)' : 'rgba(203, 213, 225, 0.3)'};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  gap: 20px;
  text-align: center;
  
  .icon-wrapper {
    width: 80px;
    height: 80px;
    background: #f1f5f9;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    font-size: 2.5rem;
    margin-bottom: 8px;
  }
  
  h4 {
    margin: 0;
    color: #475569;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    max-width: 250px;
    line-height: 1.5;
  }
`;

const HeaderTools = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  flex: 1;
  margin: 0 24px;
  
  .compact-search {
    max-width: 250px;
    width: 100%;
    
    input {
      padding: 10px 16px 10px 40px;
      font-size: 0.9rem;
      border-radius: 12px;
    }
  }

  @media (max-width: 1100px) {
    flex-direction: column;
    align-items: stretch;
    margin: 12px 0 0 0;
    width: 100%;
    gap: 10px;
    .compact-search {
      max-width: 100%;
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
`;

const FilterBtn = styled.button`
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#0f172a' : '#64748b'};
  font-weight: ${props => props.active ? '700' : '500'};
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'};
  flex: 1;
  text-align: center;
  
  &:hover {
    color: #0f172a;
  }
`;

// --- Loader ---
const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(13, 148, 136, 0.2);
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// --- Main Component ---

const UserPermissionManager = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [selectedEmpName, setSelectedEmpName] = useState("");
  const [selectedEmpRole, setSelectedEmpRole] = useState("");

  const [permissions, setPermissions] = useState([]);
  const [selectedSubPerms, setSelectedSubPerms] = useState({}); // { pageId: ["READ", "WRITE"] }
  const [legacyPermissions, setLegacyPermissions] = useState({}); // { key: val } for perms not mapped to sidebar
  const [roles, setRoles] = useState([]);
  const [pageSearchTerm, setPageSearchTerm] = useState("");
  const [pageStatusFilter, setPageStatusFilter] = useState("all");
  const [sidebarData, setSidebarData] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoadingList(true);
      try {
        const [empData, sidebar] = await Promise.all([
          fetchAllEmployees(),
          fetchSidebarMapping()
        ]);
        setEmployees(empData);
        setSidebarData(sidebar);
      } catch (e) {
        toast.error("Failed to load initial data");
      } finally {
        setIsLoadingList(false);
      }
    };
    init();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const name = emp.employeeName?.toLowerCase() || "";
      const id = emp.employeeId?.toString().toLowerCase() || "";
      const term = searchTerm?.toLowerCase() || "";
      return name.includes(term) || id.includes(term);
    });
  }, [employees, searchTerm]);

  useEffect(() => {
    if (!selectedEmpId) {
      setPermissions([]);
      setRoles([]);
      return;
    }

    const loadPerms = async () => {
      setIsLoadingPerms(true);
      try {
        const response = await fetchUserPermissions(selectedEmpId);

        if (response && response.hms_pages) {
          setPermissions(response.hms_pages);
          setRoles(response.roles || []);

          // Infer sub-permissions and identify legacy strings
          const sub = {};
          const managedStrings = new Set();

          // Normalized mapping of ALL incoming permissions
          let allIncomingMapping = {};
          const isLegacyArray = Array.isArray(response.allowed_pages);

          if (response.allowed_pages && !Array.isArray(response.allowed_pages) && typeof response.allowed_pages === 'object') {
            allIncomingMapping = { ...response.allowed_pages };
          } else if (isLegacyArray) {
            // Convert legacy array to identity mapping
            response.allowed_pages.forEach(s => {
              allIncomingMapping[String(s).trim()] = String(s).trim();
            });
          }

          const allIncomingValues = Object.values(allIncomingMapping).map(v => String(v).trim());
          const discoveredPageIds = new Set((response.hms_pages || []).map(id => Number(id)));

          sidebarData.forEach(group => {
            (group.pages || []).forEach(page => {
              const pMap = page.permissions || {};
              const pId = Number(page.page_id);

              // Track all values that are "managed" by sidebar mapping
              Object.values(pMap).forEach(v => managedStrings.add(String(v).trim()));

              const activeKeys = [];
              Object.entries(pMap).forEach(([k, v]) => {
                const normalizedV = String(v).trim();
                // Check if this specific mapping (or its value) exists in incoming data
                // For modern granular dictionary saves, match strictly by key (k).
                // For legacy arrays, fall back to value check.
                const isActive = isLegacyArray 
                  ? allIncomingValues.includes(normalizedV)
                  : (k in allIncomingMapping);

                if (isActive) {
                  activeKeys.push(k);
                  discoveredPageIds.add(pId);
                }
              });

              if (activeKeys.length > 0) {
                sub[pId] = activeKeys;
              }
            });
          });

          // Legacy perms are items whose VALUES aren't in ANY sidebar page mapping
          const legacy = {};
          Object.entries(allIncomingMapping).forEach(([k, v]) => {
            if (!managedStrings.has(String(v).trim())) {
              legacy[k] = v;
            }
          });

          setPermissions(Array.from(discoveredPageIds));
          setSelectedSubPerms(sub);
          setLegacyPermissions(legacy);

        } else {
          setPermissions([]);
          setSelectedSubPerms({});
          if (response && response.roles) setRoles(response.roles);
        }
      } catch (error) {
        toast.error("Failed to load permissions");
      } finally {
        setIsLoadingPerms(false);
      }
    };

    if (sidebarData.length > 0) {
      loadPerms();
    }
  }, [selectedEmpId, sidebarData]);

  const togglePermission = (pageId, subKey = null) => {
    if (pageId == null) return;

    if (subKey) {
      setSelectedSubPerms(prev => {
        const current = prev[pageId] || [];
        const next = current.includes(subKey)
          ? current.filter(k => k !== subKey)
          : [...current, subKey];
        return { ...prev, [pageId]: next };
      });
      return;
    }

    setPermissions(prev => {
      if (prev.includes(pageId)) {
        // If turning off page, also clear sub-permissions
        setSelectedSubPerms(s => {
          const next = { ...s };
          delete next[pageId];
          return next;
        });
        return prev.filter(p => p !== pageId);
      }

      // If turning on page, enable all its defined sub-permissions by default
      const pageInfo = sidebarData.flatMap(g => g.pages).find(p => p.page_id === pageId);
      if (pageInfo && pageInfo.permissions && typeof pageInfo.permissions === 'object') {
        setSelectedSubPerms(s => ({
          ...s,
          [pageId]: Object.keys(pageInfo.permissions)
        }));
      }

      return [...prev, pageId];
    });
  };

  const handleSave = async () => {
    if (!selectedEmpId) return;

    setIsSaving(true);

    const activePageIds = permissions;
    // Start with legacy permissions to ensure they are preserved as key:value
    const allowedPagesObj = { ...legacyPermissions };
    const hmsOutlets = new Set();

    if (sidebarData && sidebarData.length > 0) {
      sidebarData.forEach(group => {
        (group.pages || []).forEach(page => {
          if (page.page_id != null && activePageIds.includes(page.page_id)) {
            // Collect outlet codes for active pages
            if (page.outlet_code) {
              hmsOutlets.add(page.outlet_code);
            }

            if (page.permissions && typeof page.permissions === 'object' && !Array.isArray(page.permissions)) {
              // Granular: only add key-value pairs for active keys selected in UI
              const activeKeys = selectedSubPerms[page.page_id] || [];
              activeKeys.forEach(k => {
                if (page.permissions[k]) {
                  allowedPagesObj[k] = page.permissions[k];
                }
              });
            } else {
              // Legacy Array or Multi-string: add all as value:value (or key:value if possible)
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
        if (localStorage.getItem("employeeId") === selectedEmpId) {
          toast.info("Applying changes...", { autoClose: 1000 });
          setTimeout(() => window.location.reload(), 1500);
        }
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
    if (!sidebarData || sidebarData.length === 0) return groups;

    sidebarData.forEach(group => {
      const category = (group.group || group.category || "General").trim();
      if (!groups[category]) groups[category] = [];

      group.pages.forEach(page => {
        if (!groups[category].some(p => p.page_id === page.page_id)) {
          groups[category].push({
            pageName: page.name,
            route: page.route,
            page_id: page.page_id,
            permissions: page.permissions, // Pass down to UI
            hasExplicitToken: !!(page.permissions && Object.keys(page.permissions).length > 0)
          });
        }
      });
    });
    return groups;
  }, [sidebarData]);

  const filteredGroupedPermissions = useMemo(() => {
    const term = (pageSearchTerm || "").toLowerCase();
    const groups = {};
    Object.entries(groupedPermissions).forEach(([category, pages]) => {
      const filteredPages = pages.filter(page => {
        const pageName = page.pageName || "";
        const route = page.route || "";
        const matchesSearch = pageName.toLowerCase().includes(term) || route.toLowerCase().includes(term);
        if (!matchesSearch) return false;

        const isEnabled = permissions.includes(page.page_id);
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

  const sortedCategories = Object.keys(filteredGroupedPermissions).sort();

  return (
    <Container>
      <HeaderContainer>
        <div className="icon-wrapper">
          <FiShield size={24} />
        </div>
        <h2>Access Control Center</h2>
      </HeaderContainer>

      <ContentLayout>
        {/* Left Panel: User List */}
        <ListPanel>
          <SearchContainer>
            <SearchInputWrapper>
              <FiSearch />
              <input
                placeholder="Search employees by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInputWrapper>
          </SearchContainer>

          <EmployeeList>
            {isLoadingList ? (
              <EmptyState>
                <Spinner />
                <p>Loading Directory...</p>
              </EmptyState>
            ) : (
              filteredEmployees.map(emp => (
                <EmployeeItem
                  key={emp.employeeId}
                  active={selectedEmpId === emp.employeeId}
                  onClick={() => {
                    setSelectedEmpId(emp.employeeId);
                    setSelectedEmpName(emp.employeeName);
                    setSelectedEmpRole(emp.designation || "Staff");
                  }}
                >
                  <Avatar active={selectedEmpId === emp.employeeId}>
                    {emp.employeeName?.charAt(0) || "?"}
                  </Avatar>
                  <EmpInfo active={selectedEmpId === emp.employeeId}>
                    <div className="emp-header">
                      <h4>{emp.employeeName}</h4>
                      {emp.employeeId && <span className="emp-id">#{emp.employeeId}</span>}
                    </div>
                    <div className="emp-meta">
                      {emp.department && <span className="dept">{emp.department}</span>}
                      {emp.designation && <span className="desig">{emp.designation}</span>}
                    </div>
                  </EmpInfo>
                  {selectedEmpId === emp.employeeId && <FiCheck color="#0d9488" size={18} />}
                </EmployeeItem>
              ))
            )}
            {!isLoadingList && filteredEmployees.length === 0 && (
              <EmptyState>
                <div className="icon-wrapper" style={{ background: 'transparent', height: 40 }}><FiSearch /></div>
                <h4>No users found</h4>
              </EmptyState>
            )}
          </EmployeeList>
        </ListPanel>

        {/* Right Panel: Permissions Details */}
        <DetailPanel>
          {selectedEmpId ? (
            <>
              <DetailHeader>
                <UserHeaderInfo style={{ flexShrink: 0 }}>
                  <h3>{selectedEmpName}</h3>
                  <span>
                    ID: <strong>{selectedEmpId}</strong>
                  </span>
                </UserHeaderInfo>

                {!isLoadingPerms && (
                  <HeaderTools>
                    <SearchInputWrapper className="compact-search">
                      <FiSearch />
                      <input
                        placeholder="Find pages or routes..."
                        value={pageSearchTerm}
                        onChange={(e) => setPageSearchTerm(e.target.value)}
                      />
                    </SearchInputWrapper>
                    <FilterGroup>
                      <FilterBtn active={pageStatusFilter === 'all'} onClick={() => setPageStatusFilter('all')}>All</FilterBtn>
                      <FilterBtn active={pageStatusFilter === 'enabled'} onClick={() => setPageStatusFilter('enabled')}>Enabled</FilterBtn>
                      <FilterBtn active={pageStatusFilter === 'disabled'} onClick={() => setPageStatusFilter('disabled')}>Disabled</FilterBtn>
                    </FilterGroup>
                  </HeaderTools>
                )}

                <SaveButton onClick={handleSave} disabled={isSaving || isLoadingPerms} style={{ flexShrink: 0 }}>
                  {isSaving ? <Spinner style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }} /> : <FiSave size={18} />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </SaveButton>
              </DetailHeader>

              <PermissionsContent>
                {isLoadingPerms ? (
                  <EmptyState>
                    <Spinner />
                    <p>Fetching assigned policies...</p>
                  </EmptyState>
                ) : (
                  <>

                    {sortedCategories.length === 0 ? (
                      <EmptyState>
                        <div className="icon-wrapper" style={{ background: 'transparent', height: 40 }}><FiSearch /></div>
                        <h4>No pages found</h4>
                      </EmptyState>
                    ) : (
                      sortedCategories.map(category => (
                        <div key={category} style={{ marginBottom: '32px' }}>
                          <SectionTitle>{category}</SectionTitle>
                          <PermissionsGrid>
                            {filteredGroupedPermissions[category].map(({ pageName, page_id, permissions: permissionsData, route }) => {
                              const isActive = permissions.includes(page_id);
                              const subPermEntries = Object.keys(permissionsData || {});

                              return (
                                <PermissionCard
                                  key={`${pageName}-${page_id}`}
                                  active={isActive}
                                >
                                  <CardHeader>
                                    <PermLabel active={isActive}>
                                      <div className="icon-box">
                                        <FiActivity />
                                      </div>
                                      <div className="text-box">
                                        <strong>{pageName}</strong>
                                        <span>{route}</span>
                                      </div>
                                    </PermLabel>
                                    <Switch
                                      active={isActive}
                                      onClick={() => togglePermission(page_id)}
                                    />
                                  </CardHeader>

                                  {isActive && subPermEntries.length > 0 && (
                                    <SubPermGrid>
                                      {subPermEntries.map(k => {
                                        const isSubActive = (selectedSubPerms[page_id] || []).includes(k);
                                        return (
                                          <SubToggle
                                            key={k}
                                            active={isSubActive}
                                            onClick={() => togglePermission(page_id, k)}
                                            title={`Toggle ${k} permission`}
                                          >
                                            {isSubActive && <FiCheck size={10} />}
                                            {k}
                                          </SubToggle>
                                        );
                                      })}
                                    </SubPermGrid>
                                  )}

                                  {isActive && subPermEntries.length === 0 && (
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                      No granular permissions defined for this page.
                                    </div>
                                  )}
                                </PermissionCard>
                              );
                            })}
                          </PermissionsGrid>
                        </div>
                      ))
                    )}
                  </>
                )}
              </PermissionsContent>
            </>
          ) : (
            <EmptyState>
              <div className="icon-wrapper">
                <FiLock />
              </div>
              <h4>Select an Employee</h4>
              <p>Choose a user from the directory to view and modify their access permissions.</p>
            </EmptyState>
          )}
        </DetailPanel>
      </ContentLayout>
    </Container>
  );
};

export default UserPermissionManager;
