import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import JsBarcode from 'jsbarcode';
import { toast } from 'react-toastify';
import { Plus, Printer, Edit, Search, Save, X, Trash2, Loader, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

import apiRequest from '../../Auth/apiRequest';

import { PageWrapper, Container, ModalHeader, ModalTitle, Button, FormContent, ControlsContainer, InputWrapper, Input, SearchContainer, TableWrapper, Table, Tr, Th, Td, ModalOverlay, ModalBody, FormRow, Label, CloseButton, ButtonContainer } from '../GlobalStyles';
import * as S from '../GlobalStyles';

const baseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:2609/_b_a_c_k_e_n_d/HMS/";

const Badge = styled.span`
  padding: 4px 10px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #bae6fd;
`;

const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
  width: 100%;
`;

const FormGrid = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const FlexCol = styled.div`
  flex: ${props => props.flex || 1};
  min-width: ${props => props.minW || '140px'};
`;

const Assetsmaintenance = () => {
    const [assets, setAssets] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters (Default: Last 30 days)
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        from_date: thirtyDaysAgo,
        to_date: today,
        search_barcode: ''
    });

    const initialForm = {
        asset_name: '',
        serial_number: '',
        barcode: '',
        date: today,
        department: '',
        warrenty_period: '',
        warrenty_end_date: '',
        status: 'Active',
        description: '',
        maintenance_details: []
    };

    const [formData, setFormData] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // View Modal State
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedViewAsset, setSelectedViewAsset] = useState(null);

    // Deactivation Modal State
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [assetToDeactivate, setAssetToDeactivate] = useState(null);
    const [deactivateReason, setDeactivateReason] = useState("");

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        const query = `?from_date=${filters.from_date}&to_date=${filters.to_date}`;
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${query}`);
        if (res.success) {
            setAssets(res.data);
        }
        setLoading(false);
    }, [filters.from_date, filters.to_date]);

    const fetchDepartments = useCallback(async () => {
        const res = await apiRequest(`${baseurl}department-master/`);
        if (res.success && Array.isArray(res.data)) {
            setDepartments(res.data);
        }
    }, []);

    const getDepartmentName = useCallback((deptId) => {
        if (!deptId) return '-';
        const dept = departments.find(d => String(d.department_id) === String(deptId) || String(d.department_name) === String(deptId));
        return dept ? dept.department_name : deptId;
    }, [departments]);

    useEffect(() => {
        fetchAssets();
        fetchDepartments();
    }, [fetchAssets, fetchDepartments]);

    const handleUniversalSearch = async () => {
        if (!filters.search_barcode) return fetchAssets();
        setLoading(true);
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(filters.search_barcode)}/`);
        if (res.success) {
            setAssets([res.data]);
        } else {
            toast.error("Asset not found");
            setAssets([]);
        }
        setLoading(false);
    };

    const handleEditForm = async (pk) => {
        setIsEditing(true);
        setCurrentId(pk);
        setShowForm(true);
        setFormLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(pk)}/`);
        if (res.success) setFormData(res.data);
        setFormLoading(false);
    };

    const handleCancelForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData(initialForm);
        setShowForm(false);
    };

    const handleSave = async () => {
        const method = isEditing ? 'PATCH' : 'POST';
        const url = isEditing
            ? `${baseurl}stores-assets-maintenance/${encodeURIComponent(currentId)}/`
            : `${baseurl}stores-assets-maintenance/`;

        setFormLoading(true);
        const res = await apiRequest(url, method, formData);

        if (res.success) {
            toast.success(isEditing ? "Updated Successfully" : "Created Successfully");
            handleCancelForm();
            fetchAssets();
        } else {
            toast.error("Failed to save data");
        }
        setFormLoading(false);
    };

    // Toggle logic
    const handleToggleActiveClick = (asset) => {
        // Assume default is_active=true if missing
        if (asset.is_active === false) {
            activateAsset(asset.asset_id);
        } else {
            setAssetToDeactivate(asset);
            setDeactivateReason("");
            setShowDeactivateModal(true);
        }
    };

    const activateAsset = async (id) => {
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(id)}/`, 'PATCH', { is_active: true, deactivated_date: null, deactivate_remarks: "" });
        if (res.success) {
            toast.success("Asset reactivated");
            fetchAssets();
        } else toast.error("Failed to reactivate");
    };

    const confirmDeactivate = async () => {
        if (!deactivateReason.trim()) return toast.warning("Please provide a remark for deactivation");
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(assetToDeactivate.asset_id)}/`, 'PATCH', { is_active: false, deactivate_remarks: deactivateReason });

        if (res.success) {
            toast.success("Asset deactivated successfully");
            setShowDeactivateModal(false);
            fetchAssets();
        } else toast.error("Failed to deactivate");
    };

    const printBarcode = (asset) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;

        const tempDiv = document.createElement('div');
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tempDiv.appendChild(svg);

        JsBarcode(svg, asset.barcode || asset.asset_id, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false
        });

        doc.write(`
            <html>
                <head>
                    <style>
                        @page { size: 50mm 25mm; margin: 0; }
                        body { font-family: sans-serif; margin: 0; padding: 2mm; text-align: center; }
                        .name { font-size: 10px; font-weight: bold; margin-bottom: 2px; }
                        svg { width: 40mm; height: 12mm; }
                    </style>
                </head>
                <body>
                    <div class="name">${asset.asset_name}</div>
                    ${tempDiv.innerHTML}
                    <div>${asset.asset_id}</div>
                </body>
            </html>
        `);
        doc.close();
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
    };

    return (
        <PageWrapper>
            <Container>
                <ModalHeader $bg="white" style={{ borderBottom: 'none' }}>
                    <ModalTitle>Machine Maintenance Registry</ModalTitle>
                    <Button onClick={() => {
                        if (showForm) {
                            handleCancelForm();
                        } else {
                            setShowForm(true);
                        }
                    }}>
                        {showForm ? <><X size={18} style={{ marginRight: 4 }} /> Close Form</> : <><Plus size={18} style={{ marginRight: 4 }} /> New Machine</>}
                    </Button>
                </ModalHeader>

                <FormContent style={{ paddingTop: 0 }}>
                    {/* INLINE FORM */}
                    {showForm && (
                        <FormGrid>
                            {formLoading ? <div style={{ textAlign: 'center', padding: '20px' }}><Loader className="animate-spin" /></div> : (
                                <>
                                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b' }}>
                                        {isEditing ? `Edit Machine: ${currentId}` : 'Register New Machine'}
                                    </h3>
                                    <FlexRow>
                                        <FlexCol flex={2}>
                                            <InputWrapper>
                                                <Label required>Machine Name (Asset Name)</Label>
                                                <Input name="asset_name" value={formData.asset_name} onChange={handleInputChange} />
                                            </InputWrapper>
                                        </FlexCol>
                                        <FlexCol flex={1.5}>
                                            <InputWrapper>
                                                <Label>Serial Number</Label>
                                                <Input name="serial_number" value={formData.serial_number} onChange={handleInputChange} />
                                            </InputWrapper>
                                        </FlexCol>
                                        {/* <FlexCol flex={1.5}>
                                        <InputWrapper>
                                            <Label>Barcode</Label>
                                            <Input name="barcode" value={formData.barcode} onChange={handleInputChange} placeholder="Leave blank to auto-generate" />
                                        </InputWrapper>
                                    </FlexCol> */}
                                        <FlexCol flex={1}>
                                            <InputWrapper>
                                                <Label>Status</Label>
                                                <S.Select name="status" value={formData.status} onChange={handleInputChange}>
                                                    <option value="Active">Active</option>
                                                    <option value="On service">On service</option>
                                                    {/* <option value="Deactive">Deactive</option> */}
                                                </S.Select>
                                            </InputWrapper>
                                        </FlexCol>
                                    </FlexRow>

                                    <FlexRow>
                                        <FlexCol flex={1.5}>
                                            <InputWrapper>
                                                <Label>Department</Label>
                                                <S.Select name="department" value={formData.department} onChange={handleInputChange}>
                                                    <option value="">Select Department</option>
                                                    {departments.map((dept, i) => (
                                                        <option key={i} value={dept.department_id}>{dept.department_name}</option>
                                                    ))}
                                                </S.Select>
                                            </InputWrapper>
                                        </FlexCol>
                                        <FlexCol flex={1.2}>
                                            <InputWrapper>
                                                <Label>Purchase Date</Label>
                                                <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                                            </InputWrapper>
                                        </FlexCol>
                                        <FlexCol flex={1.2}>
                                            <InputWrapper>
                                                <Label>Warranty Period</Label>
                                                <Input name="warrenty_period" value={formData.warrenty_period} onChange={handleInputChange} placeholder="e.g. 1 Year, 6 Months" />
                                            </InputWrapper>
                                        </FlexCol>
                                        <FlexCol flex={1.2}>
                                            <InputWrapper>
                                                <Label>Warranty End Date</Label>
                                                <Input type="date" name="warrenty_end_date" value={formData.warrenty_end_date} onChange={handleInputChange} />
                                            </InputWrapper>
                                        </FlexCol>
                                    </FlexRow>

                                    <FlexRow>
                                        <FlexCol flex={1}>
                                            <InputWrapper>
                                                <Label>Description</Label>
                                                <Input name="description" value={formData.description} onChange={handleInputChange} />
                                            </InputWrapper>
                                        </FlexCol>
                                    </FlexRow>

                                    <Divider style={{ margin: '15px 0' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Service History Logs</h4>
                                        <Button style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => {
                                            const updated = [...formData.maintenance_details, { service_date: today, service_cost: 0, service_description: '' }];
                                            setFormData({ ...formData, maintenance_details: updated });
                                        }}>
                                            <Plus size={14} /> Add Service
                                        </Button>
                                    </div>

                                    {formData.maintenance_details && formData.maintenance_details.map((service, idx) => (
                                        <FormRow key={idx} style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                                            <InputWrapper>
                                                <Label>Date</Label>
                                                <Input type="date" value={service.service_date} onChange={e => {
                                                    const updated = [...formData.maintenance_details];
                                                    updated[idx].service_date = e.target.value;
                                                    setFormData({ ...formData, maintenance_details: updated });
                                                }} />
                                            </InputWrapper>
                                            <InputWrapper>
                                                <Label>Cost</Label>
                                                <Input type="number" value={service.service_cost} onChange={e => {
                                                    const updated = [...formData.maintenance_details];
                                                    updated[idx].service_cost = e.target.value;
                                                    setFormData({ ...formData, maintenance_details: updated });
                                                }} />
                                            </InputWrapper>
                                            <InputWrapper style={{ gridColumn: 'span 2' }}>
                                                <Label>Description</Label>
                                                <Input value={service.service_description} onChange={e => {
                                                    const updated = [...formData.maintenance_details];
                                                    updated[idx].service_description = e.target.value;
                                                    setFormData({ ...formData, maintenance_details: updated });
                                                }} />
                                            </InputWrapper>
                                            <Button onClick={() => {
                                                const updated = formData.maintenance_details.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, maintenance_details: updated });
                                            }} style={{ background: '#fee2e2', color: '#ef4444', alignSelf: 'flex-end' }}><Trash2 size={16} /></Button>
                                        </FormRow>
                                    ))}

                                    <ButtonContainer style={{ marginTop: '15px', justifyContent: 'flex-end' }}>
                                        <Button secondary onClick={handleCancelForm}>
                                            <X size={16} /> Cancel
                                        </Button>
                                        <Button onClick={handleSave}>
                                            <Save size={16} /> {isEditing ? 'Save Changes' : 'Save'}
                                        </Button>
                                    </ButtonContainer>
                                </>
                            )}
                        </FormGrid>
                    )}

                    {/* TABLE CONTROLS */}
                    <ControlsContainer style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                            <InputWrapper>
                                <Label>From Date</Label>
                                <Input type="date" value={filters.from_date} onChange={e => setFilters({ ...filters, from_date: e.target.value })} />
                            </InputWrapper>
                            <InputWrapper>
                                <Label>To Date</Label>
                                <Input type="date" value={filters.to_date} onChange={e => setFilters({ ...filters, to_date: e.target.value })} />
                            </InputWrapper>
                            <Button secondary onClick={fetchAssets}><Search size={16} /> Filter</Button>
                        </div>

                        <SearchContainer>
                            <InputWrapper>
                                <Label>Search ID/Barcode</Label>
                                <Input
                                    placeholder="Enter Barcode..."
                                    value={filters.search_barcode}
                                    onChange={e => setFilters({ ...filters, search_barcode: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && handleUniversalSearch()}
                                />
                            </InputWrapper>
                            <Button onClick={handleUniversalSearch}><Search size={16} /></Button>
                        </SearchContainer>
                    </ControlsContainer>

                    {/* DATA TABLE */}
                    <TableWrapper style={{ marginTop: '15px' }}>
                        {loading ? <div style={{ textAlign: 'center', padding: '20px' }}><Loader className="animate-spin" /></div> : (
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th>Asset ID</Th>
                                        <Th>Asset Name</Th>
                                        <Th>Department</Th>
                                        <Th>Status</Th>
                                        <Th>Last Service</Th>
                                        <Th style={{ textAlign: 'right' }}>Actions</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {assets.map(asset => {
                                        const logs = asset.maintenance_details || [];
                                        const lastService = logs.length > 0 ? logs[logs.length - 1].service_date : '-';
                                        const isActive = asset.is_active !== false; // Default to true if undefined

                                        return (
                                            <Tr key={asset.asset_id}>
                                                <Td><strong>{asset.asset_id}</strong></Td>
                                                <Td>{asset.asset_name}</Td>
                                                <Td>{getDepartmentName(asset.department)}</Td>
                                                <Td>
                                                    <span style={{
                                                        color: !isActive ? '#ef4444' : (asset.status === 'Active' ? '#16a34a' : '#eab308'),
                                                        fontWeight: 600, fontSize: '0.85rem'
                                                    }}>
                                                        • {!isActive ? 'Deactive' : asset.status}
                                                    </span>
                                                    {!isActive && asset.deactivate_remarks && (
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', maxWidth: '200px', fontStyle: 'italic' }}>
                                                            Remark: {asset.deactivate_remarks}
                                                        </div>
                                                    )}
                                                </Td>
                                                <Td>{lastService}</Td>
                                                <Td>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        <Button
                                                            secondary
                                                            style={{
                                                                padding: '6px',
                                                                color: isActive ? '#10b981' : '#ef4444',
                                                                borderColor: isActive ? '#10b981' : '#ef4444',
                                                                background: isActive ? '#ecfdf5' : '#fef2f2'
                                                            }}
                                                            onClick={() => handleToggleActiveClick(asset)}
                                                            title={isActive ? "Deactivate" : "Activate"}
                                                        >
                                                            {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                        </Button>
                                                        <Button
                                                            secondary
                                                            onClick={() => {
                                                                setSelectedViewAsset(asset);
                                                                setShowViewModal(true);
                                                            }}
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button success onClick={() => handleEditForm(asset.asset_id)}><Edit size={14} /></Button>
                                                        <Button secondary onClick={() => printBarcode(asset)}><Printer size={14} /></Button>
                                                    </div>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                    {assets.length === 0 && (
                                        <Tr>
                                            <Td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                                                No data available in table
                                            </Td>
                                        </Tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </TableWrapper>
                </FormContent>
            </Container>

            {/* DEACTIVATE REMARK MODAL */}
            {showDeactivateModal && (
                <ModalOverlay>
                    <S.ModalContainer>
                        <ModalHeader>
                            <ModalTitle>Deactivate Asset</ModalTitle>
                            <CloseButton onClick={() => setShowDeactivateModal(false)}><X size={18} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                                Please provide a remark for deactivating <strong>{assetToDeactivate?.asset_name}</strong>.
                            </p>
                            <InputWrapper>
                                <Label required>Remark</Label>
                                <Input
                                    as="textarea"
                                    rows={3}
                                    value={deactivateReason}
                                    onChange={(e) => setDeactivateReason(e.target.value)}
                                    placeholder="Enter deactivation reason..."
                                    autoFocus
                                />
                            </InputWrapper>
                        </ModalBody>
                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
                            <ButtonContainer style={{ width: "100%", justifyContent: "flex-end", marginTop: 0 }}>
                                <Button secondary onClick={() => setShowDeactivateModal(false)}>Cancel</Button>
                                <Button style={{ background: "#ef4444", color: "white" }} onClick={confirmDeactivate}>
                                    Deactivate
                                </Button>
                            </ButtonContainer>
                        </div>
                    </S.ModalContainer>
                </ModalOverlay>
            )}

            {/* VIEW MODAL */}
            {showViewModal && selectedViewAsset && (
                <ModalOverlay>
                    <S.ModalContainer style={{ maxWidth: '600px' }}>
                        <ModalHeader>
                            <ModalTitle>Asset Details: {selectedViewAsset.asset_name}</ModalTitle>
                            <CloseButton onClick={() => setShowViewModal(false)}><X size={18} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Barcode / ID</strong>
                                    <span style={{ fontSize: '15px' }}>{selectedViewAsset.barcode || selectedViewAsset.asset_id}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Department</strong>
                                    <span style={{ fontSize: '15px' }}>{getDepartmentName(selectedViewAsset.department)}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Purchase Date</strong>
                                    <span style={{ fontSize: '15px' }}>{selectedViewAsset.date || '-'}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Warranty End Date</strong>
                                    <span style={{ fontSize: '15px' }}>{selectedViewAsset.warrenty_end_date || '-'}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Status</strong>
                                    <span style={{
                                        fontSize: '15px',
                                        color: selectedViewAsset.is_active === false ? '#ef4444' : '#16a34a',
                                        fontWeight: 600
                                    }}>
                                        {selectedViewAsset.is_active === false ? 'Deactive' : (selectedViewAsset.status || 'Active')}
                                    </span>
                                </div>
                                {selectedViewAsset.is_active === false && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <strong style={{ color: '#ef4444', fontSize: '13px', display: 'block' }}>Deactivation Remark</strong>
                                        <span style={{ fontSize: '15px', fontStyle: 'italic' }}>{selectedViewAsset.deactivate_remarks || 'No remarks provided.'}</span>
                                    </div>
                                )}
                            </div>

                            <Divider style={{ margin: '15px 0' }} />

                            <div>
                                <strong style={{ color: '#64748b', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Description</strong>
                                <p style={{ fontSize: '14px', margin: 0 }}>{selectedViewAsset.description || 'No description provided.'}</p>
                            </div>

                            <Divider style={{ margin: '15px 0' }} />

                            <div>
                                <strong style={{ color: '#64748b', fontSize: '13px', display: 'block', marginBottom: '10px' }}>Service & Maintenance Log</strong>
                                {(selectedViewAsset.maintenance_details && selectedViewAsset.maintenance_details.length > 0) ? (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedViewAsset.maintenance_details.map((log, i) => (
                                            <li key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <strong style={{ fontSize: '13px' }}>{log.service_date}</strong>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1' }}>Cost: {log.service_cost}</span>
                                                </div>
                                                <p style={{ fontSize: '13px', margin: 0, color: '#475569' }}>{log.service_description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No service logs recorded.</p>
                                )}
                            </div>

                        </ModalBody>
                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
                            <ButtonContainer style={{ width: "100%", justifyContent: "flex-end", marginTop: 0 }}>
                                <Button secondary onClick={() => setShowViewModal(false)}>Close</Button>
                            </ButtonContainer>
                        </div>
                    </S.ModalContainer>
                </ModalOverlay>
            )}
        </PageWrapper>
    );
};

export default Assetsmaintenance;