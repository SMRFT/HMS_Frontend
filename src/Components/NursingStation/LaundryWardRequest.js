import React, { useState, useEffect } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#3b82f6",    // Blue 500
  primaryDark: "#2563eb", // Blue 600
  primaryLight: "#eff6ff", // Blue 50
  accent: "#8b5cf6",     // Violet 500
  textMain: "#1e293b",    // Slate 800
  textMuted: "#64748b",   // Slate 500
  bgGlass: "rgba(255, 255, 255, 0.9)",
  border: "rgba(59, 130, 246, 0.15)",
  shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
  danger: "#ef4444",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const GlobalModalStyle = createGlobalStyle`
  .laundry-modal-open { overflow: hidden; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: ${C.bgGlass};
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  width: 720px; max-width: 100%;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: ${C.shadow};
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  position: relative;
`;

const Header = styled.div`
  padding: 24px 30px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid ${C.border};
  display: flex; justify-content: space-between; align-items: center;
`;

const Title = styled.h2`
  margin: 0; font-size: 1.25rem; font-weight: 800;
  background: linear-gradient(135deg, ${C.primaryDark}, ${C.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex; align-items: center; gap: 10px;
`;

const CloseBtn = styled.button`
  background: #f1f5f9; border: none; width: 36px; height: 36px;
  border-radius: 50%; color: ${C.textMuted}; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover { background: #fee2e2; color: ${C.danger}; transform: rotate(90deg); }
`;

const Body = styled.div`
  padding: 30px; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 28px;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const PatientCard = styled.div`
  background: linear-gradient(135deg, #ffffff, ${C.primaryLight});
  border: 1px solid ${C.border};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.05);
`;

const InfoGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
`;

const InfoItem = styled.div`
  display: flex; flex-direction: column; gap: 4px;
`;

const Label = styled.span`
  font-size: 0.65rem; font-weight: 800; color: ${C.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
`;

const Value = styled.span`
  font-size: 0.95rem; font-weight: 700; color: ${C.textMain};
`;

const SectionHeader = styled.h3`
  font-size: 0.85rem; font-weight: 800; color: ${C.textMain};
  margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;
  text-transform: uppercase; letter-spacing: 0.5px;
  &::before { content: ''; width: 4px; height: 16px; background: ${C.primary}; border-radius: 2px; }
`;

const ItemCard = styled.div`
  background: ${({ active }) => (active ? C.primaryLight : "white")};
  border: 2px solid ${({ active }) => (active ? C.primary : "transparent")};
  padding: 16px 20px; border-radius: 16px; cursor: pointer;
  display: flex; align-items: center; gap: 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
`;

const Footer = styled.div`
  padding: 24px 30px; background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid ${C.border};
  display: flex; justify-content: flex-end; gap: 12px;
`;

const Button = styled.button`
  padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 0.95rem;
  border: none; cursor: pointer; transition: all 0.3s;
`;

const PrimaryBtn = styled(Button)`
  background: linear-gradient(135deg, ${C.primary}, ${C.primaryDark});
  color: white; box-shadow: 0 10px 20px -5px ${C.primary}50;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px -5px ${C.primary}70; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SecondaryBtn = styled(Button)`
  background: #f1f5f9; color: ${C.textMain};
  &:hover { background: #e2e8f0; }
`;

const getIconForName = (name) => {
  const n = name.toLowerCase();
  if (n.includes('bedsheet')) return "🛏️";
  if (n.includes('pillow')) return "🛌";
  if (n.includes('cloth') || n.includes('gown')) return "👕";
  if (n.includes('towel')) return "🧼";
  if (n.includes('blanket')) return "🧣";
  return "🧺";
};

const LaundryWardRequest = ({ patient, HmsBaseUrl, onClose, onSaved }) => {
  const [laundryItems, setLaundryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [remarks, setRemarks] = useState("");
  const [requestType, setRequestType] = useState("Normal");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);

  const pd = patient?.patient_details || {};
  const rp = {
    uhid: patient?.uhid || pd.uhid || "-",
    ipNo: patient?.ipNumber || pd.ipNumber || "-",
    name: [
      patient?.salutation ?? pd.salutation,
      patient?.firstName ?? pd.firstName,
      patient?.lastName ?? pd.lastName,
    ].filter(Boolean).join(" ") || "Patient",
    room: patient?.roomNo || pd.roomNo || patient?.room_no || "-",
    bed: patient?.bedNo || pd.bedNo || "-",
    ward: patient?.ward_name || pd.ward_name || "-",
  };

  useEffect(() => {
    document.body.classList.add("laundry-modal-open");
    fetchMasterItems();
    fetchHistory();
    return () => document.body.classList.remove("laundry-modal-open");
  }, [patient]);

  const fetchMasterItems = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_laundry_items_master/`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setLaundryItems(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setLaundryItems(res.data.data);
      } else {
        setLaundryItems([]);
      }
    } catch (e) { console.error(e); setLaundryItems([]); }
  };

  const fetchHistory = async () => {
    if (!rp.uhid || rp.uhid === "-") return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_laundry_requests/?uhid=${rp.uhid}&ipNumber=${rp.ipNo}`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setHistory(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setHistory(res.data.data);
      } else {
        setHistory([]);
      }
    } catch (e) { console.error(e); setHistory([]); }
  };

  const handleAddItem = () => {
    if (!selectedItemName) return;
    if (selectedQty < 1) return;
    
    setSelectedItems(prev => ({
      ...prev,
      [selectedItemName]: (prev[selectedItemName] || 0) + selectedQty
    }));
    
    setSelectedItemName("");
    setSelectedQty(1);
  };

  const handleRemoveItem = (name) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async () => {
    const itemKeys = Object.keys(selectedItems);
    if (itemKeys.length === 0) return alert("Please select at least one laundry item.");
    
    setSaving(true);
    try {
      const itemsPayload = itemKeys.map(k => ({
        item: k,
        qty: selectedItems[k]
      }));

      const payload = {
        uhid: rp.uhid,
        ipNumber: rp.ipNo,
        patient_name: rp.name,
        wardName: rp.ward,
        roomNo: rp.room,
        bedNo: rp.bed,
        items: itemsPayload,
        request_type: requestType,
        remarks: remarks,
        requested_by: localStorage.getItem("employee_id") || "Unknown"
      };

      const res = await apiRequest(`${HmsBaseUrl}save_laundry_request/`, "POST", payload);
      if (res.success) {
        setSelectedItems({});
        setRemarks("");
        fetchHistory();
        onSaved && onSaved();
      } else {
        alert(res.error || "Failed to save request");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <GlobalModalStyle />
      <ModalContainer>
        <Header>
          <Title>🧺 Laundry Request</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Body>
          <PatientCard>
            <div style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: `1px dashed ${C.border}` }}>
              <Label>Patient Information</Label>
              <h2 style={{ margin: "4px 0 0 0", color: C.textMain, fontSize: "1.4rem", fontWeight: 900 }}>
                {rp.name}
              </h2>
            </div>
            <InfoGrid>
              <InfoItem>
                <Label>UHID</Label>
                <Value>{rp.uhid}</Value>
              </InfoItem>
              <InfoItem>
                <Label>IP Number</Label>
                <Value>{rp.ipNo}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Location</Label>
                <Value>{rp.ward} / {rp.room} / {rp.bed}</Value>
              </InfoItem>
            </InfoGrid>
          </PatientCard>

          <section>
            <SectionHeader>Add Laundry Items</SectionHeader>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "20px" }}>
              <div style={{ flex: 2 }}>
                <Label style={{ display: "block", marginBottom: "6px" }}>Select Item</Label>
                <select 
                  value={selectedItemName} 
                  onChange={e => setSelectedItemName(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${C.border}`, outline: "none", fontSize: "0.9rem", background: "white" }}
                >
                  <option value="">-- Choose Item --</option>
                  {laundryItems.map(item => (
                    <option key={item.id} value={item.item_name}>{item.item_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <Label style={{ display: "block", marginBottom: "6px" }}>Quantity</Label>
                <input 
                  type="number" 
                  min="1" 
                  value={selectedQty}
                  onChange={e => setSelectedQty(parseInt(e.target.value) || 1)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${C.border}`, outline: "none", fontSize: "0.9rem" }}
                />
              </div>
              <Button 
                onClick={handleAddItem}
                style={{ background: C.primaryLight, color: C.primaryDark, padding: "10px 20px", border: `1px solid ${C.primary}`, borderRadius: "10px", fontWeight: 700 }}
              >
                Add
              </Button>
            </div>

            {Object.keys(selectedItems).length > 0 && (
              <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead style={{ borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>
                    <tr>
                      <th style={{ textAlign: "left", paddingBottom: "10px" }}>Item Name</th>
                      <th style={{ textAlign: "center", paddingBottom: "10px" }}>Quantity</th>
                      <th style={{ textAlign: "right", paddingBottom: "10px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(selectedItems).map(itemName => (
                      <tr key={itemName}>
                        <td style={{ paddingTop: "10px", fontWeight: 600 }}>{getIconForName(itemName)} {itemName}</td>
                        <td style={{ paddingTop: "10px", textAlign: "center", fontWeight: 800 }}>{selectedItems[itemName]}</td>
                        <td style={{ paddingTop: "10px", textAlign: "right" }}>
                          <button onClick={() => handleRemoveItem(itemName)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontWeight: 700 }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section style={{ display: "flex", gap: "20px" }}>
             <div style={{ flex: 1 }}>
                <SectionHeader>Request Priority</SectionHeader>
                <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontWeight: 600 }}>
                        <input type="radio" checked={requestType === "Normal"} onChange={() => setRequestType("Normal")} /> Normal
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontWeight: 600, color: C.danger }}>
                        <input type="radio" checked={requestType === "Urgent"} onChange={() => setRequestType("Urgent")} /> Urgent
                    </label>
                </div>
             </div>
             <div style={{ flex: 2 }}>
                <SectionHeader>Remarks</SectionHeader>
                <input 
                  type="text" 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)} 
                  placeholder="Any specific instructions..." 
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${C.border}`, outline: "none", fontSize: "0.9rem" }}
                />
             </div>
          </section>

          {history.length > 0 && (
            <section>
                <SectionHeader>Recent Requests</SectionHeader>
                <div style={{ background: "#f8fafc", borderRadius: "16px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead style={{ background: "#f1f5f9" }}>
                      <tr>
                        <th style={{ padding: "12px 15px", textAlign: "left" }}>Date</th>
                        <th style={{ padding: "12px 15px", textAlign: "left" }}>Items</th>
                        <th style={{ padding: "12px 15px", textAlign: "left" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 3).map((h, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px 15px" }}>{h.requested_date}</td>
                          <td style={{ padding: "12px 15px", fontWeight: 600 }}>
                              {Array.isArray(h.items) ? h.items.map(it => `${it.item} (x${it.qty})`).join(', ') : '-'}
                          </td>
                          <td style={{ padding: "12px 15px" }}>
                            <span style={{ padding: "4px 8px", borderRadius: "6px", background: h.status === "Completed" ? "#dcfce7" : h.status === "Pending" ? "#fef3c7" : "#eff6ff", color: h.status === "Completed" ? "#166534" : h.status === "Pending" ? "#b45309" : "#1d4ed8", fontWeight: 800 }}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </section>
          )}
        </Body>

        <Footer>
          <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Submit Request"}
          </PrimaryBtn>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

export default LaundryWardRequest;
