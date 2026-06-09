import React, { useState, useEffect } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper, Container, colors, Table, Th, Td, Tr, Button, Input } from "../GlobalStyles";
import { FiRefreshCcw, FiTrash2, FiEdit2, FiCheckCircle } from "react-icons/fi";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#3b82f6",    
  primaryDark: "#2563eb", 
  bgGlass: "rgba(255, 255, 255, 0.9)",
  border: "rgba(59, 130, 246, 0.15)",
  danger: "#ef4444",
  success: "#10b981",
  textMain: "#1e293b",
  textMuted: "#64748b",
};

const TabContainer = styled.div`
  display: flex; gap: 20px; border-bottom: 1px solid ${C.border}; margin-bottom: 24px;
`;

const Tab = styled.button`
  background: none; border: none; font-size: 1.1rem; font-weight: 700;
  color: ${p => p.active ? C.primary : C.textMuted};
  padding: 12px 16px; cursor: pointer; position: relative;
  &::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
    height: 3px; background: ${C.primary}; border-radius: 3px 3px 0 0;
    opacity: ${p => p.active ? 1 : 0}; transition: opacity 0.2s;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.8rem;
  background: ${p => p.status === 'Completed' ? '#dcfce7' : p.status === 'Received' ? '#e0e7ff' : '#fef3c7'};
  color: ${p => p.status === 'Completed' ? '#166534' : p.status === 'Received' ? '#3730a3' : '#b45309'};
`;

const FormCard = styled.div`
  background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 24px; display: flex; gap: 16px; align-items: flex-end;
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px; flex: 1;
`;

const Label = styled.label`
  font-size: 0.85rem; font-weight: 700; color: ${C.textMain};
`;

const StyledInput = styled(Input)`
  border-radius: 10px; padding: 12px 16px; border: 1px solid #cbd5e1;
  &:focus { border-color: ${C.primary}; outline: none; box-shadow: 0 0 0 3px ${C.primary}30; }
`;

const ActionBtn = styled(Button)`
  padding: 8px 12px; border-radius: 8px;
  background: ${p => p.danger ? '#fee2e2' : p.success ? '#dcfce7' : '#f1f5f9'};
  color: ${p => p.danger ? C.danger : p.success ? C.success : C.primary};
  border: 1px solid ${p => p.danger ? '#fca5a5' : p.success ? '#86efac' : '#cbd5e1'};
  &:hover { background: ${p => p.danger ? '#f87171' : p.success ? '#4ade80' : '#e2e8f0'}; color: white; }
`;

const LaundryAdmin = () => {
  const [activeTab, setActiveTab] = useState("requests");
  
  // Requests State
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Master State
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [form, setForm] = useState({ id: "", item_name: "", price: "" });

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
        setForm({ id: "", item_name: "", price: "" });
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

  return (
    <PageWrapper>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: C.textMain }}>🧺 Laundry Management</h2>
          <Button onClick={activeTab === 'requests' ? fetchRequests : fetchItems}><FiRefreshCcw style={{marginRight: '8px'}}/>Refresh</Button>
        </div>

        <TabContainer>
          <Tab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>Laundry Requests</Tab>
          <Tab active={activeTab === 'master'} onClick={() => setActiveTab('master')}>Item Master</Tab>
        </TabContainer>

        {activeTab === 'requests' && (
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <Table>
              <thead>
                <Tr>
                  <Th>Date & Time</Th>
                  <Th>Patient Info</Th>
                  <Th>Location</Th>
                  <Th>Items Requested</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </thead>
              <tbody>
                {loadingRequests ? (
                  <Tr><Td colSpan={7} style={{textAlign: 'center'}}>Loading...</Td></Tr>
                ) : requests.length === 0 ? (
                  <Tr><Td colSpan={7} style={{textAlign: 'center'}}>No requests found.</Td></Tr>
                ) : (
                  requests.map(req => (
                    <Tr key={req.id}>
                      <Td>{req.requested_date}</Td>
                      <Td>
                        <div style={{fontWeight: 700}}>{req.patient_name}</div>
                        <div style={{fontSize: '0.8rem', color: C.textMuted}}>{req.uhid} | {req.ipNumber}</div>
                      </Td>
                      <Td>{req.wardName} / {req.roomNo} / {req.bedNo}</Td>
                      <Td>
                        {Array.isArray(req.items) && req.items.map((it, i) => (
                          <div key={i}>{it.item} (x{it.qty})</div>
                        ))}
                      </Td>
                      <Td>
                        <span style={{ color: req.request_type === 'Urgent' ? C.danger : C.textMain, fontWeight: req.request_type === 'Urgent' ? 700 : 500 }}>
                          {req.request_type}
                        </span>
                      </Td>
                      <Td>
                        <select 
                          value={req.status} 
                          onChange={(e) => updateStatus(req.id, e.target.value)}
                          style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${C.border}`, background: req.status === "Completed" ? "#dcfce7" : req.status === "Pending" ? "#fef3c7" : "#eff6ff", color: req.status === "Completed" ? "#166534" : req.status === "Pending" ? "#b45309" : "#1d4ed8", fontWeight: 700, outline: "none", cursor: "pointer" }}
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
          </div>
        )}

        {activeTab === 'master' && (
          <div>
            <FormCard>
              <FormGroup>
                <Label>Item Name</Label>
                <StyledInput 
                  placeholder="e.g. Bedsheets" 
                  value={form.item_name} 
                  onChange={e => setForm({...form, item_name: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <Label>Price (Optional)</Label>
                <StyledInput 
                  type="number" 
                  placeholder="0.00" 
                  value={form.price} 
                  onChange={e => setForm({...form, price: e.target.value})} 
                />
              </FormGroup>
              <Button style={{ padding: '12px 24px', borderRadius: '10px' }} onClick={saveItem}>
                {form.id ? "Update Item" : "Add Item"}
              </Button>
            </FormCard>

            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <Table>
                <thead>
                  <Tr>
                    <Th>Item Name</Th>
                    <Th>Price</Th>
                    <Th style={{width: '120px'}}>Actions</Th>
                  </Tr>
                </thead>
                <tbody>
                  {loadingItems ? (
                    <Tr><Td colSpan={3} style={{textAlign: 'center'}}>Loading...</Td></Tr>
                  ) : items.length === 0 ? (
                    <Tr><Td colSpan={3} style={{textAlign: 'center'}}>No items found.</Td></Tr>
                  ) : (
                    items.map(item => (
                      <Tr key={item.id}>
                        <Td style={{fontWeight: 700}}>{item.item_name}</Td>
                        <Td>₹{item.price}</Td>
                        <Td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <ActionBtn onClick={() => setForm({ id: item.id, item_name: item.item_name, price: item.price })}>
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
            </div>
          </div>
        )}

      </Container>
    </PageWrapper>
  );
};

export default LaundryAdmin;
