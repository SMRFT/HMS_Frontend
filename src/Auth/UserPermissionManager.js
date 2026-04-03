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

const Container = styled.div`
  padding: 32px 40px;
  background: #f8fafc;
  height: calc(100vh - 64px); /* Fixed height so inner panels handle scrolling */
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  z-index: 1;
  overflow: hidden;

  /* Modern Ambient Background Glows */
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: -1;
    opacity: 0.4;
  }
  &::before {
    top: -10%;
    left: -5%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%);
  }
  &::after {
    bottom: -10%;
    right: -5%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
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
  }
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0; /* Extremely important flexbox fix for inner scrolling containers */
`;

// --- Left Panel: User List ---

const ListPanel = styled.div`
  width: 360px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 0 3px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideInLeft} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
`;

const SearchContainer = styled.div`
  padding: 20px;
  background: white;
  border-bottom: 1px solid #f1f5f9;
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
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { 
    background: #cbd5e1; 
    border-radius: 10px; 
    &:hover { background: #94a3b8; }
  }
`;

const EmployeeItem = styled.div`
  padding: 12px 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  background: ${props => props.active ? '#f0fdfa' : 'transparent'};
  border: 1px solid ${props => props.active ? '#ccfbf1' : 'transparent'};

  /* Active State Accent Bar */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 10%;
    bottom: 10%;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: #0d9488;
    transform: scaleY(${props => props.active ? 1 : 0});
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: ${props => props.active ? '#f0fdfa' : '#f8fafc'};
  }
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  background: ${props => props.active ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#f1f5f9'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: ${props => props.active ? '0 4px 10px rgba(13, 148, 136, 0.3)' : 'none'};
  transition: all 0.3s ease;
`;

const EmpInfo = styled.div`
  flex: 1;
  min-width: 0;
  
  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${props => props.active ? '#0f766e' : '#1e293b'};
  }
  
  span {
    font-size: 0.8rem;
    color: ${props => props.active ? '#0d9488' : '#64748b'};
    display: block;
    margin-top: 4px;
    font-weight: 500;
  }
`;

// --- Right Panel: Details ---

const DetailPanel = styled.div`
  flex: 1;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 0 3px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
`;

const DetailHeader = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid #f1f5f9;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
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
  padding: 24px 30px;
  background: #fafafa;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { 
    background: #cbd5e1; 
    border-radius: 10px; 
    border: 1px solid #fafafa;
  }
`;

const SectionTitle = styled.h4`
  font-size: 0.85rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1.2px;
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
  gap: 16px;
`;

const PermissionCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 12px 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${props => props.active ? '#14b8a6' : '#e2e8f0'};
  box-shadow: ${props => props.active
    ? '0 4px 10px -2px rgba(20, 184, 166, 0.15)'
    : '0 2px 4px -1px rgba(0,0,0,0.02)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -4px rgba(0,0,0,0.06);
    border-color: ${props => props.active ? '#2dd4bf' : '#cbd5e1'};
  }
`;

const PermText = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  .icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: ${props => props.active ? '#f0fdfa' : '#f8fafc'};
    color: ${props => props.active ? '#0d9488' : '#94a3b8'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  strong { 
    font-size: 0.85rem; 
    color: ${props => props.active ? '#0f172a' : '#475569'};
    font-weight: 600;
    display: block;
  }
`;

const Switch = styled.div`
  width: 36px;
  height: 20px;
  background: ${props => props.active ? '#0d9488' : '#e2e8f0'};
  border-radius: 20px;
  position: relative;
  transition: background 0.3s ease;
  flex-shrink: 0;
  
  &::after {
    content: '';
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transform: ${props => props.active ? 'translateX(16px)' : 'translateX(0)'};
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  const [roles, setRoles] = useState([]);
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
    return employees.filter(emp =>
      (emp.employeeName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (emp.employeeId?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
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
          // Strictly load direct page IDs from Global DB into UI
          setPermissions(response.hms_pages);
          setRoles(response.roles || []);
        } else {
          setPermissions([]); // Empty state
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

  const togglePermission = (pageId) => {
    if (pageId == null) return;
    setPermissions(prev => {
      if (prev.includes(pageId)) return prev.filter(p => p !== pageId);
      return [...prev, pageId];
    });
  };

  const handleSave = async () => {
    if (!selectedEmpId) return;

    setIsSaving(true);

    const activePageIds = permissions;
    const allowedPagesStrings = [];

    if (sidebarData && sidebarData.length > 0) {
      sidebarData.forEach(group => {
        (group.pages || []).forEach(page => {
          if (page.page_id != null && activePageIds.includes(page.page_id)) {
            const perms = (page.permissions && Array.isArray(page.permissions) && page.permissions.length > 0)
              ? page.permissions
              : [PAGE_PERMISSIONS[page.route] || page.route];

            perms.forEach(str => {
              if (!allowedPagesStrings.includes(str)) {
                allowedPagesStrings.push(str);
              }
            });
          }
        });
      });
    }

    try {
      const result = await updateUserPermissions(selectedEmpId, allowedPagesStrings, activePageIds);
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
            hasExplicitToken: !!(page.permissions && page.permissions.length > 0)
          });
        }
      });
    });
    return groups;
  }, [sidebarData]);

  const sortedCategories = Object.keys(groupedPermissions).sort();

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
                    {emp.employeeName.charAt(0)}
                  </Avatar>
                  <EmpInfo active={selectedEmpId === emp.employeeId}>
                    <h4>{emp.employeeName}</h4>
                    <span>{emp.employeeId} • {emp.designation}</span>
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
                <UserHeaderInfo>
                  <h3>{selectedEmpName}</h3>
                  <span>
                    ID: <strong>{selectedEmpId}</strong>
                    {roles.length > 0 && (
                      <>
                        <div style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%' }}></div>
                        Roles: <strong>{roles.join(", ")}</strong>
                      </>
                    )}
                  </span>
                </UserHeaderInfo>
                <SaveButton onClick={handleSave} disabled={isSaving || isLoadingPerms}>
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
                  sortedCategories.map(category => (
                    <div key={category}>
                      <SectionTitle>{category}</SectionTitle>
                      <PermissionsGrid>
                        {groupedPermissions[category].map(({ pageName, page_id }) => {
                          const isActive = permissions.includes(page_id);
                          return (
                            <PermissionCard
                              key={`${pageName}-${page_id}`}
                              active={isActive}
                              onClick={() => togglePermission(page_id)}
                              role="button"
                            >
                              <PermText active={isActive}>
                                <div className="icon">
                                  <FiActivity size={18} />
                                </div>
                                <div>
                                  <strong>{pageName}</strong>
                                </div>
                              </PermText>
                              <Switch active={isActive} />
                            </PermissionCard>
                          );
                        })}
                      </PermissionsGrid>
                    </div>
                  ))
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
