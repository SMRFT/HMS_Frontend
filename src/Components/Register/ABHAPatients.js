import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Container = styled.div`
  padding: 30px;
  background-color: #f8fafc;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  box-sizing: border-box;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const Title = styled.h2`
  color: #0f172a;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
  white-space: nowrap;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 14px;
  color: #1e293b;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
`;

const SearchIcon = styled.svg`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 18px;
  height: 18px;
`;

const Select = styled.select`
  padding: 10px 32px 10px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 14px;
  color: #334155;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px top 50%;
  background-size: 10px auto;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #e2e8f0;
  border-radius: 8px;
  padding: 4px;
`;

const ToggleButton = styled.button`
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#0f172a' : '#64748b'};
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #0f172a;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: ${fadeIn} 0.4s ease-out forwards;
  animation-delay: ${props => props.index * 0.03}s;
  opacity: 0;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #cbd5e1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const PhotoContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  flex-shrink: 0;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EmptyPhoto = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4f46e5;
  font-weight: 600;
  font-size: 20px;
`;

const PatientInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PatientName = styled.h3`
  margin: 0 0 4px 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AbhaNumber = styled.div`
  color: #64748b;
  font-size: 13px;
  font-family: monospace;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.span`
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
`;

const Value = styled.span`
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.active ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.active ? '#166534' : '#991b1b'};
`;

// List View Styles
const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  animation: ${fadeIn} 0.3s ease-out forwards;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f8fafc;
  color: #64748b;
  text-align: left;
  padding: 16px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8fafc;
  }
`;

const ListPhotoContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

// Modal Styles
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalFadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px 32px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 20px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const LargePhoto = styled(PhotoContainer)`
  width: 100px;
  height: 100px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  border: 3px solid white;
`;

const ProfileTitle = styled.div`
  flex: 1;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DetailLabel = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
  word-break: break-word;
`;

const FullWidthDetail = styled(DetailItem)`
  grid-column: 1 / -1;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 100px auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ABHAPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Filters & Views
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const url = process.env.REACT_APP_BACKEND_HMS_BASE_URL + 'abha-profiles/';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error("Error fetching ABHA patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase() || 'NA';
  };

  // Filter Logic
  const filteredPatients = patients.filter(p => {
    const term = searchTerm.toLowerCase();
    const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    
    // Search match
    const matchesSearch = fullName.includes(term) ||
      (p.abha_number && p.abha_number.toLowerCase().includes(term)) ||
      (p.abha_mobile && p.abha_mobile.includes(term));
      
    // Gender match
    const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter;
    
    // Status match
    const pStatus = p.abha_status || 'ACTIVE';
    const matchesStatus = statusFilter === 'ALL' || pStatus === statusFilter;

    return matchesSearch && matchesGender && matchesStatus;
  });

  if (loading) return <Container><LoadingSpinner /></Container>;

  return (
    <Container>
      <Header>
        <Title>ABHA Profiles ({filteredPatients.length})</Title>
        
        <ControlsContainer>
          <SearchContainer>
            <SearchIcon fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </SearchIcon>
            <SearchInput 
              type="text" 
              placeholder="Search name, ABHA or mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <Select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
            <option value="ALL">All Genders</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </Select>

          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVATED">Deactivated</option>
          </Select>

          <ViewToggle>
            <ToggleButton 
              active={viewMode === 'card'} 
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </ToggleButton>
            <ToggleButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </ToggleButton>
          </ViewToggle>
        </ControlsContainer>
      </Header>
      
      <ContentArea>
        {filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: 'white', borderRadius: '12px' }}>
            No ABHA profiles match your filters.
          </div>
        ) : viewMode === 'card' ? (
        <Grid>
          {filteredPatients.map((p, index) => (
            <Card key={p.id || p.abha_number} index={index} onClick={() => setSelectedPatient(p)}>
              <CardHeader>
                <PhotoContainer>
                  {p.abha_photo ? (
                    <ProfileImage src={`data:image/jpeg;base64,${p.abha_photo}`} alt="Profile" />
                  ) : (
                    <EmptyPhoto>{getInitials(p.first_name, p.last_name)}</EmptyPhoto>
                  )}
                </PhotoContainer>
                <PatientInfo>
                  <PatientName>{p.first_name} {p.last_name}</PatientName>
                  <AbhaNumber>{p.abha_number}</AbhaNumber>
                </PatientInfo>
              </CardHeader>
              
              <CardBody>
                <InfoRow>
                  <Label>Mobile</Label>
                  <Value>{p.abha_mobile || 'N/A'}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>Gender</Label>
                  <Value>{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : p.gender || 'N/A'}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>Status</Label>
                  <Badge active={p.abha_status !== 'DEACTIVATED'}>
                    {p.abha_status || 'ACTIVE'}
                  </Badge>
                </InfoRow>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Photo</Th>
                <Th>Name</Th>
                <Th>ABHA Number</Th>
                <Th>Gender</Th>
                <Th>Mobile</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <TableRow key={p.id || p.abha_number} onClick={() => setSelectedPatient(p)}>
                  <Td>
                    <ListPhotoContainer>
                      {p.abha_photo ? (
                        <ProfileImage src={`data:image/jpeg;base64,${p.abha_photo}`} alt="Profile" />
                      ) : (
                        <EmptyPhoto style={{fontSize: '14px'}}>{getInitials(p.first_name, p.last_name)}</EmptyPhoto>
                      )}
                    </ListPhotoContainer>
                  </Td>
                  <Td><strong>{p.first_name} {p.last_name}</strong></Td>
                  <Td><span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{p.abha_number}</span></Td>
                  <Td>{p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : p.gender || '-'}</Td>
                  <Td>{p.abha_mobile || '-'}</Td>
                  <Td>
                    <Badge active={p.abha_status !== 'DEACTIVATED'}>
                      {p.abha_status || 'ACTIVE'}
                    </Badge>
                  </Td>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
      </ContentArea>

      {/* Profile Detail Modal */}
      {selectedPatient && (
        <Overlay onClick={() => setSelectedPatient(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Patient Profile Details
              </ModalTitle>
              <CloseButton onClick={() => setSelectedPatient(null)}>&times;</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <ProfileSection>
                <LargePhoto>
                  {selectedPatient.abha_photo ? (
                    <ProfileImage src={`data:image/jpeg;base64,${selectedPatient.abha_photo}`} alt="Profile" />
                  ) : (
                    <EmptyPhoto style={{fontSize: '32px'}}>{getInitials(selectedPatient.first_name, selectedPatient.last_name)}</EmptyPhoto>
                  )}
                </LargePhoto>
                <ProfileTitle>
                  <h2 style={{margin: '0 0 8px 0', fontSize: '24px', color: '#0f172a'}}>
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </h2>
                  <AbhaNumber style={{fontSize: '16px', background: '#e0e7ff', color: '#4f46e5'}}>
                    {selectedPatient.abha_number}
                  </AbhaNumber>
                </ProfileTitle>
                <Badge style={{padding: '8px 16px', fontSize: '14px'}} active={selectedPatient.abha_status !== 'DEACTIVATED'}>
                  {selectedPatient.abha_status || 'ACTIVE'}
                </Badge>
              </ProfileSection>

              <DetailsGrid>
                <DetailItem>
                  <DetailLabel>Date of Birth</DetailLabel>
                  <DetailValue>{selectedPatient.dob || 'Not Available'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Gender</DetailLabel>
                  <DetailValue>
                    {selectedPatient.gender === 'M' ? 'Male' : 
                     selectedPatient.gender === 'F' ? 'Female' : 
                     selectedPatient.gender || 'Not Available'}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Mobile Number</DetailLabel>
                  <DetailValue>{selectedPatient.abha_mobile || 'Not Available'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>ABHA Type</DetailLabel>
                  <DetailValue>{selectedPatient.abha_type || 'Standard'}</DetailValue>
                </DetailItem>
                
                <FullWidthDetail>
                  <DetailLabel>Full Address</DetailLabel>
                  <DetailValue style={{ lineHeight: '1.5' }}>
                    {selectedPatient.abha_full_address || selectedPatient.abha_address || 'Address not provided'}
                  </DetailValue>
                </FullWidthDetail>

                <DetailItem>
                  <DetailLabel>District</DetailLabel>
                  <DetailValue>{selectedPatient.abha_district_name || '-'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>State / Pincode</DetailLabel>
                  <DetailValue>
                    {selectedPatient.abha_state_name || '-'} {selectedPatient.abha_pincode ? `(${selectedPatient.abha_pincode})` : ''}
                  </DetailValue>
                </DetailItem>
              </DetailsGrid>
            </ModalBody>
          </ModalContent>
        </Overlay>
      )}
    </Container>
  );
};

export default ABHAPatients;
