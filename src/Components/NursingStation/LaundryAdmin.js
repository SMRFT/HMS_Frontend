import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper, Container, colors, Table, Th, Td, Tr, Button, Input, ModalOverlay, ModalContainer, ModalHeader, ModalTitle, ModalBody } from "../GlobalStyles";
import { FiRefreshCcw, FiTrash2, FiEdit2, FiPlus, FiCheckCircle } from "react-icons/fi";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const TabContainer = styled.div`
  display: inline-flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  padding: 6px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  animation: ${fadeIn} 0.5s ease-out;
`;

const Tab = styled.button`
  background: ${p => p.active ? 'white' : 'transparent'};
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: ${p => p.active ? colors.primaryDark : colors.textMuted};
  padding: 10px 24px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s;
  box-shadow: ${p => p.active ? `0 4px 12px ${colors.primary}20` : 'none'};

  &:hover { color: ${colors.primaryDark}; }
`;

const StatusBadge = styled.span`
  padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.8rem;
  background: ${p => p.status === 'Completed' ? '#dcfce7' : p.status === 'Received' ? '#e0e7ff' : '#fef3c7'};
  color: ${p => p.status === 'Completed' ? '#166534' : p.status === 'Received' ? '#3730a3' : '#b45309'};
`;

const FormCard = styled.div`
  background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 24px; display: flex; gap: 16px; align-items: flex-end;
  flex-shrink: 0;
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px; flex: 1;
`;

const Label = styled.label`
  font-size: 0.85rem; font-weight: 700; color: ${colors.textMain};
`;

const StyledInput = styled(Input)`
  border-radius: 12px; padding: 12px 16px; border: 1px solid ${colors.border};
  background: ${colors.background};
  transition: all 0.3s;
  &:focus { border-color: ${colors.primaryDark}; background: white; outline: none; box-shadow: 0 0 0 4px ${colors.primary}20; }
`;

const ActionBtn = styled.button`
  padding: 8px 12px; border-radius: 10px; cursor: pointer; font-size: 1rem;
  background: ${p => p.danger ? '#fee2e2' : p.success ? '#dcfce7' : '#f1f5f9'};
  color: ${p => p.danger ? colors.danger : p.success ? colors.success : colors.primary};
  border: 1px solid ${p => p.danger ? '#fca5a5' : p.success ? '#86efac' : '#cbd5e1'};
  transition: all 0.2s;
  &:hover { background: ${p => p.danger ? '#f87171' : p.success ? '#4ade80' : '#e2e8f0'}; color: white; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
`;

const GradientButton = styled.button`
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  background-size: 200% 200%;
  animation: ${gradientAnimation} 5s ease infinite;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  box-shadow: 0 4px 15px ${colors.primary}40;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${colors.primaryDark}50;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
  animation: ${fadeIn} 0.4s ease-out;

  
  h2 {
    margin: 0;
    color: ${colors.textMain};
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 1.8rem;
    
    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px ${colors.primary}40;
      font-size: 1.2rem;
    }
    span.title-text {
      background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
`;

const ScrollableTableContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 30px ${colors.primary}15;
  animation: ${fadeIn} 0.8s ease-out;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.border};
    border-radius: 4px;
  }
`;

const StyledTh = styled(Th)`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${colors.background};
  color: ${colors.textMain};
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 16px;
  border-bottom: 2px solid ${colors.border};
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
`;

const FilterBar = styled.div`
  display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
  flex-shrink: 0;
  animation: ${fadeIn} 0.6s ease-out;
`;

const LaundryAdmin = () => {
  const [activeTab, setActiveTab] = useState("requests");

  // Requests State
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [reqSearch, setReqSearch] = useState("");
  const [reqFromDate, setReqFromDate] = useState("");
  const [reqToDate, setReqToDate] = useState("");

  // Master State
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemFromDate, setItemFromDate] = useState("");
  const [itemToDate, setItemToDate] = useState("");
  const [form, setForm] = useState({ id: "", item_id: "", item_name: "", price: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
    else fetchItems();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_all_laundry_requests/`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setRequests(res.data.data);
      } else {
        setRequests([]);
      }
    } catch (e) { console.error(e); setRequests([]); }
    setLoadingRequests(false);
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_laundry_items_master/`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setItems(res.data.data);
      } else {
        setItems([]);
      }
    } catch (e) { console.error(e); setItems([]); }
    setLoadingItems(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}update_laundry_status/`, "PATCH", { id, status: newStatus });
      if (res.success) fetchRequests();
    } catch (e) { console.error(e); }
  };

  const saveItem = async () => {
    if (!form.item_name) return alert("Item Name is required");
    try {
      const res = await apiRequest(`${HmsBaseUrl}save_laundry_item_master/`, "POST", form);
      if (res.success) {
        setForm({ id: "", item_id: "", item_name: "", price: "" });
        setIsModalOpen(false);
        fetchItems();
      } else alert(res.error);
    } catch (e) { console.error(e); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}delete_laundry_item_master/`, "POST", { id });
      if (res.success) fetchItems();
    } catch (e) { console.error(e); }
  };

  const parseDate = (dStr) => {
    if (!dStr) return null;
    const parts = dStr.split(" ")[0].split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date(dStr);
  };

  const filteredRequests = requests.filter(req => {
    let match = true;
    if (reqSearch) {
      const q = reqSearch.toLowerCase();
      const p = req.patient_name?.toLowerCase() || "";
      const u = req.uhid?.toLowerCase() || "";
      const ip = req.ipNumber?.toLowerCase() || "";
      if (!p.includes(q) && !u.includes(q) && !ip.includes(q)) match = false;
    }
    if (reqFromDate) {
      const rDate = parseDate(req.requested_date);
      const fDate = new Date(reqFromDate);
      if (rDate && rDate < fDate) match = false;
    }
    if (reqToDate) {
      const rDate = parseDate(req.requested_date);
      const tDate = new Date(reqToDate);
      tDate.setHours(23, 59, 59, 999);
      if (rDate && rDate > tDate) match = false;
    }
    return match;
  });

  const filteredItems = items.filter(it => {
    let match = true;
    if (itemSearch) {
      const q = itemSearch.toLowerCase();
      const name = it.item_name?.toLowerCase() || "";
      if (!name.includes(q)) match = false;
    }
    if (itemFromDate) {
      const cDate = parseDate(it.created_at || it.date);
      const fDate = new Date(itemFromDate);
      if (cDate && cDate < fDate) match = false;
    }
    if (itemToDate) {
      const cDate = parseDate(it.created_at || it.date);
      const tDate = new Date(itemToDate);
      tDate.setHours(23, 59, 59, 999);
      if (cDate && cDate > tDate) match = false;
    }
    return match;
  });

  return (
    <PageWrapper style={{ height: 'calc(100vh - 70px)', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: colors.background, padding: '16px 24px' }}>
      <Container style={{ height: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'transparent', boxShadow: 'none' }}>
        <PageHeader>
          <h2>
            <div className="icon-box">🧺</div>
            <span className="title-text">Laundry Management</span>
          </h2>
          <GradientButton onClick={activeTab === 'requests' ? fetchRequests : fetchItems}>
            <FiRefreshCcw /> Refresh
          </GradientButton>
        </PageHeader>

        <TabContainer>
          <Tab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>Laundry Requests</Tab>
          <Tab active={activeTab === 'master'} onClick={() => setActiveTab('master')}>Item Master</Tab>
        </TabContainer>

        {activeTab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <FilterBar>
              <FormGroup style={{ flex: 'none', width: '250px' }}>
                <Label>Search Patient/UHID</Label>
                <StyledInput placeholder="Search..." value={reqSearch} onChange={e => setReqSearch(e.target.value)} />
              </FormGroup>
              <FormGroup style={{ flex: 'none', width: '160px' }}>
                <Label>From Date</Label>
                <StyledInput type="date" value={reqFromDate} onChange={e => setReqFromDate(e.target.value)} />
              </FormGroup>
              <FormGroup style={{ flex: 'none', width: '160px' }}>
                <Label>To Date</Label>
                <StyledInput type="date" value={reqToDate} onChange={e => setReqToDate(e.target.value)} />
              </FormGroup>
            </FilterBar>
            <ScrollableTableContainer>
              <Table>
                <thead>
                  <Tr>
                    <StyledTh>Date & Time</StyledTh>
                    <StyledTh>Patient Info</StyledTh>
                    <StyledTh>Location</StyledTh>
                    <StyledTh>Items Requested</StyledTh>
                    <StyledTh>Priority</StyledTh>
                    <StyledTh>Status</StyledTh>
                    <StyledTh>Actions</StyledTh>
                  </Tr>
                </thead>
                <tbody>
                  {loadingRequests ? (
                    <Tr><Td colSpan={7} style={{ textAlign: 'center' }}>Loading...</Td></Tr>
                  ) : filteredRequests.length === 0 ? (
                    <Tr><Td colSpan={7} style={{ textAlign: 'center' }}>No requests found.</Td></Tr>
                  ) : (
                    filteredRequests.map(req => (
                      <Tr key={req.id}>
                        <Td>{req.requested_date}</Td>
                        <Td>
                          <div style={{ fontWeight: 700 }}>{req.patient_name}</div>
                          <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>{req.uhid} | {req.ipNumber}</div>
                        </Td>
                        <Td>{req.wardName} / {req.roomNo} / {req.bedNo}</Td>
                        <Td>
                          {Array.isArray(req.items) && req.items.map((it, i) => (
                            <div key={i}>{it.item} (x{it.qty})</div>
                          ))}
                        </Td>
                        <Td>
                          <span style={{ color: req.request_type === 'Urgent' ? colors.danger : colors.textMain, fontWeight: req.request_type === 'Urgent' ? 700 : 500 }}>
                            {req.request_type}
                          </span>
                        </Td>
                        <Td>
                          <select
                            value={req.status}
                            onChange={(e) => updateStatus(req.id, e.target.value)}
                            style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${colors.border}`, background: req.status === "Completed" ? "#dcfce7" : req.status === "Pending" ? "#fef3c7" : "#eff6ff", color: req.status === "Completed" ? "#166534" : req.status === "Pending" ? "#b45309" : "#1d4ed8", fontWeight: 700, outline: "none", cursor: "pointer" }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {req.status === 'Pending' && (
                              <ActionBtn onClick={() => updateStatus(req.id, 'Received')}>Receive</ActionBtn>
                            )}
                            {req.status === 'Received' && (
                              <ActionBtn success onClick={() => updateStatus(req.id, 'Completed')}><FiCheckCircle /></ActionBtn>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </ScrollableTableContainer>
          </div>
        )}

        {activeTab === 'master' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <FilterBar style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', flex: 1, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <FormGroup style={{ flex: 'none', width: '250px' }}>
                  <Label>Search Item</Label>
                  <StyledInput placeholder="Search items..." value={itemSearch} onChange={e => setItemSearch(e.target.value)} />
                </FormGroup>
                <FormGroup style={{ flex: 'none', width: '160px' }}>
                  <Label>From Date</Label>
                  <StyledInput type="date" value={itemFromDate} onChange={e => setItemFromDate(e.target.value)} />
                </FormGroup>
                <FormGroup style={{ flex: 'none', width: '160px' }}>
                  <Label>To Date</Label>
                  <StyledInput type="date" value={itemToDate} onChange={e => setItemToDate(e.target.value)} />
                </FormGroup>
              </div>
              <GradientButton onClick={() => { setForm({ id: "", item_id: "", item_name: "", price: "" }); setIsModalOpen(true); }}>
                <FiPlus /> Add Item
              </GradientButton>
            </FilterBar>

            <ScrollableTableContainer>
              <Table>
                <thead>
                  <Tr>
                    <StyledTh>Item ID</StyledTh>
                    <StyledTh>Item Name</StyledTh>
                    <StyledTh>Price</StyledTh>
                    <StyledTh style={{ width: '120px' }}>Actions</StyledTh>
                  </Tr>
                </thead>
                <tbody>
                  {loadingItems ? (
                    <Tr><Td colSpan={4} style={{ textAlign: 'center' }}>Loading...</Td></Tr>
                  ) : filteredItems.length === 0 ? (
                    <Tr><Td colSpan={4} style={{ textAlign: 'center' }}>No items found.</Td></Tr>
                  ) : (
                    filteredItems.map(item => (
                      <Tr key={item.id}>
                        <Td>{item.item_id || "-"}</Td>
                        <Td style={{ fontWeight: 700 }}>{item.item_name}</Td>
                        <Td>₹{item.price}</Td>
                        <Td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <ActionBtn onClick={() => { setForm({ id: item.id, item_id: item.item_id || "", item_name: item.item_name, price: item.price }); setIsModalOpen(true); }}>
                              <FiEdit2 />
                            </ActionBtn>
                            <ActionBtn danger onClick={() => deleteItem(item.id)}>
                              <FiTrash2 />
                            </ActionBtn>
                          </div>
                        </Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </ScrollableTableContainer>
          </div>
        )}

      </Container>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContainer onClick={e => e.stopPropagation()} style={{ width: '400px', borderRadius: '16px' }}>
            <ModalHeader style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
              <ModalTitle style={{ margin: 0, fontSize: '1.2rem', color: colors.textMain }}>
                {form.id ? "Update Laundry Item" : "Add New Item"}
              </ModalTitle>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: colors.textMuted }}>&times;</button>
            </ModalHeader>
            <ModalBody style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <FormGroup>
                  <Label>Item ID</Label>
                  <StyledInput value={form.item_id || "Auto-generated"} disabled style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
                </FormGroup>
                <FormGroup>
                  <Label>Item Name</Label>
                  <StyledInput
                    placeholder="e.g. Bedsheets"
                    value={form.item_name}
                    onChange={e => setForm({ ...form, item_name: e.target.value })}
                  />
                </FormGroup>
              </div>
              <FormGroup style={{ marginBottom: '24px' }}>
                <Label>Price (Optional)</Label>
                <StyledInput
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                />
              </FormGroup>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button secondary onClick={() => setIsModalOpen(false)} style={{ borderRadius: '10px', padding: '10px 20px' }}>Cancel</Button>
                <GradientButton onClick={saveItem}>{form.id ? "Update" : "Save"}</GradientButton>
              </div>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default LaundryAdmin;
