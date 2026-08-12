import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Plus, Search, Save, X, Wrench, AlertTriangle, CheckCircle, Clock, ShieldCheck, Loader, RefreshCw } from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import { PageWrapper, Container, ModalHeader, ModalTitle, Button, FormContent, ControlsContainer, InputWrapper, Input, TableWrapper, Table, Tr, Th, Td, FormRow, Label, ButtonContainer } from '../GlobalStyles';
import * as S from '../GlobalStyles';

const baseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  ${props => props.$status === 'Approved' && `
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  `}
  ${props => props.$status === 'Pending' && `
    background: #fef9c3;
    color: #a16207;
    border: 1px solid #fef08a;
  `}
  ${props => props.$status === 'Completed' && `
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
  `}
  ${props => props.$status === 'Rejected' && `
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fca5a5;
  `}
`;

const PriorityBadge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;

  ${props => props.$priority === 'High' && `background: #fee2e2; color: #dc2626;`}
  ${props => props.$priority === 'Medium' && `background: #ffedd5; color: #ea580c;`}
  ${props => props.$priority === 'Low' && `background: #f1f5f9; color: #475569;`}
`;

const AutoApproveBanner = styled.div`
  background: ${props => props.$autoApprove ? '#f0fdf4' : '#eff6ff'};
  border: 1px solid ${props => props.$autoApprove ? '#bbf7d0' : '#bfdbfe'};
  color: ${props => props.$autoApprove ? '#166534' : '#1e40af'};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 500;
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

const AssetMaintenanceRequest = () => {
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    from_date: thirtyDaysAgo,
    to_date: today,
    status: '',
    search_query: ''
  });

  const currentEmpId = localStorage.getItem('employeeId') || localStorage.getItem('employee_id') || localStorage.getItem('auth-user-id') || localStorage.getItem('user_name') || localStorage.getItem('auth-user-name') || '';

  const initialForm = {
    asset_id: '',
    asset_name: '',
    description: '',
    requested_by: currentEmpId,
    requested_by_id: currentEmpId,
    priority: 'Medium'
  };

  const [formData, setFormData] = useState(initialForm);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const fetchAssets = useCallback(async () => {
    const res = await apiRequest(`${baseurl}stores-assets-maintenance/`);
    if (res.success && Array.isArray(res.data)) {
      setAssets(res.data);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let query = `?from_date=${filters.from_date}&to_date=${filters.to_date}`;
    if (filters.status) query += `&status=${filters.status}`;
    if (currentEmpId) query += `&requested_by_id=${encodeURIComponent(currentEmpId)}`;

    const res = await apiRequest(`${baseurl}asset-maintenance-request/${query}`);
    if (res.success && Array.isArray(res.data)) {
      setRequests(res.data);
    } else {
      toast.error('Failed to load maintenance requests');
    }
    setLoading(false);
  }, [filters.from_date, filters.to_date, filters.status, currentEmpId]);

  useEffect(() => {
    fetchAssets();
    fetchRequests();
  }, [fetchAssets, fetchRequests]);

  const handleAssetSelect = (assetId) => {
    const asset = assets.find(a => String(a.asset_id) === String(assetId));
    setSelectedAsset(asset || null);
    setFormData(prev => ({
      ...prev,
      asset_id: assetId,
      asset_name: asset ? asset.asset_name : ''
    }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.asset_id) return toast.warning('Please select an asset');
    if (!formData.description.trim()) return toast.warning('Please provide a maintenance description');

    // Rule check: if incharge is not assigned OR priority is High -> Auto-Approve immediately
    const isHighPriority = formData.priority === 'High';
    const isNoIncharge = !selectedAsset || !selectedAsset.incharge_id;
    const isAutoApproved = isNoIncharge || isHighPriority;

    const payload = {
      ...formData,
      requested_by: formData.requested_by || currentEmpId,
      requested_by_id: currentEmpId,
      status: isAutoApproved ? 'Approved' : 'Pending',
      approved_by: isAutoApproved ? (isHighPriority ? 'Auto-Approved (High Priority)' : 'System Auto-Approval (No Incharge)') : null,
      incharge_id: selectedAsset ? selectedAsset.incharge_id : null,
      incharge_name: selectedAsset ? selectedAsset.incharge_name : null
    };

    setSubmitting(true);
    const res = await apiRequest(`${baseurl}asset-maintenance-request/`, 'POST', payload);
    if (res.success) {
      toast.success(
        isAutoApproved
          ? (isHighPriority ? 'Request created & Auto-Approved (High Priority)' : 'Request created & Auto-Approved (No Incharge assigned)')
          : 'Maintenance Request submitted successfully'
      );
      setFormData(initialForm);
      setSelectedAsset(null);
      setShowForm(false);
      fetchRequests();
    } else {
      toast.error('Failed to submit maintenance request');
    }
    setSubmitting(false);
  };

  const filteredRequests = requests.filter(req => {
    // Filter strictly for logged in employee's requests
    if (currentEmpId) {
      const reqEmpId = String(req.requested_by_id || '').toLowerCase();
      const reqBy = String(req.requested_by || '').toLowerCase();
      const reqCreatedBy = String(req.created_by || '').toLowerCase();
      const loggedEmpId = String(currentEmpId).toLowerCase();

      const isUserMatch = (reqEmpId && reqEmpId === loggedEmpId) ||
                          (reqBy && reqBy.includes(loggedEmpId)) ||
                          (reqCreatedBy && reqCreatedBy === loggedEmpId);
      if (!isUserMatch) return false;
    }

    const q = filters.search_query.toLowerCase();
    return !q || (
      (req.request_id && req.request_id.toLowerCase().includes(q)) ||
      (req.asset_id && req.asset_id.toLowerCase().includes(q)) ||
      (req.asset_name && req.asset_name.toLowerCase().includes(q)) ||
      (req.requested_by && req.requested_by.toLowerCase().includes(q)) ||
      (req.description && req.description.toLowerCase().includes(q))
    );
  });

  const isHighPriorityForm = formData.priority === 'High';
  const isNoInchargeForm = selectedAsset && !selectedAsset.incharge_id;
  const isAutoApprovedForm = isHighPriorityForm || isNoInchargeForm;

  return (
    <PageWrapper>
      <Container>
        <ModalHeader $bg="white" style={{ borderBottom: 'none' }}>
          <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={22} color="#2563eb" />
            Asset Maintenance Request
          </ModalTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <><X size={18} style={{ marginRight: 4 }} /> Close Form</>
            ) : (
              <><Plus size={18} style={{ marginRight: 4 }} /> New Maintenance Request</>
            )}
          </Button>
        </ModalHeader>

        <FormContent style={{ paddingTop: 0 }}>
          {showForm && (
            <FormGrid>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b' }}>
                Create New Maintenance Request
              </h3>

              <FlexRow>
                <FlexCol flex={2} minW="220px">
                  <InputWrapper>
                    <Label required>Select Machine / Asset</Label>
                    <S.Select
                      value={formData.asset_id}
                      onChange={e => handleAssetSelect(e.target.value)}
                    >
                      <option value="">-- Choose Asset --</option>
                      {assets.map((asset, i) => (
                        <option key={i} value={asset.asset_id}>
                          {asset.asset_id} - {asset.asset_name} ({asset.department || 'General'})
                        </option>
                      ))}
                    </S.Select>
                  </InputWrapper>
                </FlexCol>

                <FlexCol flex={1.5} minW="160px">
                  <InputWrapper>
                    <Label required>Requested By</Label>
                    <Input
                      name="requested_by"
                      value={formData.requested_by}
                      onChange={handleInputChange}
                      placeholder="Employee Name / ID"
                    />
                  </InputWrapper>
                </FlexCol>

                <FlexCol flex={1} minW="140px">
                  <InputWrapper>
                    <Label>Priority</Label>
                    <S.Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </S.Select>
                  </InputWrapper>
                </FlexCol>
              </FlexRow>

              {/* Dynamic Incharge / High Priority Auto-Approval Notification Banner */}
              {selectedAsset && (
                <AutoApproveBanner $autoApprove={isAutoApprovedForm}>
                  {isHighPriorityForm ? (
                    <>
                      <CheckCircle size={18} color="#166534" />
                      <span>
                        <strong>High Priority Auto-Approval:</strong> Priority is High. Request will be <strong>Approved by default</strong> immediately upon submission without requiring Incharge approval.
                      </span>
                    </>
                  ) : isNoInchargeForm ? (
                    <>
                      <CheckCircle size={18} color="#166534" />
                      <span>
                        <strong>Auto-Approval Active:</strong> No Incharge is assigned to this asset. Request will be <strong>Approved by default</strong> immediately upon submission.
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} color="#1e40af" />
                      <span>
                        <strong>Assigned Incharge:</strong> {selectedAsset.incharge_name}. Request status will be <strong>Pending</strong> until approved by {selectedAsset.incharge_name}.
                      </span>
                    </>
                  )}
                </AutoApproveBanner>
              )}

              <FlexRow>
                <FlexCol flex={1}>
                  <InputWrapper>
                    <Label required>Issue / Maintenance Description</Label>
                    <Input
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the defect, breakdown, or maintenance required..."
                    />
                  </InputWrapper>
                </FlexCol>
              </FlexRow>

              <ButtonContainer style={{ marginTop: '15px', justifyContent: 'flex-end' }}>
                <Button secondary onClick={() => setShowForm(false)}>
                  <X size={16} /> Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <><Save size={16} /> Submit Request</>
                  )}
                </Button>
              </ButtonContainer>
            </FormGrid>
          )}

          {/* CONTROLS & FILTERS (3 FIELDS PER ROW) */}
          <ControlsContainer style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '100%' }}>
              <InputWrapper>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={filters.from_date}
                  onChange={e => setFilters({ ...filters, from_date: e.target.value })}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={filters.to_date}
                  onChange={e => setFilters({ ...filters, to_date: e.target.value })}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Status Filter</Label>
                <S.Select
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </S.Select>
              </InputWrapper>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', width: '100%', alignItems: 'flex-end' }}>
              <InputWrapper>
                <Label>Search Requests</Label>
                <Input
                  placeholder="Search Request ID, Asset Name, Requested By..."
                  value={filters.search_query}
                  onChange={e => setFilters({ ...filters, search_query: e.target.value })}
                />
              </InputWrapper>

              <Button secondary onClick={fetchRequests} style={{ height: '38px', justifyContent: 'center' }}>
                <Search size={16} /> Filter
              </Button>

              <Button secondary onClick={() => setFilters({ from_date: thirtyDaysAgo, to_date: today, status: '', search_query: '' })} style={{ height: '38px', justifyContent: 'center' }}>
                Reset Filters
              </Button>
            </div>
          </ControlsContainer>

          {/* REQUESTS DATA TABLE */}
          <TableWrapper>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <Loader className="animate-spin" />
              </div>
            ) : (
              <Table>
                <thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Request ID</Th>
                    <Th>Asset ID</Th>
                    <Th>Asset Name</Th>
                    <Th>Description</Th>
                    <Th>Requested By</Th>
                    <Th>Priority</Th>
                    <Th>Assigned Incharge</Th>
                    <Th>Status</Th>
                  </Tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map(req => (
                      <Tr key={req.request_id}>
                        <Td style={{ fontWeight: '600', color: '#0284c7' }}>{req.date || (req.created_date ? req.created_date.split('T')[0] : '-')}</Td>
                        <Td style={{ fontWeight: '600', color: '#2563eb' }}>{req.request_id}</Td>
                        <Td style={{ fontWeight: '600' }}>{req.asset_id}</Td>
                        <Td style={{ fontWeight: '500' }}>{req.asset_name}</Td>
                        <Td style={{ maxWidth: '250px' }}>{req.description}</Td>
                        <Td>{req.requested_by}</Td>
                        <Td>
                          <PriorityBadge $priority={req.priority}>
                            {req.priority}
                          </PriorityBadge>
                        </Td>
                        <Td>{req.incharge_name || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>None (Auto-Approved)</span>}</Td>
                        <Td>
                          <StatusBadge $status={req.status}>
                            {req.status === 'Approved' && <CheckCircle size={12} />}
                            {req.status === 'Pending' && <Clock size={12} />}
                            {req.status === 'Completed' && <CheckCircle size={12} />}
                            {req.status === 'Rejected' && <X size={12} />}
                            {req.status}
                          </StatusBadge>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={9} style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>
                        No maintenance requests found.
                      </Td>
                    </Tr>
                  )}
                </tbody>
              </Table>
            )}
          </TableWrapper>
        </FormContent>
      </Container>
    </PageWrapper>
  );
};

export default AssetMaintenanceRequest;
