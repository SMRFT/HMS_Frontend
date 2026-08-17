import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle, Search, ShieldCheck, UserCheck, Clock, CheckCircle, X, Loader, Filter } from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import { PageWrapper, Container, ModalHeader, ModalTitle, Button, FormContent, ControlsContainer, InputWrapper, Input, TableWrapper, Table, Tr, Th, Td } from '../GlobalStyles';
import * as S from '../GlobalStyles';

const baseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const UserContextCard = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 12px 18px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
`;

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

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const AssetMaintenanceApproval = () => {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Active logged-in user context state
  const loggedUserEmpId = localStorage.getItem('auth-user-id') || '';
  const loggedUserName = localStorage.getItem('user_name') || localStorage.getItem('auth-user-name') || '';

  const [activeEmpId, setActiveEmpId] = useState(loggedUserEmpId);
  const [activeEmpName, setActiveEmpName] = useState(loggedUserName);

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    from_date: thirtyDaysAgo,
    to_date: today,
    status: '',
    search_query: ''
  });

  const fetchEmployees = useCallback(async () => {
    const res = await apiRequest(`${baseurl}get-all-employees/`);
    if (res.success && Array.isArray(res.data)) {
      setEmployees(res.data);
      if (!activeEmpId && res.data.length > 0) {
        setActiveEmpId(res.data[0].employeeId);
        setActiveEmpName(res.data[0].employeeName || res.data[0].name);
      }
    } else if (Array.isArray(res)) {
      setEmployees(res);
      if (!activeEmpId && res.length > 0) {
        setActiveEmpId(res[0].employeeId);
        setActiveEmpName(res[0].employeeName || res[0].name);
      }
    }
  }, [activeEmpId]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    let query = `?from_date=${filters.from_date}&to_date=${filters.to_date}`;
    if (filters.status) query += `&status=${filters.status}`;
    if (activeEmpId) query += `&incharge_id=${encodeURIComponent(activeEmpId)}`;

    const res = await apiRequest(`${baseurl}asset-maintenance-request/${query}`);
    if (res.success && Array.isArray(res.data)) {
      setRequests(res.data);
    } else {
      toast.error('Failed to fetch maintenance requests');
    }
    setLoading(false);
  }, [filters.from_date, filters.to_date, filters.status, activeEmpId]);

  useEffect(() => {
    fetchEmployees();
    fetchRequests();
  }, [fetchEmployees, fetchRequests]);

  const handleActiveEmpChange = (empId) => {
    setActiveEmpId(empId);
    const emp = employees.find(e => String(e.employeeId) === String(empId));
    setActiveEmpName(emp ? (emp.employeeName || emp.name) : empId);
  };

  const handleApprove = async (req) => {
    setActionLoading(req.request_id);
    const res = await apiRequest(`${baseurl}asset-maintenance-request/${encodeURIComponent(req.request_id)}/`, 'PATCH', {
      status: 'Approved',
      approved_by: activeEmpName || activeEmpId || 'Incharge Approval'
    });

    if (res.success) {
      toast.success(`Request ${req.request_id} Approved`);
      fetchRequests();
    } else {
      toast.error('Failed to approve request');
    }
    setActionLoading(null);
  };

  const handleReject = async (req) => {
    setActionLoading(req.request_id);
    const res = await apiRequest(`${baseurl}asset-maintenance-request/${encodeURIComponent(req.request_id)}/`, 'PATCH', {
      status: 'Rejected'
    });

    if (res.success) {
      toast.success(`Request ${req.request_id} Rejected`);
      fetchRequests();
    } else {
      toast.error('Failed to reject request');
    }
    setActionLoading(null);
  };

  const filteredRequests = requests.filter(req => {
    // Filter strictly for requests where active user is the assigned Incharge
    if (activeEmpId) {
      const inchargeIdStr = String(req.incharge_id || '').toLowerCase();
      const inchargeNameStr = String(req.incharge_name || '').toLowerCase();
      const activeIdStr = String(activeEmpId).toLowerCase();
      const activeNameStr = String(activeEmpName || '').toLowerCase();

      const isInchargeMatch = (inchargeIdStr && inchargeIdStr === activeIdStr) ||
                              (inchargeNameStr && activeNameStr && inchargeNameStr.includes(activeNameStr)) ||
                              (inchargeNameStr && inchargeNameStr.includes(activeIdStr));
      if (!isInchargeMatch) return false;
    }

    const q = filters.search_query.toLowerCase();
    return !q || (
      (req.request_id && req.request_id.toLowerCase().includes(q)) ||
      (req.asset_id && req.asset_id.toLowerCase().includes(q)) ||
      (req.asset_name && req.asset_name.toLowerCase().includes(q)) ||
      (req.requested_by && req.requested_by.toLowerCase().includes(q)) ||
      (req.description && req.description.toLowerCase().includes(q)) ||
      (req.incharge_name && req.incharge_name.toLowerCase().includes(q))
    );
  });

  return (
    <PageWrapper>
      <Container>
        <ModalHeader $bg="white" style={{ borderBottom: 'none' }}>
          <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#059669" />
            Asset Maintenance Request Approval
          </ModalTitle>
          <Button secondary onClick={fetchRequests}>
            Refresh
          </Button>
        </ModalHeader>

        <FormContent style={{ paddingTop: 0 }}>
          {/* USER CONTEXT SELECTOR */}
          <UserContextCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={20} color="#0284c7" />
              <div>
                <strong style={{ color: '#0369a1', fontSize: '0.9rem' }}>Current Logged-In Approver Context:</strong>
                <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                  {activeEmpName ? `${activeEmpName} (${activeEmpId || 'ID N/A'})` : 'Select active employee profile below'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Switch User / Profile:</span>
              <S.Select
                value={activeEmpId}
                onChange={e => handleActiveEmpChange(e.target.value)}
                style={{ background: 'white', borderColor: '#7dd3fc', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem' }}
              >
                <option value="">-- All / Admin Access --</option>
                {employees.map((emp, idx) => (
                  <option key={idx} value={emp.employeeId}>
                    {emp.employeeName || emp.name} ({emp.department || emp.employeeId})
                  </option>
                ))}
              </S.Select>
            </div>
          </UserContextCard>

          {/* FILTERS (3 FIELDS PER ROW) */}
          <ControlsContainer style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '100%' }}>
              <InputWrapper>
                <S.Label>From Date</S.Label>
                <Input
                  type="date"
                  value={filters.from_date}
                  onChange={e => setFilters({ ...filters, from_date: e.target.value })}
                />
              </InputWrapper>

              <InputWrapper>
                <S.Label>To Date</S.Label>
                <Input
                  type="date"
                  value={filters.to_date}
                  onChange={e => setFilters({ ...filters, to_date: e.target.value })}
                />
              </InputWrapper>

              <InputWrapper>
                <S.Label>Status Filter</S.Label>
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
                <S.Label>Search Requests</S.Label>
                <Input
                  placeholder="Search Request ID, Asset, Incharge..."
                  value={filters.search_query}
                  onChange={e => setFilters({ ...filters, search_query: e.target.value })}
                />
              </InputWrapper>

              <Button secondary onClick={fetchRequests} style={{ height: '38px', justifyContent: 'center' }}>
                <Filter size={16} /> Filter
              </Button>

              <Button secondary onClick={() => setFilters({ from_date: thirtyDaysAgo, to_date: today, status: '', search_query: '' })} style={{ height: '38px', justifyContent: 'center' }}>
                Reset Filters
              </Button>
            </div>
          </ControlsContainer>

          {/* TABLE OF REQUESTS FOR APPROVAL */}
          <TableWrapper>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <Loader className="animate-spin" />
              </div>
            ) : (
              <Table>
                <thead>
                  <Tr>
                    <Th>Request ID</Th>
                    <Th>Asset ID & Name</Th>
                    <Th>Description</Th>
                    <Th>Requested By</Th>
                    <Th>Assigned Incharge</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                    <Th style={{ textAlign: 'center' }}>Approve / Reject Action</Th>
                  </Tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map(req => {
                      // CRITICAL RULE: Can only approve if:
                      // 1) request.incharge_id matches activeEmpId OR
                      // 2) request has no incharge_id OR
                      // 3) activeEmpId is unselected (Admin view)
                      const isAssignedIncharge =
                        !req.incharge_id ||
                        !activeEmpId ||
                        String(req.incharge_id) === String(activeEmpId);

                      const isPending = req.status === 'Pending';
                      const isLoadingAction = actionLoading === req.request_id;

                      return (
                        <Tr key={req.request_id}>
                          <Td style={{ fontWeight: '600', color: '#2563eb' }}>{req.request_id}</Td>
                          <Td>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{req.asset_id}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.asset_name}</div>
                          </Td>
                          <Td style={{ maxWidth: '240px' }}>{req.description}</Td>
                          <Td>{req.requested_by}</Td>
                          <Td>
                            {req.incharge_name ? (
                              <span style={{ fontWeight: '500', color: String(req.incharge_id) === String(activeEmpId) ? '#059669' : '#334155' }}>
                                {req.incharge_name}
                                {String(req.incharge_id) === String(activeEmpId) && ' (You)'}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned (Auto-Approved)</span>
                            )}
                          </Td>
                          <Td>
                            <StatusBadge $status={req.status}>
                              {req.status === 'Approved' && <CheckCircle size={12} />}
                              {req.status === 'Pending' && <Clock size={12} />}
                              {req.status === 'Completed' && <CheckCircle size={12} />}
                              {req.status === 'Rejected' && <X size={12} />}
                              {req.status}
                            </StatusBadge>
                          </Td>
                          <Td>{req.created_date ? req.created_date.split('T')[0] : '-'}</Td>
                          <Td style={{ textAlign: 'center' }}>
                            {isPending ? (
                              <ActionButtonGroup>
                                <Button
                                  onClick={() => handleApprove(req)}
                                  disabled={!isAssignedIncharge || isLoadingAction}
                                  title={!isAssignedIncharge ? `Only assigned incharge (${req.incharge_name}) can approve this request` : 'Approve Request'}
                                  style={{
                                    background: isAssignedIncharge ? '#16a34a' : '#cbd5e1',
                                    color: 'white',
                                    padding: '5px 12px',
                                    fontSize: '0.78rem',
                                    cursor: isAssignedIncharge ? 'pointer' : 'not-allowed'
                                  }}
                                >
                                  <CheckCircle2 size={14} style={{ marginRight: 4 }} />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleReject(req)}
                                  disabled={!isAssignedIncharge || isLoadingAction}
                                  title={!isAssignedIncharge ? `Only assigned incharge (${req.incharge_name}) can reject this request` : 'Reject Request'}
                                  style={{
                                    background: isAssignedIncharge ? '#dc2626' : '#cbd5e1',
                                    color: 'white',
                                    padding: '5px 12px',
                                    fontSize: '0.78rem',
                                    cursor: isAssignedIncharge ? 'pointer' : 'not-allowed'
                                  }}
                                >
                                  <XCircle size={14} style={{ marginRight: 4 }} />
                                  Reject
                                </Button>
                              </ActionButtonGroup>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {req.status === 'Approved' && `Approved by ${req.approved_by || 'Incharge'}`}
                                {req.status === 'Completed' && `Completed`}
                                {req.status === 'Rejected' && `Rejected`}
                              </span>
                            )}
                          </Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <Tr>
                      <Td colSpan={8} style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>
                        No maintenance requests to display.
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

export default AssetMaintenanceApproval;
