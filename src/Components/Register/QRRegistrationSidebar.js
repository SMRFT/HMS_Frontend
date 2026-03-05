
import React, { useState } from 'react';
import styled from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';
import { RefreshCw, UserCheck } from 'lucide-react';
import axios from 'axios';

const SidebarContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 24px;
  border: 1px solid #e2e8f0;
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0 0 20px 0;
  color: #64748b;
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
`;

const QRContainer = styled.div`
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const StatusText = styled.div`
  margin-top: 15px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  font-style: italic;
`;

const PatientList = styled.div`
  width: 100%;
  margin-top: 10px;
  flex: 1;
  overflow-y: auto;
  border-top: 1px solid #e2e8f0;
  padding-top: 15px;
`;

const PatientItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    transform: translateX(4px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${props => props.consumed ? '#22c55e' : '#3b82f6'};
    opacity: 0.8;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PatientName = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PatientMeta = styled.span`
  font-size: 11px;
  color: #64748b;
`;

const ActionButton = styled.button`
  background: ${props => props.consumed ? '#dcfce7' : '#dbeafe'};
  color: ${props => props.consumed ? '#166534' : '#1e40af'};
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    filter: brightness(0.95);
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 15px;
  font-size: 13px;
  width: 100%;
  justify-content: center;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
`;

const ListHeader = styled.div`
  width: 100%;
  text-align: left;
  font-weight: 700;
  color: #334155;
  font-size: 14px;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Badge = styled.span`
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
`;

const QRRegistrationSidebar = ({ onDataReceived }) => {
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pendingList, setPendingList] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    // Generate session on mount
    React.useEffect(() => {
        generateSession();
        return () => {
            setSessionId(null);
            setPendingList([]);
        };
    }, []);

    // Poll for pending registrations
    React.useEffect(() => {
        const interval = setInterval(fetchPendingList, 3000); // Poll every 3 seconds
        fetchPendingList(); // Initial fetch
        return () => clearInterval(interval);
    }, [showAll]);

    const fetchPendingList = async () => {
        try {
            const status = showAll ? 'all' : 'pending';
            const response = await axios.get(`${Hmsbaseurl}get-pending-qr-registrations/?status=${status}`);
            setPendingList(response.data);
        } catch (error) {
            console.error("Error fetching pending list", error);
        }
    };

    const generateSession = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${Hmsbaseurl}generate-qr-session/`);
            setSessionId(response.data.session_id);
        } catch (error) {
            console.error("Error generating QR session", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = async (patient) => {
        try {
            // Mark as consumed
            await axios.post(`${Hmsbaseurl}consume-qr-registration/`, {
                session_id: patient.session_id
            });

            // Fill form
            onDataReceived(patient.full_data);

            // Re-fetch immediately to update status
            fetchPendingList();

        } catch (error) {
            console.error("Error consuming registration", error);
            alert("Failed to retrieve patient data. It may have already been processed.");
            fetchPendingList();
        }
    };

    const registrationUrl = sessionId ? `${window.location.origin}/MobileRegistration?session_id=${sessionId}` : "";

    return (
        <SidebarContainer>
            <Title>Smart Registration</Title>
            <Subtitle>Scan QR to fast-track patient details.</Subtitle>

            {loading ? (
                <div>Loading QR...</div>
            ) : sessionId ? (
                <>
                    <QRContainer>
                        <QRCodeCanvas value={registrationUrl} size={140} level="H" />
                    </QRContainer>

                    <ListHeader>
                        Incoming Queue <Badge>{pendingList.length}</Badge>
                    </ListHeader>

                    <ToggleContainer>
                        <input
                            type="checkbox"
                            id="showAllSidebar"
                            checked={showAll}
                            onChange={(e) => setShowAll(e.target.checked)}
                            style={{ accentColor: '#0d9488' }}
                        />
                        <label htmlFor="showAllSidebar" style={{ color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
                            Show History
                        </label>
                    </ToggleContainer>

                    {pendingList.length > 0 ? (
                        <PatientList>
                            {pendingList.map((p) => (
                                <PatientItem
                                    key={p.session_id}
                                    onClick={() => handleSelectPatient(p)}
                                    consumed={p.is_consumed}
                                >
                                    <PatientInfo>
                                        <PatientName>
                                            {p.name}
                                        </PatientName>
                                        <PatientMeta>{p.mobile}</PatientMeta>
                                        <PatientMeta>{p.age_gender}</PatientMeta>
                                    </PatientInfo>
                                    <ActionButton consumed={p.is_consumed}>
                                        {p.is_consumed ? 'Load' : 'Fill'}
                                    </ActionButton>
                                </PatientItem>
                            ))}
                        </PatientList>
                    ) : (
                        <StatusText>
                            <RefreshCw size={14} className="animate-spin" />
                            Waiting for scans...
                        </StatusText>
                    )}
                </>
            ) : (
                <div>Error. <button onClick={generateSession}>Retry</button></div>
            )}
        </SidebarContainer>
    );
};

export default QRRegistrationSidebar;
