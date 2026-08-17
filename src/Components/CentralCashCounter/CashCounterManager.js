import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaPowerOff, 
    FaCheckCircle, 
    FaTimesCircle,
    FaCashRegister,
    FaSearch,
    FaUsers,
    FaUserCheck,
    FaUserCog
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiRequest from '../../Auth/apiRequest';

const ApiBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// --- STYLES ---
const Container = styled.div`
    padding: 2rem;
    background: #f8fafc;
    min-height: 100vh;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const Title = styled.h2`
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1e293b;
    margin: 0;
    font-size: 1.5rem;
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);

    &:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
    }
`;

const TabContainer = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 2px;
`;

const TabButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    font-size: 0.95rem;
    font-weight: 600;
    border: none;
    background: none;
    cursor: pointer;
    color: ${props => props.active ? '#2563eb' : '#64748b'};
    border-bottom: 3px solid ${props => props.active ? '#2563eb' : 'transparent'};
    margin-bottom: -2px;
    transition: all 0.2s ease;

    &:hover {
        color: #1d4ed8;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
    background: white;
    padding: 1.25rem;
    border-radius: 10px;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    display: flex;
    align-items: center;
    gap: 15px;
    border: 1px solid #f1f5f9;
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: ${props => props.bg || '#eff6ff'};
    color: ${props => props.color || '#2563eb'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
`;

const Card = styled.div`
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    overflow: hidden;
`;

const SearchBar = styled.div`
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
    position: relative;
    flex: 1;
    max-width: 400px;

    svg {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.625rem 1rem 0.625rem 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;

    &:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
`;

const Th = styled.th`
    text-align: left;
    padding: 1rem 1.5rem;
    background: #f8fafc;
    color: #64748b;
    font-weight: 600;
    border-bottom: 1px solid #f1f5f9;
`;

const Td = styled.td`
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
`;

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    background: ${props => props.active ? '#dcfce7' : '#fee2e2'};
    color: ${props => props.active ? '#15803d' : '#991b1b'};
`;

const AssignedBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    background: ${props => props.assigned ? '#eff6ff' : '#f8fafc'};
    color: ${props => props.assigned ? '#1d4ed8' : '#64748b'};
    border: 1px solid ${props => props.assigned ? '#bfdbfe' : '#e2e8f0'};
`;

const SelectCounter = styled.select`
    padding: 6px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.85rem;
    outline: none;
    background: #ffffff;
    cursor: pointer;
    color: #1e293b;
    font-weight: 500;
    transition: all 0.2s;

    &:focus {
        border-color: #2563eb;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
`;

const IconButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
    color: ${props => props.variant === 'edit' ? '#2563eb' : props.variant === 'toggle' ? (props.active ? '#94a3b8' : '#15803d') : '#64748b'};

    &:hover {
        background: #f1f5f9;
        transform: scale(1.1);
    }
`;

// --- MODAL STYLES ---
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    padding: 2rem;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h3 {
        margin: 0;
        color: #0f172a;
        font-size: 1.25rem;
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #475569;
    }

    input, select {
        padding: 0.625rem 0.875rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 0.875rem;
        outline: none;

        &:focus {
            border-color: #2563eb;
        }
    }
`;

const CheckboxGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    padding: 10px;
    border-radius: 8px;
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    color: #334155;

    input {
        cursor: pointer;
    }
`;

const SubmitButton = styled.button`
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background: #1d4ed8;
    }
`;

// --- MAIN COMPONENT ---
const CashCounterManager = () => {
    const [activeTab, setActiveTab] = useState('counters'); // 'counters' | 'assignments'

    // Counter Registry State
    const [counters, setCounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [billTypes, setBillTypes] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCounter, setEditingCounter] = useState(null);
    const [formData, setFormData] = useState({
        counter_id: "",
        counter_name: "",
        outlet: "",
        bill_type: [],
        is_active: true
    });

    // Employee Assignments State
    const [employees, setEmployees] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);
    const [empSearchTerm, setEmpSearchTerm] = useState("");
    const [empFilterStatus, setEmpFilterStatus] = useState("all");
    const [assigningEmpId, setAssigningEmpId] = useState(null);

    const API_URL = `${ApiBaseUrl}cash_counter_manager/`;

    useEffect(() => {
        fetchCounters();
        fetchBillTypes();
        fetchOutletsList();
        fetchEmployees();
    }, []);

    const fetchOutletsList = async () => {
        try {
            const res = await apiRequest(`${ApiBaseUrl}get-all-outlets/`, "GET");
            if (res.success && res.data) {
                setOutlets(res.data);
            }
        } catch (err) {
            console.error("Error fetching outlets:", err);
        }
    };

    const fetchBillTypes = async () => {
        try {
            const res = await apiRequest(`${ApiBaseUrl}bill-types_get/`, "GET");
            if (res.success && res.data && res.data.records) {
                setBillTypes(res.data.records);
            }
        } catch (err) {
            console.error("Error fetching bill types:", err);
        }
    };

    const fetchCounters = async () => {
        try {
            const res = await apiRequest(API_URL, "GET");
            if (res.success && res.data && res.data.success) {
                setCounters(res.data.data);
            } else {
                toast.error(res.error || "Failed to load counters");
            }
        } catch (err) {
            toast.error("Failed to fetch cash counters");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        setEmpLoading(true);
        try {
            const res = await apiRequest(`${ApiBaseUrl}get_employee_counter_assignments/`, "GET");
            if (res.success && res.data) {
                const list = res.data.data || res.data || [];
                setEmployees(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            console.error("Error fetching employee assignments:", err);
        } finally {
            setEmpLoading(false);
        }
    };

    const handleAssignCounter = async (employeeId, counter_id) => {
        setAssigningEmpId(employeeId);
        try {
            const res = await apiRequest(`${ApiBaseUrl}assign_employee_cash_counter/`, "POST", {
                employeeId,
                counter_id
            });
            if (res.success && res.data && res.data.success) {
                toast.success(res.data.message || "Cash counter assigned successfully");
                fetchEmployees();
            } else {
                toast.error(res.error || res.data?.message || "Failed to assign counter");
            }
        } catch (err) {
            toast.error("Error assigning cash counter");
        } finally {
            setAssigningEmpId(null);
        }
    };

    const handleOpenModal = (counter = null) => {
        if (counter) {
            let bt = counter.bill_type;
            if (typeof bt === 'string') {
                try {
                    bt = JSON.parse(bt);
                } catch (e) {
                    bt = [];
                }
            }

            setEditingCounter(counter);
            setFormData({
                counter_id: counter.counter_id,
                counter_name: counter.counter_name,
                outlet: counter.outlet,
                bill_type: Array.isArray(bt) ? bt : [],
                is_active: counter.is_active
            });
        } else {
            setEditingCounter(null);
            setFormData({
                counter_id: "",
                counter_name: "",
                outlet: "",
                bill_type: [],
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCounter(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingCounter) {
                res = await apiRequest(API_URL, "PATCH", formData);
            } else {
                res = await apiRequest(API_URL, "POST", formData);
            }

            if (res.success && res.data && res.data.success) {
                toast.success(res.data.message);
                fetchCounters();
                handleCloseModal();
            } else {
                toast.error(res.error || res.data?.message || "Something went wrong");
            }
        } catch (err) {
            toast.error("Error saving cash counter");
        }
    };

    const toggleStatus = async (counter) => {
        try {
            const res = await apiRequest(API_URL, "PATCH", {
                counter_id: counter.counter_id,
                is_active: !counter.is_active
            });
            if (res.success && res.data && res.data.success) {
                toast.success(`Counter ${!counter.is_active ? 'Activated' : 'Deactivated'}`);
                fetchCounters();
            } else {
                toast.error(res.error || "Failed to update status");
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const filteredCounters = counters.filter(c => 
        (c.counter_name && c.counter_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.counter_id && c.counter_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.outlet && c.outlet.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredEmployees = employees.filter(emp => {
        if (empFilterStatus === 'assigned' && !emp.assigned_counter) return false;
        if (empFilterStatus === 'unassigned' && emp.assigned_counter) return false;
        if (empFilterStatus && empFilterStatus !== 'all' && empFilterStatus !== 'assigned' && empFilterStatus !== 'unassigned') {
            if (emp.assigned_counter !== empFilterStatus) return false;
        }

        if (!empSearchTerm) return true;
        const q = empSearchTerm.toLowerCase().trim();
        return (emp.employeeId && emp.employeeId.toLowerCase().includes(q)) ||
               (emp.employeeName && emp.employeeName.toLowerCase().includes(q)) ||
               (emp.department && emp.department.toLowerCase().includes(q)) ||
               (emp.designation && emp.designation.toLowerCase().includes(q)) ||
               (emp.assigned_counter_name && emp.assigned_counter_name.toLowerCase().includes(q));
    });

    const activeCounters = counters.filter(c => c.is_active);
    const assignedEmpCount = employees.filter(e => e.assigned_counter).length;
    const unassignedEmpCount = employees.filter(e => !e.assigned_counter).length;

    return (
        <Container>
            <Header>
                <Title>
                    <FaCashRegister /> Cash Counter Management
                </Title>
                {activeTab === 'counters' && (
                    <AddButton onClick={() => handleOpenModal()}>
                        <FaPlus /> Create Counter
                    </AddButton>
                )}
            </Header>

            {/* TAB NAVIGATION */}
            <TabContainer>
                <TabButton 
                    active={activeTab === 'counters'} 
                    onClick={() => setActiveTab('counters')}
                >
                    <FaCashRegister /> Cash Counter Registry ({counters.length})
                </TabButton>
                <TabButton 
                    active={activeTab === 'assignments'} 
                    onClick={() => setActiveTab('assignments')}
                >
                    <FaUsers /> Employee Counter Assignment ({employees.length})
                </TabButton>
            </TabContainer>

            {/* TAB 1: CASH COUNTER REGISTRY */}
            {activeTab === 'counters' && (
                <Card>
                    <SearchBar>
                        <SearchInputWrapper>
                            <FaSearch />
                            <SearchInput 
                                placeholder="Search by ID, Name or Outlet..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </SearchInputWrapper>
                    </SearchBar>

                    <Table>
                        <thead>
                            <tr>
                                <Th>Counter ID</Th>
                                <Th>Name</Th>
                                <Th>Outlet</Th>
                                <Th>Bill Type</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCounters.length > 0 ? filteredCounters.map(c => (
                                <tr key={c.counter_id}>
                                    <Td style={{ fontWeight: '600' }}>{c.counter_id}</Td>
                                    <Td>{c.counter_name}</Td>
                                    <Td>{c.outlet}</Td>
                                    <Td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {Array.isArray(c.bill_type) ? c.bill_type.map(bt => (
                                                <span key={bt.bill_type} style={{ 
                                                    fontSize: '10px', 
                                                    background: '#f1f5f9', 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px',
                                                    border: '1px solid #e2e8f0'
                                                }}>{bt.bill_name}</span>
                                            )) : '-'}
                                        </div>
                                    </Td>
                                    <Td>
                                        <StatusBadge active={c.is_active}>
                                            {c.is_active ? <FaCheckCircle /> : <FaTimesCircle />}
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </StatusBadge>
                                    </Td>
                                    <Td>
                                        <ActionButtons>
                                            <IconButton 
                                                variant="edit" 
                                                title="Edit Details"
                                                onClick={() => handleOpenModal(c)}
                                            >
                                                <FaEdit size={16} />
                                            </IconButton>
                                            <IconButton 
                                                variant="toggle" 
                                                active={c.is_active}
                                                title={c.is_active ? "Deactivate" : "Activate"}
                                                onClick={() => toggleStatus(c)}
                                            >
                                                <FaPowerOff size={16} />
                                            </IconButton>
                                        </ActionButtons>
                                    </Td>
                                </tr>
                            )) : (
                                <tr>
                                    <Td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        {loading ? "Loading..." : "No cash counters found."}
                                    </Td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card>
            )}

            {/* TAB 2: EMPLOYEE COUNTER ASSIGNMENT */}
            {activeTab === 'assignments' && (
                <>
                    <StatsGrid>
                        <StatCard>
                            <StatIcon bg="#eff6ff" color="#2563eb">
                                <FaUsers />
                            </StatIcon>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{employees.length}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total HMS Employees</div>
                            </div>
                        </StatCard>

                        <StatCard>
                            <StatIcon bg="#dcfce7" color="#15803d">
                                <FaUserCheck />
                            </StatIcon>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{assignedEmpCount}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned Cash Counter</div>
                            </div>
                        </StatCard>

                        <StatCard>
                            <StatIcon bg="#fef3c7" color="#d97706">
                                <FaUserCog />
                            </StatIcon>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{unassignedEmpCount}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Unassigned Employees</div>
                            </div>
                        </StatCard>
                    </StatsGrid>

                    <Card>
                        <SearchBar>
                            <SearchInputWrapper>
                                <FaSearch />
                                <SearchInput 
                                    placeholder="Search by Employee ID, Name, Department..." 
                                    value={empSearchTerm}
                                    onChange={(e) => setEmpSearchTerm(e.target.value)}
                                />
                            </SearchInputWrapper>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Filter:</span>
                                <SelectCounter 
                                    value={empFilterStatus} 
                                    onChange={(e) => setEmpFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Employees</option>
                                    <option value="assigned">Assigned Counters Only</option>
                                    <option value="unassigned">Unassigned Only</option>
                                    {activeCounters.map(c => (
                                        <option key={c.counter_id} value={c.counter_id}>
                                            Counter: {c.counter_name} ({c.counter_id})
                                        </option>
                                    ))}
                                </SelectCounter>
                            </div>
                        </SearchBar>

                        <Table>
                            <thead>
                                <tr>
                                    <Th>Employee ID</Th>
                                    <Th>Employee Name</Th>
                                    <Th>Department</Th>
                                    <Th>Designation</Th>
                                    <Th>Assigned Counter</Th>
                                    <Th style={{ textAlign: 'center' }}>Assign / Change Counter</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                                    <tr key={emp.employeeId}>
                                        <Td style={{ fontWeight: '600', color: '#2563eb' }}>{emp.employeeId}</Td>
                                        <Td style={{ fontWeight: '600' }}>{emp.employeeName}</Td>
                                        <Td>{emp.department || '-'}</Td>
                                        <Td>{emp.designation || '-'}</Td>
                                        <Td>
                                            <AssignedBadge assigned={Boolean(emp.assigned_counter)}>
                                                <FaCashRegister size={12} />
                                                {emp.assigned_counter ? `${emp.assigned_counter_name} (${emp.assigned_counter})` : 'Unassigned'}
                                            </AssignedBadge>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <SelectCounter
                                                value={emp.assigned_counter || ""}
                                                disabled={assigningEmpId === emp.employeeId}
                                                onChange={(e) => handleAssignCounter(emp.employeeId, e.target.value)}
                                                style={{ minWidth: '180px' }}
                                            >
                                                <option value="">-- Select Counter to Assign --</option>
                                                {activeCounters.map(c => (
                                                    <option key={c.counter_id} value={c.counter_id}>
                                                        {c.counter_name} ({c.counter_id})
                                                    </option>
                                                ))}
                                            </SelectCounter>
                                        </Td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <Td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                            {empLoading ? "Loading employees..." : "No employees found matching filter criteria."}
                                        </Td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </>
            )}

            {/* CREATE / EDIT COUNTER MODAL */}
            {showModal && (
                <ModalOverlay onClick={handleCloseModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>{editingCounter ? "Edit Cash Counter" : "New Cash Counter"}</h3>
                            <IconButton onClick={handleCloseModal}><FaTrash /></IconButton>
                        </ModalHeader>
                        <Form onSubmit={handleSubmit}>
                            {editingCounter && (
                                <FormGroup>
                                    <label>Counter ID</label>
                                    <input 
                                        type="text" 
                                        value={formData.counter_id} 
                                        disabled 
                                        style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                                    />
                                </FormGroup>
                            )}

                            <FormGroup>
                                <label>Counter Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Main Reception Counter" 
                                    value={formData.counter_name}
                                    onChange={e => setFormData({...formData, counter_name: e.target.value})}
                                />
                            </FormGroup>

                            <FormGroup>
                                <label>Outlet</label>
                                <select 
                                    required
                                    value={formData.outlet}
                                    onChange={e => setFormData({...formData, outlet: e.target.value})}
                                >
                                    <option value="">Select Outlet</option>
                                    {outlets.map(o => (
                                        <option key={o.outlet_code} value={o.outlet_code}>
                                            {o.outlet_name} ({o.outlet_code})
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>

                            <FormGroup>
                                <label>Allowed Bill Types</label>
                                <CheckboxGroup>
                                    {billTypes.map(bt => {
                                        const isChecked = formData.bill_type.some(item => item.bill_type === bt.bill_type);
                                        return (
                                            <CheckboxLabel key={bt.bill_type}>
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                bill_type: [...formData.bill_type, { bill_type: bt.bill_type, bill_name: bt.bill_name }]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                bill_type: formData.bill_type.filter(item => item.bill_type !== bt.bill_type)
                                                            });
                                                        }
                                                    }}
                                                />
                                                {bt.bill_name}
                                            </CheckboxLabel>
                                        );
                                    })}
                                </CheckboxGroup>
                            </FormGroup>

                            <SubmitButton type="submit">
                                {editingCounter ? "Save Changes" : "Create Counter"}
                            </SubmitButton>
                        </Form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default CashCounterManager;
