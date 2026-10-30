import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, X, Search, Building2 } from 'lucide-react';
import axios from 'axios';
import {
    getSelectedStoreDepartment,
    getSelectedStoreDepartmentName,
    setSelectedStoreDepartment,
    useStoresDepartment
} from './storesDepartmentHelper';

const fadeIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(4px); }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 20px;
`;

const ModalCard = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  padding: 24px 28px;
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const CloseButton = styled.button`
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
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

const HeaderArea = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 400;
  margin: 0;
`;

const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px 10px 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.88rem;
  color: #0f172a;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0d9488;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DeptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
`;

const DeptCard = styled.div`
  background: ${props => props.$selected ? '#f0fdf4' : '#ffffff'};
  border: ${props => props.$selected ? '2px solid #0d9488' : '1px solid #e2e8f0'};
  border-radius: 16px;
  padding: 13px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: #0d9488;
    background: #f0fdf4;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.08);
  }
`;

const LeftDotIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.$selected ? '#ccfbf1' : '#f1f5f9'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;

  .inner-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$selected ? '#0d9488' : '#94a3b8'};
  }
`;

const InfoBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const DeptName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DeptSubtext = styled.div`
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
`;

const RadioCheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$selected ? '#0d9488' : 'transparent'};
  border: ${props => props.$selected ? 'none' : '2px solid #cbd5e1'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

export const DepartmentSelectionModal = ({
    departments = [],
    onSelect,
    onClose,
    currentDepartmentId
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [internalDepts, setInternalDepts] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus search input on modal open
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Listen to Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Fetch departments if none passed
    useEffect(() => {
        if (departments && departments.length > 0) {
            setInternalDepts(departments);
        } else {
            const fetchDepts = async () => {
                setLoading(true);
                try {
                    const baseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';
                    const res = await axios.get(`${baseUrl.replace(/\/$/, '')}/department-master/`);
                    if (res.data) {
                        setInternalDepts(Array.isArray(res.data) ? res.data : (res.data.data || []));
                    }
                } catch (err) {
                    console.error('Error fetching departments for modal:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDepts();
        }
    }, [departments]);

    // Normalize department list
    const deptList = (internalDepts || []).map((d, idx) => ({
        department_id: d.department_id || d.id || d.department_code || d.value || `DEPT00${idx + 1}`,
        department_code: d.department_code || d.department_id || d.id || d.value || `DEPT00${idx + 1}`,
        department_name: d.department_name || d.name || d.label || d.department || 'Store Department',
        note: d.description || d.note || (d.department_code ? `${d.department_code} · Store Department` : 'Active Store Department')
    }));

    const activeDeptVal = (currentDepartmentId !== undefined ? currentDepartmentId : getSelectedStoreDepartment()) || '';
    const activeDeptLower = String(activeDeptVal).toLowerCase().trim();
    const activeDeptName = getSelectedStoreDepartmentName();

    const isAllSelected = !activeDeptVal || activeDeptVal === 'ALL';

    const filteredDepts = deptList.filter(d =>
        d.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.department_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.note && d.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectDepartment = (dept) => {
        if (!dept || dept.department_id === 'ALL' || dept.department_id === '') {
            setSelectedStoreDepartment('', 'All Departments');
            if (onSelect) onSelect({ department_id: '', department_name: 'All Departments' });
        } else {
            const idVal = dept.department_id || dept.department_code;
            const nameVal = dept.department_name || idVal;
            setSelectedStoreDepartment(idVal, nameVal);
            if (onSelect) onSelect(dept);
        }
        if (onClose) onClose();
    };

    return (
        <Overlay onClick={onClose}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
                {onClose && (
                    <CloseButton onClick={onClose} aria-label="Close">
                        <X size={16} />
                    </CloseButton>
                )}

                <HeaderArea>
                    <Title>
                        <Building2 size={22} color="#0d9488" />
                        Switch Department
                    </Title>
                    <Subtitle>Choose active department for store operations & inventory</Subtitle>
                </HeaderArea>

                <SearchWrapper>
                    <SearchIconWrapper>
                        <Search size={16} />
                    </SearchIconWrapper>
                    <SearchInput
                        ref={inputRef}
                        placeholder="Search by department name or code"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </SearchWrapper>

                <DeptList>
                    {/* ── ALL DEPARTMENTS OPTION ── */}
                    <DeptCard
                        $selected={isAllSelected}
                        onClick={() => handleSelectDepartment(null)}
                    >
                        <LeftDotIcon $selected={isAllSelected}>
                            <div className="inner-dot" />
                        </LeftDotIcon>

                        <InfoBlock>
                            <DeptName>ALL DEPARTMENTS</DeptName>
                            <DeptSubtext>ALL · View across all store departments</DeptSubtext>
                        </InfoBlock>

                        <RadioCheckIcon $selected={isAllSelected}>
                            {isAllSelected && <Check size={14} strokeWidth={3} />}
                        </RadioCheckIcon>
                    </DeptCard>

                    {/* ── INDIVIDUAL DEPARTMENTS ── */}
                    {filteredDepts.map((dept) => {
                        const isSelected = !isAllSelected && (
                            String(dept.department_id).toLowerCase().trim() === activeDeptLower ||
                            String(dept.department_code).toLowerCase().trim() === activeDeptLower ||
                            String(dept.department_name).toLowerCase().trim() === activeDeptLower ||
                            (activeDeptName && String(dept.department_name).toLowerCase().trim() === activeDeptName.toLowerCase().trim())
                        );

                        return (
                            <DeptCard
                                key={dept.department_id || dept.department_code}
                                $selected={isSelected}
                                onClick={() => handleSelectDepartment(dept)}
                            >
                                <LeftDotIcon $selected={isSelected}>
                                    <div className="inner-dot" />
                                </LeftDotIcon>

                                <InfoBlock>
                                    <DeptName>{dept.department_name}</DeptName>
                                    <DeptSubtext>
                                        {dept.department_code} · {dept.note}
                                    </DeptSubtext>
                                </InfoBlock>

                                <RadioCheckIcon $selected={isSelected}>
                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                </RadioCheckIcon>
                            </DeptCard>
                        );
                    })}

                    {filteredDepts.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                            No departments found matching "{searchTerm}"
                        </div>
                    )}
                </DeptList>
            </ModalCard>
        </Overlay>
    );
};

/**
 * Modern Capsule / Button to trigger the Department Selection Modal
 */
export const DepartmentFilterControl = ({
    departments = [],
    onDepartmentChange,
    style = {},
    showLabel = true,
    compact = false
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState(getSelectedStoreDepartment());
    const [currentDeptName, setCurrentDeptName] = useState(getSelectedStoreDepartmentName());

    useStoresDepartment((dept, name) => {
        setCurrentDept(dept || '');
        setCurrentDeptName(name || '');
        if (onDepartmentChange) onDepartmentChange(dept, name);
    });

    // F10 Shortcut to toggle Department modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10') {
                e.preventDefault();
                setIsModalOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const hasDept = Boolean(currentDept && currentDept !== 'ALL');

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                title="Click to switch department (Shortcut: F10)"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: compact ? '4px 10px' : '6px 14px',
                    background: hasDept ? '#f0fdf4' : '#ffffff',
                    border: hasDept ? '1.5px solid #0d9488' : '1.5px solid #cbd5e1',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: hasDept ? '0 2px 8px rgba(13, 148, 136, 0.12)' : 'none',
                    ...style
                }}
            >
                {hasDept ? (
                    <div style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: '#10b981',
                        flexShrink: 0,
                        boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)'
                    }} />
                ) : (
                    <Building2 size={16} color="#64748b" style={{ flexShrink: 0 }} />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15, minWidth: 0 }}>
                    {showLabel && (
                        <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            color: hasDept ? '#059669' : '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {hasDept ? 'Active Department' : 'Department'}
                        </span>
                    )}
                    <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: hasDept ? '#0f172a' : '#334155',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px'
                    }}>
                        {hasDept ? (currentDeptName || currentDept) : 'All Departments'}
                    </span>
                </div>

                <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '8px',
                    background: hasDept ? '#ffffff' : '#f1f5f9',
                    border: hasDept ? '1px solid #0d9488' : '1px solid #cbd5e1',
                    color: hasDept ? '#0d9488' : '#475569',
                    marginLeft: '2px',
                    flexShrink: 0
                }}>
                    Switch (F10)
                </span>

                {hasDept && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStoreDepartment('', 'All Departments');
                        }}
                        title="Clear Department filter"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#e2e8f0',
                            color: '#475569',
                            marginLeft: '-2px',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={12} />
                    </span>
                )}
            </div>

            {isModalOpen && (
                <DepartmentSelectionModal
                    departments={departments}
                    currentDepartmentId={currentDept}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={(dept) => {
                        setIsModalOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default DepartmentSelectionModal;

