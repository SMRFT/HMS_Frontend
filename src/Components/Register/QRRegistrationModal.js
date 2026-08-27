import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';
import { X, RefreshCw, Search, Printer, Send } from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  backdrop-filter: blur(4px);
`;

const Content = styled.div`
  background: #ffffff;
  width: 95%;
  max-width: 1060px;
  height: 85vh;
  max-height: 720px;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  display: flex;
  overflow: hidden;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  z-index: 10;
  transition: all 0.15s ease;

  &:hover {
    color: #0f172a;
    border-color: #cbd5e1;
    background: #f8fafc;
  }
`;

// Left Dark Panel
const LeftPanel = styled.div`
  width: 360px;
  background: #13201a;
  color: #ffffff;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-sizing: border-box;
  overflow-y: auto;
`;

const LiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #34d399;
  text-transform: uppercase;
  margin-bottom: 8px;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    background-color: #34d399;
    border-radius: 50%;
    display: inline-block;
  }
`;

const LeftTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
`;

const LeftSubtitle = styled.p`
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 20px 0;
`;

const QRCard = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const QRSubtext = styled.span`
  margin-top: 14px;
  font-family: 'DM Mono', monospace, monospace;
  font-size: 11.5px;
  color: #64748b;
`;

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 28px;
`;

const DarkActionButton = styled.button`
  background: #1e2c24;
  border: 1px solid #2d4037;
  color: #e2e8f0;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;

  &:hover {
    background: #27382f;
    border-color: #3e564a;
    color: #ffffff;
  }
`;

const HowItWorksSection = styled.div`
  margin-top: auto;
`;

const HowHeader = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 12.5px;
  color: #cbd5e1;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepBadge = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #166534;
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

// Right Light Panel
const RightPanel = styled.div`
  flex: 1;
  background: #ffffff;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
`;

const QueueHeader = styled.div`
  margin-bottom: 16px;
`;

const QueueTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
`;

const QueueSubtitle = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
`;

const ControlsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterPillGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
`;

const FilterPill = styled.button`
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${props => props.active ? '#133d34' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#64748b'};
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: ${props => props.active ? '#ffffff' : '#0f172a'};
  }
`;

const PillCountBadge = styled.span`
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0'};
  color: ${props => props.active ? '#ffffff' : '#475569'};
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 220px;
`;

const SearchIconBox = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 7px 10px 7px 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #133d34;
    box-shadow: 0 0 0 2px rgba(19, 61, 52, 0.1);
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const PatientListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const PatientCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.status === 'Partial' ? '#f59e0b' : '#133d34'};
  }
`;

const LeftCardGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const InitialAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.status === 'Partial' ? '#d97706' : '#133d34'};
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PatientDetailsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PatientNameText = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
`;

const StatusTag = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => props.status === 'Partial' ? '#fef3c7' : '#dcfce7'};
  color: ${props => props.status === 'Partial' ? '#b45309' : '#166534'};
`;

const ContactMetaRow = styled.div`
  font-size: 13px;
  color: #475569;
`;

const SubTextRow = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const ActionButtonGroupRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
`;

const LoadButton = styled.button`
  padding: 7px 16px;
  background: #133d34;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #0f312a;
  }
`;

const DiscardButton = styled.button`
  padding: 5px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
    color: #ef4444;
    border-color: #fca5a5;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  gap: 12px;
`;

const QRRegistrationModal = ({ isOpen, onClose, onDataReceived }) => {
  const [loading, setLoading] = useState(false);
  const [pendingList, setPendingList] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'consumed'
  const [searchTerm, setSearchTerm] = useState("");
  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    if (isOpen) {
      fetchPendingList();
    }
  }, [isOpen, activeTab]);

  const fetchPendingList = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'consumed' ? 'all' : 'pending';
      const response = await apiRequest(`${Hmsbaseurl}get-pending-qr-registrations/?status=${status}`, "GET");
      if (response.success && Array.isArray(response.data)) {
        setPendingList(response.data);
      }
    } catch (error) {
      console.error("Error fetching pending list", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async (patient) => {
    try {
      const response = await apiRequest(`${Hmsbaseurl}consume-qr-registration/`, "POST", {
        session_id: patient.session_id
      });
      if (!response.success) throw new Error(response.error);

      if (patient.full_data) {
        onDataReceived(patient.full_data);
      } else {
        onDataReceived(patient);
      }
      onClose();
    } catch (error) {
      console.error("Error consuming registration", error);
      alert("Failed to process registration.");
      fetchPendingList();
    }
  };

  const handleDelete = async (patient) => {
    if (!window.confirm("Are you sure you want to discard this registration from the queue?")) return;

    try {
      const response = await apiRequest(`${Hmsbaseurl}consume-qr-registration/`, "POST", {
        session_id: patient.session_id
      });
      if (!response.success) throw new Error(response.error);
      fetchPendingList();
    } catch (error) {
      console.error("Error deleting registration", error);
      alert("Failed to delete registration.");
    }
  };

  const printQRSheet = () => {
    window.print();
  };

  const sendLinkSMS = () => {
    alert("Self-registration link sent via SMS!");
  };

  if (!isOpen) return null;

  const registrationUrl = `${window.location.origin}/MobileRegistration`;

  const filteredList = pendingList.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.mobile && p.mobile.includes(searchTerm))
  );

  return (
    <Overlay>
      <Content>
        <CloseButton onClick={onClose}>
          <X size={18} />
        </CloseButton>

        {/* Left Dark Panel */}
        <LeftPanel>
          <LiveBadge>COUNTER QR LIVE</LiveBadge>
          <LeftTitle>Scan to register</LeftTitle>
          <LeftSubtitle>Ask the patient to scan with their phone camera.</LeftSubtitle>

          <QRCard>
            <QRCodeCanvas value={registrationUrl} size={180} />
            <QRSubtext>hms.smrft.org/self-register</QRSubtext>
          </QRCard>

          <HowItWorksSection>
            <HowHeader>HOW IT WORKS</HowHeader>
            <StepItem>
              <StepBadge>1</StepBadge>
              <span>Patient scans this QR at the counter.</span>
            </StepItem>
            <StepItem>
              <StepBadge>2</StepBadge>
              <span>They fill their own details on their phone.</span>
            </StepItem>
            <StepItem>
              <StepBadge>3</StepBadge>
              <span>Their entry appears here — load it into the form.</span>
            </StepItem>
          </HowItWorksSection>
        </LeftPanel>

        {/* Right Light Panel */}
        <RightPanel>
          <QueueHeader>
            <QueueTitle>Registration queue</QueueTitle>
            <QueueSubtitle>
              {pendingList.length} patients submitted and waiting to be registered
            </QueueSubtitle>
          </QueueHeader>

          <ControlsBar>
            <FilterPillGroup>
              <FilterPill
                active={activeTab === 'pending'}
                onClick={() => setActiveTab('pending')}
              >
                Waiting <PillCountBadge active={activeTab === 'pending'}>{pendingList.length}</PillCountBadge>
              </FilterPill>
              <FilterPill
                active={activeTab === 'consumed'}
                onClick={() => setActiveTab('consumed')}
              >
                Processed
              </FilterPill>
            </FilterPillGroup>

            <RightControls>
              <SearchWrapper>
                <SearchIconBox>
                  <Search size={14} />
                </SearchIconBox>
                <SearchInput
                  type="text"
                  placeholder="Search name or mobile"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchWrapper>

              <RefreshButton onClick={fetchPendingList} disabled={loading}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </RefreshButton>
            </RightControls>
          </ControlsBar>

          <PatientListContainer>
            {filteredList.length > 0 ? (
              filteredList.map((p) => {
                const initial = p.name ? p.name.charAt(0).toUpperCase() : '?';
                const isPartial = p.status === 'Partial' || p.some_missing;
                const statusLabel = isPartial ? 'Partial' : 'Ready';

                return (
                  <PatientCard key={p.session_id} status={statusLabel}>
                    <LeftCardGroup>
                      <InitialAvatar status={statusLabel}>{initial}</InitialAvatar>

                      <PatientDetailsGroup>
                        <NameRow>
                          <PatientNameText>{p.name}</PatientNameText>
                          <StatusTag status={statusLabel}>{statusLabel}</StatusTag>
                        </NameRow>

                        <ContactMetaRow>
                          {p.mobile || 'No Mobile'} · {p.gender || 'Gender N/A'} · {p.age ? `${p.age} yrs` : (p.age_gender || '')}
                        </ContactMetaRow>

                        <SubTextRow>
                          Submitted {p.time_ago || 'recently'} · {isPartial ? 'some fields missing' : 'all fields filled'}
                        </SubTextRow>
                      </PatientDetailsGroup>
                    </LeftCardGroup>

                    <ActionButtonGroupRight>
                      {!p.is_consumed ? (
                        <>
                          <LoadButton onClick={() => handleConvert(p)}>
                            Load into form
                          </LoadButton>
                          <DiscardButton onClick={() => handleDelete(p)}>
                            Discard
                          </DiscardButton>
                        </>
                      ) : (
                        <LoadButton onClick={() => handleConvert(p)}>
                          Re-load
                        </LoadButton>
                      )}
                    </ActionButtonGroupRight>
                  </PatientCard>
                );
              })
            ) : (
              <EmptyStateContainer>
                <RefreshCw size={40} style={{ opacity: 0.2 }} />
                <p>{searchTerm ? "No matching patients found" : `No ${activeTab} registrations in queue`}</p>
              </EmptyStateContainer>
            )}
          </PatientListContainer>
        </RightPanel>
      </Content>
    </Overlay>
  );
};

export default QRRegistrationModal;
