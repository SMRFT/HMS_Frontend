import React, { useState, useEffect } from "react";
import apiRequest from "../../Auth/apiRequest";
import { Table, Pagination } from "react-bootstrap";
import { FaEdit, FaTrashAlt, FaTag } from "react-icons/fa";
import {
    Container,
    SectionTitle,
    Button as GlobalButton,
    PageWrapper,
    FormContent,
    Input,
    Label,
    Tr,
    Td,
} from '../GlobalStyles';
import styled from 'styled-components';

const StyledTable = styled(Table)`
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  overflow: hidden;
  th {
    background-color: rgba(0, 128, 128, 0.8) !important;
    color: white !important;
    text-align: center;
    vertical-align: middle;
  }
  td {
    text-align: center;
    vertical-align: middle;
    background: transparent !important;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
`;

const ActionIcon = styled.span`
  color: ${props => props.color || '#000'};
  &:hover {
    opacity: 0.8;
  }
`;

const TopControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const InitialFormState = {
    company_name: "",
    gstin: "",
    insurance_print_format: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
    contact_person: "",
    city: "",
    state: "",
    phone: "",
    mobile: "",
    pincode: "",
    email: "",
    credit_limit: "0.00",
    blocked: false,
    blocking_reason: "",
    enable_service_tax: false
};

const InsuranceProvider = () => {
    const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const [providers, setProviders] = useState([]);
    const [formData, setFormData] = useState(InitialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [filterType, setFilterType] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchProviders();
    }, [HMSURL]);

    const fetchProviders = async () => {
        try {
            const response = await apiRequest(`${HMSURL}insurance-providers/`, "GET");
            if (response.success && response.data) {
                const fetchedData = response.data.data || response.data;
                setProviders(Array.isArray(fetchedData) ? fetchedData : []);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.company_name) {
            alert("Company Name is required!");
            return;
        }

        try {
            const url = isEditing
                ? `${HMSURL}insurance-providers/${editingId}/`
                : `${HMSURL}insurance-providers/`;
            const method = isEditing ? "PUT" : "POST";

            const response = await apiRequest(url, method, formData);
            if (response.success) {
                alert(isEditing ? "Updated successfully!" : "Added successfully!");
                setFormData(InitialFormState);
                setIsEditing(false);
                setEditingId(null);
                fetchProviders();
            } else {
                alert("Action failed!");
            }
        } catch (error) {
            console.error("Error saving provider:", error);
        }
    };

    const handleEdit = (provider) => {
        setFormData({
            company_name: provider.company_name || "",
            gstin: provider.gstin || "",
            insurance_print_format: provider.insurance_print_format || "",
            address_line_1: provider.address_line_1 || "",
            address_line_2: provider.address_line_2 || "",
            address_line_3: provider.address_line_3 || "",
            contact_person: provider.contact_person || "",
            city: provider.city || "",
            state: provider.state || "",
            phone: provider.phone || "",
            mobile: provider.mobile || "",
            pincode: provider.pincode || "",
            email: provider.email || "",
            credit_limit: provider.credit_limit || "0.00",
            blocked: provider.blocked || false,
            blocking_reason: provider.blocking_reason || "",
            enable_service_tax: provider.enable_service_tax || false
        });
        setEditingId(provider.company_code || provider.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (idOrCode) => {
        if (window.confirm("Are you sure you want to delete this provider?")) {
            try {
                const response = await apiRequest(`${HMSURL}insurance-providers/${idOrCode}/`, "DELETE");
                if (response.success) {
                    fetchProviders();
                }
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    const handleCancel = () => {
        setFormData(InitialFormState);
        setIsEditing(false);
        setEditingId(null);
        setShowForm(false);
    };

    // Filter & Pagination logic
    const filteredData = providers.filter(p => {
        if (filterType === "Blocked" && !p.blocked) return false;
        if (searchQuery && !(p.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <PageWrapper>
            <Container>
                <SectionTitle><h3>Insurance Provider</h3></SectionTitle>
                <TopControls>
                    <div className="d-flex align-items-center gap-3">
                        <div>
                            <Label>Insurance Provider</Label>
                            <Input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <div className="d-flex gap-3 mt-2">
                                <Label className="d-flex align-items-center gap-2">
                                    <Input type="radio" name="type" checked={filterType === "All"} onChange={() => setFilterType("All")} /> All
                                </Label>
                                <Label className="d-flex align-items-center gap-2">
                                    <Input type="radio" name="type" checked={filterType === "Blocked"} onChange={() => setFilterType("Blocked")} /> Blocked
                                </Label>
                            </div>
                        </div>
                        <GlobalButton className="mt-4" onClick={() => fetchProviders()}>Search</GlobalButton>
                    </div>
                    <div>
                        <GlobalButton style={{ backgroundColor: '#f39c12' }} onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Close Form' : '+ New Provider'}
                        </GlobalButton>
                    </div>
                </TopControls>

                {showForm && (
                    <FormContent>
                        <form onSubmit={handleSave}>
                            <div className="row mb-3">
                                {isEditing && (
                                    <div className="col-md-2">
                                        <Label>Company Code</Label>
                                        <Input type="text" value={editingId} disabled />
                                    </div>
                                )}
                                <div className={isEditing ? "col-md-3" : "col-md-4"}>
                                    <Label>Company<span className="text-danger">*</span></Label>
                                    <Input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required />
                                </div>
                                <div className={isEditing ? "col-md-2" : "col-md-3"}>
                                    <Label>GSTIN</Label>
                                    <Input type="text" name="gstin" value={formData.gstin} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <Label>Insurance Print Format</Label>
                                    <Input type="text" name="insurance_print_format" value={formData.insurance_print_format} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-2">
                                    <Label>Addr Line 1<span className="text-danger">*</span></Label>
                                    <Input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} required />
                                </div>
                                <div className="col-md-2">
                                    <Label>Addr Line 2</Label>
                                    <Input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} />
                                </div>
                                <div className="col-md-2">
                                    <Label>Addr Line 3</Label>
                                    <Input type="text" name="address_line_3" value={formData.address_line_3} onChange={handleChange} />
                                </div>
                                <div className="col-md-3">
                                    <Label>Contact Person</Label>
                                    <Input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} />
                                </div>
                                <div className="col-md-3">
                                    <Label>Claim Pre Authorization Template</Label>
                                    <Input type="file" />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-2">
                                    <Label>City<span className="text-danger">*</span></Label>
                                    <Input type="text" name="city" value={formData.city} onChange={handleChange} required />
                                </div>
                                <div className="col-md-2">
                                    <Label>State</Label>
                                    <Input type="text" name="state" value={formData.state} onChange={handleChange} />
                                </div>
                                <div className="col-md-2">
                                    <Label>Phone</Label>
                                    <div className="d-flex">
                                        <Input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <Label>Mobile</Label>
                                    <Input type="text" name="mobile" value={formData.mobile} onChange={handleChange} />
                                </div>
                                <div className="col-md-4">
                                    <div className="row">
                                        <div className="col-md-3 mt-4">
                                            <Label className="d-flex align-items-center gap-2">
                                                <Input type="checkbox" id="blocked-switch" checked={formData.blocked} onChange={(e) => handleChange({ target: { name: 'blocked', type: 'checkbox', checked: e.target.checked } })} />
                                                Blocked
                                            </Label>
                                        </div>
                                        <div className="col-md-9">
                                            <Label>Blocking Reason</Label>
                                            <Input type="text" name="blocking_reason" value={formData.blocking_reason} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <Label>Pincode</Label>
                                    <Input type="text" name="pincode" value={formData.pincode} onChange={handleChange} />
                                </div>
                                <div className="col-md-3">
                                    <Label>Email</Label>
                                    <Input type="email" name="email" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="col-md-3">
                                    <Label>Credit Limit</Label>
                                    <Input type="number" step="0.01" name="credit_limit" value={formData.credit_limit} onChange={handleChange} />
                                </div>
                                <div className="col-md-3">
                                    <Label className="d-flex align-items-center gap-2 mt-4">
                                        <Input type="checkbox" name="enable_service_tax" checked={formData.enable_service_tax} onChange={handleChange} />
                                        Enable Service Tax
                                    </Label>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <GlobalButton type="button" variant="secondary" onClick={handleCancel}>Cancel</GlobalButton>
                                <GlobalButton type="submit">Save</GlobalButton>
                            </div>
                        </form>
                    </FormContent>
                )}

                <FormContent className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Show up to
                            <select className="ms-2 p-1 rounded" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </span>
                    </div>

                    <StyledTable responsive>
                        <thead>
                            <Tr>
                                <th>Company Code</th>
                                <th>Provider Name</th>
                                <th>GSTIN</th>
                                <th>Credit Limit</th>
                                <th>Blocked</th>
                                <th>Blocking Reason</th>
                                <th>Actions</th>
                            </Tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item, idx) => (
                                <Tr key={idx}>
                                    <Td>{item.company_code}</Td>
                                    <Td className="text-start">{item.company_name}</Td>
                                    <Td>{item.gstin || '-'}</Td>
                                    <Td>₹ {item.credit_limit}</Td>
                                    <Td>{item.blocked ? 'Y' : 'N'}</Td>
                                    <Td>{item.blocking_reason || '-'}</Td>
                                    <Td>
                                        <ActionsContainer>
                                            <ActionIcon color="#007bff" onClick={() => handleEdit(item)}><FaEdit /></ActionIcon>
                                            <ActionIcon color="#dc3545" onClick={() => handleDelete(item.company_code || item.id)}><FaTrashAlt /></ActionIcon>
                                            <ActionIcon color="#17a2b8"><FaTag /></ActionIcon>
                                        </ActionsContainer>
                                    </Td>
                                </Tr>
                            ))}
                            {currentItems.length === 0 && (
                                <Tr>
                                    <Td colSpan="6">No records found.</Td>
                                </Tr>
                            )}
                        </tbody>
                    </StyledTable>

                    {totalPages > 1 && (
                        <Pagination className="justify-content-center">
                            <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                                    {page}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                        </Pagination>
                    )}

                </FormContent>
            </Container>
        </PageWrapper>
    );
};

export default InsuranceProvider;
