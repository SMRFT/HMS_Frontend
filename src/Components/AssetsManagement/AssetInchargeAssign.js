import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Search, Save, UserCheck, Shield, RefreshCw, Loader } from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import { PageWrapper, Container, ModalHeader, ModalTitle, Button, FormContent, ControlsContainer, InputWrapper, Input, TableWrapper, Table, Tr, Th, Td } from '../GlobalStyles';
import * as S from '../GlobalStyles';

const baseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const SelectIncharge = styled(S.Select)`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  min-width: 200px;
  background: white;
  border: 1px solid #cbd5e1;
  &:focus {
    border-color: #3b82f6;
  }
`;

const InchargeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${props => props.$hasIncharge ? '#ecfdf5' : '#fff7ed'};
  color: ${props => props.$hasIncharge ? '#047857' : '#c2410c'};
  border: 1px solid ${props => props.$hasIncharge ? '#a7f3d0' : '#ffedd5'};
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const AssetInchargeAssign = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track selected incharge mapping locally before saving: asset_id -> employee_id
  const [selectedIncharges, setSelectedIncharges] = useState({});

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const res = await apiRequest(`${baseurl}stores-assets-maintenance/`);
    if (res.success && Array.isArray(res.data)) {
      setAssets(res.data);
      // Populate initial selection map
      const initialMap = {};
      res.data.forEach(item => {
        initialMap[item.asset_id] = item.incharge_id || '';
      });
      setSelectedIncharges(initialMap);
    } else {
      toast.error('Failed to load assets list');
    }
    setLoading(false);
  }, []);

  const fetchEmployees = useCallback(async () => {
    const res = await apiRequest(`${baseurl}get-all-employees/`);
    if (res.success && Array.isArray(res.data)) {
      setEmployees(res.data);
    } else if (Array.isArray(res)) {
      setEmployees(res);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, [fetchAssets, fetchEmployees]);

  const handleInchargeChange = (assetId, empId) => {
    setSelectedIncharges(prev => ({ ...prev, [assetId]: empId }));
  };

  const handleSaveIncharge = async (asset) => {
    const targetEmpId = selectedIncharges[asset.asset_id];
    const targetEmp = employees.find(emp => String(emp.employeeId) === String(targetEmpId));
    const inchargeName = targetEmp ? (targetEmp.employeeName || targetEmp.name) : '';

    setSavingId(asset.asset_id);
    const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(asset.asset_id)}/`, 'PATCH', {
      incharge_id: targetEmpId || null,
      incharge_name: inchargeName || null
    });

    if (res.success) {
      toast.success(`Incharge updated for ${asset.asset_name}`);
      fetchAssets();
    } else {
      toast.error('Failed to update asset incharge');
    }
    setSavingId(null);
  };

  const filteredAssets = assets.filter(asset => {
    const q = searchQuery.toLowerCase();
    return (
      (asset.asset_id && asset.asset_id.toLowerCase().includes(q)) ||
      (asset.asset_name && asset.asset_name.toLowerCase().includes(q)) ||
      (asset.department && asset.department.toLowerCase().includes(q)) ||
      (asset.incharge_name && asset.incharge_name.toLowerCase().includes(q))
    );
  });

  return (
    <PageWrapper>
      <Container>
        <ModalHeader $bg="white" style={{ borderBottom: 'none' }}>
          <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={22} color="#2563eb" />
            Asset Incharge Assigning
          </ModalTitle>
          <Button secondary onClick={fetchAssets}>
            <RefreshCw size={16} style={{ marginRight: 4 }} /> Refresh
          </Button>
        </ModalHeader>

        <FormContent style={{ paddingTop: 0 }}>
          <ControlsContainer style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <InputWrapper>
                <Input
                  placeholder="Search by Asset ID, Machine Name, Department, or Incharge..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </InputWrapper>
            </div>
            <Button secondary onClick={() => setSearchQuery('')}>
              Clear
            </Button>
          </ControlsContainer>

          <TableWrapper>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <Loader className="animate-spin" />
              </div>
            ) : (
              <Table>
                <thead>
                  <Tr>
                    <Th>Asset ID</Th>
                    <Th>Machine / Asset Name</Th>
                    <Th>Department</Th>
                    <Th>Serial No.</Th>
                    <Th>Current Incharge Status</Th>
                    <Th>Assign Employee Incharge</Th>
                    <Th style={{ textAlign: 'center' }}>Action</Th>
                  </Tr>
                </thead>
                <tbody>
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map(asset => {
                      const currentSelected = selectedIncharges[asset.asset_id] || '';
                      const isChanged = String(currentSelected) !== String(asset.incharge_id || '');
                      const isSaving = savingId === asset.asset_id;

                      return (
                        <Tr key={asset.asset_id}>
                          <Td style={{ fontWeight: '600', color: '#1e293b' }}>{asset.asset_id}</Td>
                          <Td style={{ fontWeight: '500' }}>{asset.asset_name}</Td>
                          <Td>{asset.department || '-'}</Td>
                          <Td>{asset.serial_number || '-'}</Td>
                          <Td>
                            <InchargeBadge $hasIncharge={!!asset.incharge_id}>
                              <Shield size={12} />
                              {asset.incharge_name ? asset.incharge_name : 'No Incharge Assigned'}
                            </InchargeBadge>
                          </Td>
                          <Td>
                            <SelectIncharge
                              value={currentSelected}
                              onChange={e => handleInchargeChange(asset.asset_id, e.target.value)}
                            >
                              <option value="">-- Unassigned (No Incharge) --</option>
                              {employees.map((emp, idx) => (
                                <option key={idx} value={emp.employeeId}>
                                  {emp.employeeName || emp.name} ({emp.department || emp.designation || emp.employeeId})
                                </option>
                              ))}
                            </SelectIncharge>
                          </Td>
                          <Td style={{ textAlign: 'center' }}>
                            <Button
                              onClick={() => handleSaveIncharge(asset)}
                              disabled={isSaving}
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.8rem',
                                background: isChanged ? '#2563eb' : '#64748b'
                              }}
                            >
                              {isSaving ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <>
                                  <Save size={14} style={{ marginRight: 4 }} />
                                  {isChanged ? 'Save' : 'Update'}
                                </>
                              )}
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <Tr>
                      <Td colSpan={7} style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>
                        No registered assets found.
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

export default AssetInchargeAssign;
