import React, { useState } from 'react';
import styled from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';
import { X, RefreshCw, Trash2, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  backdrop-filter: blur(5px);
`;

const Content = styled.div`
  background: white;
  width: 90%;
  max-width: 900px; /* Increased width */
  height: 80vh; /* Fixed height for better list scrolling */
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  display: flex;
  overflow: hidden;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
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
  transition: all 0.2s;
  
  &:hover {
    color: #ef4444;
    border-color: #ef4444;
    transform: rotate(90deg);
  }
`;

const LeftPanel = styled.div`
  width: 350px;
  background: #f8fafc;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
`;

const RightPanel = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0 0 30px 0;
  color: #64748b;
  font-size: 15px;
`;

const QRCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const QRLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  text-align: center;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ListTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CountBadge = styled.span`
  background: #e0f2fe;
  color: #0284c7;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
`;

const PatientList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;

  /* Custom Scrollbar */
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

const PatientItem = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  /* Status Indicator Strip */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.consumed ? '#22c55e' : '#3b82f6'};
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: #cbd5e1;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 10px;
`;

const PatientName = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
`;

const PatientMeta = styled.div`
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  ${props => props.variant === 'primary' && `
    background: #eff6ff;
    color: #2563eb;
    &:hover {
      background: #dbeafe;
      border-color: #bfdbfe;
    }
  `}

  ${props => props.variant === 'danger' && `
    background: #fef2f2;
    color: #ef4444;
    &:hover {
      background: #fee2e2;
      border-color: #fecaca;
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: #f1f5f9;
    color: #475569;
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
`;

const PageButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid ${props => props.active ? '#3b82f6' : '#e2e8f0'};
  background: ${props => props.active ? '#eff6ff' : 'white'};
  color: ${props => props.active ? '#2563eb' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  gap: 16px;
`;

const HistoryToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto; /* Push to bottom of left panel if needed, or keep in header */
  font-size: 13px;
  color: #64748b;
  margin-top: 20px;
  
  input {
    accent-color: #3b82f6;
    width: 16px;
    height: 16px;
  }
`;

const QRRegistrationModal = ({ isOpen, onClose, onDataReceived }) => {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingList, setPendingList] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Poll for pending registrations
  React.useEffect(() => {
    let interval;
    if (isOpen) {
      fetchPendingList(); // Initial fetch
      interval = setInterval(fetchPendingList, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isOpen, showAll]);

  const fetchPendingList = async () => {
    try {
      const status = showAll ? 'all' : 'pending';
      const response = await axios.get(`${Hmsbaseurl}get-pending-qr-registrations/?status=${status}`);
      setPendingList(response.data);
    } catch (error) {
      console.error("Error fetching pending list", error);
    }
  };



  const handleConvert = async (patient) => {
    try {
      // Mark as consumed
      await axios.post(`${Hmsbaseurl}consume-qr-registration/`, {
        session_id: patient.session_id
      });

      // Fill form
      onDataReceived(patient.full_data);
      onClose();
    } catch (error) {
      console.error("Error consuming registration", error);
      alert("Failed to process registration.");
      fetchPendingList();
    }
  };

  const handleDelete = async (patient) => {
    if (!window.confirm("Are you sure you want to remove this registration from the queue?")) return;

    try {
      // We use the same 'consume' endpoint to mark it as processed/removed from pending view
      // But we DO NOT call onDataReceived
      await axios.post(`${Hmsbaseurl}consume-qr-registration/`, {
        session_id: patient.session_id
      });
      fetchPendingList(); // Refresh list immediately
    } catch (error) {
      console.error("Error deleting registration", error);
      alert("Failed to delete registration.");
    }
  };

  // Use current pendingList for operations
  // Logic: Filter -> Sort (Newest First) -> Paginate
  const filteredList = pendingList
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.mobile && p.mobile.includes(searchTerm))
    )
    // Assuming the ID or order implies recency. If we want "Recently Added" (Newest First), 
    // and if API returns Oldest First (standard list), we reverse.
    // If API returns Newest First, we don't need reverse. 
    // For now, let's reverse it to show newest at top as default typically desired.
    .reverse();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (!isOpen) return null;

  const registrationUrl = `${window.location.origin}/HMS/MobileRegistration`;

  return (
    <Overlay>
      <Content>
        <CloseButton onClick={onClose}><X size={20} /></CloseButton>

        {/* Left Panel: QR Code and Instructions */}
        <LeftPanel>
          <div style={{ textAlign: 'center' }}>
            <Title>Scan to Register</Title>
            <Subtitle>Step 1: Ask patient to scan this QR code</Subtitle>
          </div>

          <QRCard>
            <QRCodeCanvas value={registrationUrl} size={180} />
            <QRLabel>Scan with Phone Camera</QRLabel>
          </QRCard>

          <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            <p>Detailed form will open on their phone.</p>
            <p>Once submitted, they will appear in the list.</p>
          </div>
        </LeftPanel>

        {/* Right Panel: Patient List */}
        <RightPanel>
          <ListHeader>
            <ListTitle>
              Incoming Registrations
              <CountBadge>{pendingList.filter(p => !p.is_consumed).length}</CountBadge>
            </ListTitle>

            {/* History Toggle */}
            <HistoryToggle>
              <input
                type="checkbox"
                id="showAll"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              <label htmlFor="showAll" style={{ cursor: 'pointer' }}>Show History</label>
            </HistoryToggle>
          </ListHeader>

          {/* Search Bar */}
          <SearchContainer>
            <SearchIconWrapper>
              <Search size={16} />
            </SearchIconWrapper>
            <SearchInput
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page
              }}
            />
          </SearchContainer>

          {currentItems.length > 0 ? (
            <>
              <PatientList>
                {currentItems.map((p) => (
                  <PatientItem key={p.session_id} consumed={p.is_consumed}>
                    <PatientInfo>
                      <PatientName>{p.name}</PatientName>
                      <PatientMeta>
                        <span>{p.mobile}</span>
                        <span>•</span>
                        <span>{p.age_gender}</span>
                        {p.is_consumed && <span style={{ color: '#22c55e', fontWeight: 600 }}>(Processed)</span>}
                      </PatientMeta>
                    </PatientInfo>

                    <Actions>
                      {!p.is_consumed && (
                        <>
                          <ActionButton variant="danger" onClick={() => handleDelete(p)} title="Delete from Queue">
                            <Trash2 size={16} />
                          </ActionButton>
                          <ActionButton variant="primary" onClick={() => handleConvert(p)}>
                            Convert <ArrowRight size={16} />
                          </ActionButton>
                        </>
                      )}
                      {p.is_consumed && (
                        <ActionButton variant="secondary" onClick={() => handleConvert(p)}>
                          Re-use
                        </ActionButton>
                      )}
                    </Actions>
                  </PatientItem>
                ))}
              </PatientList>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <PaginationContainer>
                  <PageButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </PageButton>

                  {/* Simple pagination: show all page numbers or limit if too many */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <PageButton
                      key={number}
                      active={number === currentPage}
                      onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </PageButton>
                  ))}

                  <PageButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </PageButton>
                </PaginationContainer>
              )}
            </>
          ) : (
            <EmptyState>
              <RefreshCw size={48} className="animate-spin" style={{ opacity: 0.2 }} />
              <p>{searchTerm ? "No results found" : "Waiting for new submissions..."}</p>
            </EmptyState>
          )}
        </RightPanel>
      </Content>
    </Overlay>
  );
};

export default QRRegistrationModal;
