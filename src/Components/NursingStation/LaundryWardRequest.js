import React, { useState, useEffect } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { colors, Button as GlobalButton, Input, Select, Table, Th, Td, Tr, SectionHeader as GlobalSectionHeader } from "../GlobalStyles";
import { FiTrash2 } from "react-icons/fi";

const Body = styled.div`
  padding: 24px;
  display: flex; flex-direction: column; gap: 24px;
`;

const PatientCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 20px;
`;

const InfoGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
`;

const InfoItem = styled.div`
  display: flex; flex-direction: column; gap: 4px;
`;

const Label = styled.span`
  font-size: 0.7rem; font-weight: 700; color: ${colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const Value = styled.span`
  font-size: 0.95rem; font-weight: 600; color: ${colors.textMain};
`;

const Footer = styled.div`
  padding: 20px 24px; background: ${colors.surface};
  border-top: 1px solid ${colors.border};
  display: flex; justify-content: flex-end; gap: 12px;
  position: sticky; bottom: 0; z-index: 10;
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

const LaundryWardRequest = ({ patient, onClose, onSaved }) => {
  const [laundryItems, setLaundryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [remarks, setRemarks] = useState("");
  const [requestType, setRequestType] = useState("Normal");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

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
    fetchMasterItems();
    fetchHistory();
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
    <>
      <Body>
        <PatientCard>
          <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px dashed ${colors.border}` }}>
            <Label>Patient Information</Label>
            <h2 style={{ margin: "4px 0 0 0", color: colors.primary, fontSize: "1.4rem", fontWeight: 800 }}>
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
          <GlobalSectionHeader>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>Add Laundry Items</h3>
          </GlobalSectionHeader>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "20px" }}>
            <div style={{ flex: 2 }}>
              <Label style={{ display: "block", marginBottom: "6px" }}>Select Item</Label>
              <Select
                value={selectedItemName}
                onChange={e => setSelectedItemName(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "0.9rem" }}
              >
                <option value="">-- Choose Item --</option>
                {laundryItems.map(item => (
                  <option key={item.id} value={item.item_name}>{item.item_name}</option>
                ))}
              </Select>
            </div>
            <div style={{ flex: 1 }}>
              <Label style={{ display: "block", marginBottom: "6px" }}>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={selectedQty}
                onChange={e => setSelectedQty(parseInt(e.target.value) || 1)}
                style={{ width: "100%", padding: "10px", fontSize: "0.9rem" }}
              />
            </div>
            <GlobalButton
              onClick={handleAddItem}
              style={{ padding: "10px 24px", fontSize: "0.9rem", height: "42px" }}
            >
              Add
            </GlobalButton>
          </div>

          {Object.keys(selectedItems).length > 0 && (
            <Table>
              <thead>
                <Tr>
                  <Th>Item Name</Th>
                  <Th style={{ textAlign: "center" }}>Quantity</Th>
                  <Th style={{ textAlign: "right" }}>Action</Th>
                </Tr>
              </thead>
              <tbody>
                {Object.keys(selectedItems).map(itemName => (
                  <Tr key={itemName}>
                    <Td style={{ fontWeight: 600 }}>{getIconForName(itemName)} {itemName}</Td>
                    <Td style={{ textAlign: "center", fontWeight: 700 }}>{selectedItems[itemName]}</Td>
                    <Td style={{ textAlign: "right" }}>
                      <GlobalButton danger style={{ padding: "6px 10px", marginLeft: "auto" }} onClick={() => handleRemoveItem(itemName)}>
                        <FiTrash2 /> Remove
                      </GlobalButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>

        <section style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <GlobalSectionHeader>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>Request Priority</h3>
            </GlobalSectionHeader>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 600 }}>
                <input type="radio" checked={requestType === "Normal"} onChange={() => setRequestType("Normal")} /> Normal
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 600, color: colors.danger }}>
                <input type="radio" checked={requestType === "Urgent"} onChange={() => setRequestType("Urgent")} /> Urgent
              </label>
            </div>
          </div>
          <div style={{ flex: 2, minWidth: "300px" }}>
            <GlobalSectionHeader>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>Remarks</h3>
            </GlobalSectionHeader>
            <Input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Any specific instructions..."
              style={{ width: "100%", padding: "10px", marginTop: "12px" }}
            />
          </div>
        </section>

        {history.length > 0 && (
          <section>
            <GlobalSectionHeader>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.textMain }}>Recent Requests</h3>
            </GlobalSectionHeader>
            <Table>
              <thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Items</Th>
                  <Th>Status</Th>
                </Tr>
              </thead>
              <tbody>
                {history.slice(0, 3).map((h, i) => (
                  <Tr key={i}>
                    <Td>{h.requested_date}</Td>
                    <Td style={{ fontWeight: 600 }}>
                      {Array.isArray(h.items) ? h.items.map(it => `${it.item} (x${it.qty})`).join(', ') : '-'}
                    </Td>
                    <Td>
                      <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", background: h.status === "Completed" ? colors.success + "15" : h.status === "Pending" ? "#fff7ed" : colors.primary + "15", color: h.status === "Completed" ? colors.success : h.status === "Pending" ? "#ea580c" : colors.primary, fontWeight: 700, border: `1px solid ${h.status === "Completed" ? colors.success + "30" : h.status === "Pending" ? "#ffedd5" : colors.primary + "30"}` }}>
                        {h.status}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </section>
        )}
      </Body>

      <Footer>
        <GlobalButton secondary onClick={onClose} style={{ padding: "10px 20px" }}>Cancel</GlobalButton>
        <GlobalButton success onClick={handleSubmit} disabled={saving} style={{ padding: "10px 24px" }}>
          {saving ? "Saving..." : "Submit Request"}
        </GlobalButton>
      </Footer>
    </>
  );
};

export default LaundryWardRequest;
