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
    FaSearch
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
    margin-bottom: 2rem;
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

const Card = styled.div`
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    overflow: hidden;
`;

const SearchBar = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    gap: 1rem;
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
        ring: 2px solid rgba(37, 99, 235, 0.2);
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h3 {
        margin: 0;
        color: #1e293b;
    }
`;

const Form = styled.form`
    display: grid;
    gap: 1.25rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #475569;
    }

    input, select {
        padding: 0.625rem 0.875rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.875rem;
        outline: none;

        &:focus {
            border-color: #2563eb;
        }

        &:disabled {
            background: #f8fafc;
            color: #94a3b8;
        }
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 1rem;
`;

const CancelButton = styled.button`
    padding: 0.625rem 1.25rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #475569;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background: #f8fafc;
    }
`;

const SubmitButton = styled.button`
    padding: 0.625rem 1.25rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background: #1d4ed8;
    }
`;

// --- COMPONENT ---
const CashCounterManager = () => {
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

    const API_URL = `${ApiBaseUrl}cash_counter_manager/`;

    useEffect(() => {
        fetchCounters();
        fetchBillTypes();
        fetchOutletsList();
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
        c.counter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.counter_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.outlet.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container>
            <Header>
                <Title>
                    <FaCashRegister /> Cash Counter Management
                </Title>
                <AddButton onClick={() => handleOpenModal()}>
                    <FaPlus /> Create Counter
                </AddButton>
            </Header>

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

            {showModal && (
                <ModalOverlay onClick={handleCloseModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>{editingCounter ? "Edit Cash Counter" : "New Cash Counter"}</h3>
                            <IconButton onClick={handleCloseModal}><FaTrash /></IconButton>
                        </ModalHeader>
                        <Form onSubmit={handleSubmit}>
                            {/* <FormGroup>
                                <label>Counter ID (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="Leave blank for auto-generation (CC0001...)"
                                    disabled={editingCounter !== null}
                                    value={formData.counter_id}
                                    onChange={e => setFormData({...formData, counter_id: e.target.value})}
                                />
                            </FormGroup> */}

                            <FormGroup>
                                <label>Counter Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Main Reception Counter"
                                    required
                                    value={formData.counter_name}
                                    onChange={e => setFormData({...formData, counter_name: e.target.value})}
                                />
                            </FormGroup>

                            <FormGroup>
                                <label>Outlet / Location</label>
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
                                <label>Allowed Bill Types (Multi-select)</label>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                                    gap: '8px',
                                    padding: '10px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    background: '#fff'
                                }}>
                                    {billTypes.map(bt => (
                                        <label key={bt.bill_type} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            background: (formData.bill_type || []).some(x => x.bill_type === bt.bill_type) ? '#eff6ff' : 'transparent'
                                        }}>
                                            <input 
                                                type="checkbox"
                                                checked={(formData.bill_type || []).some(x => x.bill_type === bt.bill_type)}
                                                onChange={(e) => {
                                                    const current = Array.isArray(formData.bill_type) ? formData.bill_type : [];
                                                    let next;
                                                    if (e.target.checked) {
                                                        // Store full object
                                                        next = [...current, { bill_type: bt.bill_type, bill_name: bt.bill_name }];
                                                    } else {
                                                        next = current.filter(t => t.bill_type !== bt.bill_type);
                                                    }
                                                    setFormData({ ...formData, bill_type: next });
                                                }}
                                            />
                                            {bt.bill_name}
                                        </label>
                                    ))}
                                </div>
                            </FormGroup>

                            <ButtonGroup>
                                <CancelButton type="button" onClick={handleCloseModal}>Cancel</CancelButton>
                                <SubmitButton type="submit">
                                    {editingCounter ? "Save Changes" : "Create Counter"}
                                </SubmitButton>
                            </ButtonGroup>
                        </Form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default CashCounterManager;
