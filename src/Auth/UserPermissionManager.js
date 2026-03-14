import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { toast } from 'react-toastify';
import { fetchUserPermissions, updateUserPermissions, fetchAllEmployees } from './apiRequest';
import { PAGE_PERMISSIONS } from './FrontendPageMapping';
import { FiSave, FiSearch, FiUser, FiCheck, FiShield, FiLock } from 'react-icons/fi';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// --- Styled Components ---

const Container = styled.div`
  padding: 30px;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const HeaderContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  h2 {
    color: #1e293b;
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    background: linear-gradient(to right, #0f766e, #0d9488);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 30px;
  flex: 1;
  height: 0; 
`;

// --- Left Panel: User List ---

const ListPanel = styled.div`
  width: 340px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.4s ease-out;
`;

const SearchContainer = styled.div`
  padding: 24px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 1.1rem;
  }

  input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.95rem;
    background: #f8fafc;
    transition: all 0.2s;
    outline: none;
    color: #334155;
    
    &:focus {
      background: white;
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }
  }
`;

const EmployeeList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const EmployeeItem = styled.div`
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 16px;
  background: ${props => props.active ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#475569'};
  box-shadow: ${props => props.active ? '0 4px 12px rgba(13, 148, 136, 0.25)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#f1f5f9'};
    transform: ${props => props.active ? 'none' : 'translateX(4px)'};
  }
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  background: ${props => props.active ? 'rgba(255,255,255,0.2)' : '#e2e8f0'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
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
    color: ${props => props.active ? 'white' : '#334155'};
  }
  
  span {
    font-size: 0.8rem;
    color: ${props => props.active ? 'rgba(255,255,255,0.8)' : '#94a3b8'};
    display: block;
    margin-top: 2px;
  }
`;

// --- Right Panel: Details ---

const DetailPanel = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

const DetailHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  background: white;
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
    color: #1e293b;
    font-size: 1.25rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  span {
    color: #64748b;
    font-size: 0.9rem;
    margin-top: 4px;
    display: block;
  }
`;

const SaveButton = styled.button`
  padding: 12px 28px;
  background: linear-gradient(135deg, #0d9488 0%, #115e59 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PermissionsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: #f8fafc;
`;

const SectionTitle = styled.h4`
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  margin: 30px 0 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:first-child { margin-top: 0; }
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const PermissionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.active ? '#ccfbf1' : 'transparent'};
  box-shadow: ${props => props.active ? '0 4px 12px rgba(13, 148, 136, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px -6px rgba(0,0,0,0.08);
  }
`;

const PermText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  strong { 
    font-size: 0.95rem; 
    color: ${props => props.active ? '#0f766e' : '#334155'};
    font-weight: 600;
  }
  
  span { 
    font-size: 0.8rem; 
    color: #94a3b8;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 6px;
    align-self: flex-start;
  }
`;

const Switch = styled.div`
  width: 44px;
  height: 24px;
  background: ${props => props.active ? '#0d9488' : '#cbd5e1'};
  border-radius: 20px;
  position: relative;
  transition: background 0.3s ease;
  flex-shrink: 0;
  
  &::after {
    content: '';
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transform: ${props => props.active ? 'translateX(20px)' : 'translateX(0)'};
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
  gap: 16px;
  
  svg {
    font-size: 3rem;
    color: #cbd5e1;
  }
  
  p {
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const UserPermissionManager = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmpId, setSelectedEmpId] = useState(null);
    const [selectedEmpName, setSelectedEmpName] = useState("");
    const [selectedEmpRole, setSelectedEmpRole] = useState("");

    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]); // Store roles too
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [isLoadingPerms, setIsLoadingPerms] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadEmployees = async () => {
            setIsLoadingList(true);
            try {
                const data = await fetchAllEmployees();
                setEmployees(data);
            } catch (e) {
                toast.error("Failed to load user list");
            } finally {
                setIsLoadingList(false);
            }
        };
        loadEmployees();
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
                // API fetchUserPermissions returns { employeeId, allowed_pages, roles }
                // or just the list if the old API is still intercepting. 
                // Let's assume the new response structure
                if (response && response.allowed_pages) {
                    setPermissions(response.allowed_pages);
                    setRoles(response.roles || []);
                } else if (Array.isArray(response)) {
                    setPermissions(response); // Fallback
                    setRoles([]);
                }
            } catch (error) {
                toast.error("Failed to load permissions");
            } finally {
                setIsLoadingPerms(false);
            }
        };
        loadPerms();
    }, [selectedEmpId]);

    const togglePermission = (permId) => {
        setPermissions(prev => {
            if (prev.includes(permId)) return prev.filter(p => p !== permId);
            return [...prev, permId];
        });
    };

    const handleSave = async () => {
        if (!selectedEmpId) return;

        setIsSaving(true);
        try {
            const result = await updateUserPermissions(selectedEmpId, permissions);
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

    // Grouping
    const groupedPermissions = useMemo(() => {
        const groups = {};
        Object.entries(PAGE_PERMISSIONS).forEach(([route, permId]) => {
            let category = "General";
            const r = route.toLowerCase();
            if (r.includes("pharmacy")) category = "Pharmacy Management";
            else if (r.includes("btd") || r.includes("admission") || r.includes("patient")) category = "Patient Mgmt & Admission";
            else if (r.includes("billing") || r.includes("invoice")) category = "Billing & Finance";
            else if (r.includes("doctor")) category = "Doctor Management";
            else if (r.includes("room") || r.includes("bed") || r.includes("block")) category = "Facility & Rooms";
            else if (r.includes("inventory") || r.includes("vendor") || r.includes("grn")) category = "Inventory & Vendors";
            else if (r.includes("report") || r.includes("list") || r.includes("investigation")) category = "Diagnostics & Reports";
            else if (r.includes("user")) category = "Admin Controls";

            if (!groups[category]) groups[category] = [];
            // Avoid duplicates if multiple routes map to same ID
            if (!groups[category].some(p => p.permId === permId)) {
                groups[category].push({ route, permId });
            }
        });
        return groups;
    }, []);

    // Sort categories
    const sortedCategories = Object.keys(groupedPermissions).sort();

    return (
        <Container>
            <HeaderContainer>
                <FiShield size={28} color="#0f766e" />
                <h2>Access Control Center</h2>
            </HeaderContainer>

            <ContentLayout>
                {/* List Panel */}
                <ListPanel>
                    <SearchContainer>
                        <SearchInputWrapper>
                            <FiSearch />
                            <input
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </SearchInputWrapper>
                    </SearchContainer>
                    <EmployeeList>
                        {isLoadingList ? (
                            <EmptyState><div className="loader"></div><span>Loading...</span></EmptyState>
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
                                        <span style={{ opacity: 0.8 }}>{emp.employeeId} • {emp.designation}</span>
                                    </EmpInfo>
                                    {selectedEmpId === emp.employeeId && <FiCheck />}
                                </EmployeeItem>
                            ))
                        )}
                        {!isLoadingList && filteredEmployees.length === 0 && (
                            <EmptyState>
                                <FiUser />
                                <p>No users found</p>
                            </EmptyState>
                        )}
                    </EmployeeList>
                </ListPanel>

                {/* Detail Panel */}
                <DetailPanel>
                    {selectedEmpId ? (
                        <>
                            <DetailHeader>
                                <UserHeaderInfo>
                                    <h3>{selectedEmpName}</h3>
                                    <span>
                                        Employee ID: <strong>{selectedEmpId}</strong>
                                        {roles.length > 0 && <span> • Roles: {roles.join(", ")}</span>}
                                    </span>
                                </UserHeaderInfo>
                                <SaveButton onClick={handleSave} disabled={isSaving || isLoadingPerms}>
                                    {isSaving ? "Saving..." : <><FiSave size={18} /> Save Changes</>}
                                </SaveButton>
                            </DetailHeader>

                            <PermissionsContent>
                                {isLoadingPerms ? (
                                    <EmptyState><p>Loading permissions...</p></EmptyState>
                                ) : (
                                    sortedCategories.map(category => (
                                        <div key={category}>
                                            <SectionTitle>{category}</SectionTitle>
                                            <PermissionsGrid>
                                                {groupedPermissions[category].map(({ route, permId }) => {
                                                    const isActive = permissions.includes(permId);
                                                    return (
                                                        <PermissionCard
                                                            key={permId}
                                                            active={isActive}
                                                            onClick={() => togglePermission(permId)}
                                                            role="button"
                                                        >
                                                            <PermText active={isActive}>
                                                                <strong>{permId}</strong>
                                                                <span>{route}</span>
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
                            <FiLock size={48} color="#cbd5e1" />
                            <p style={{ color: '#64748b' }}>Select a user from the list to manage their access rights.</p>
                        </EmptyState>
                    )}
                </DetailPanel>
            </ContentLayout>
        </Container>
    );
};

export default UserPermissionManager;
