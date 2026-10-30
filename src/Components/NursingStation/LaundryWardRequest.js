import React, { useState, useEffect } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { colors, Button as GlobalButton, Input, Select, Table, Th, Td, Tr, SectionHeader as GlobalSectionHeader } from "../GlobalStyles";
import { FiTrash2 } from "react-icons/fi";

const Body = styled.div`
  padding: 14px 20px;
  display: flex; flex-direction: column; gap: 14px;
`;

const PatientPanel = styled.div`
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 4px;
    background: #0d8a7a;
  }

  .patient-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .patient-divider {
    width: 1px;
    height: 30px;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 8px 12px;
    .patient-divider { display: none; }
  }
`;

const PatientAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e6f7f5;
  color: #0d8a7a;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #b2e5df;
  flex-shrink: 0;
`;

const PatientGrid = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1;
`;

const PatientMeta = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  span.label {
    font-size: 0.62rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    line-height: 1.1;
  }
  span.val {
    font-size: 0.82rem;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

    const foundItem = laundryItems.find(li => li.item_name === selectedItemName);
    const rate = foundItem ? parseFloat(foundItem.price) || 0 : 0;
    const item_id = foundItem ? foundItem.item_id : "";

    setSelectedItems(prev => {
      const existing = prev[selectedItemName] || { qty: 0, rate: rate, item_id: item_id };
      return {
        ...prev,
        [selectedItemName]: {
          qty: existing.qty + selectedQty,
          rate: rate,
          item_id: item_id
        }
      };
    });

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
      const itemsPayload = itemKeys.map(k => {
        return {
          item_id: selectedItems[k].item_id,
          item: k,
          qty: selectedItems[k].qty,
          rate: selectedItems[k].rate,
          total: selectedItems[k].qty * selectedItems[k].rate
        };
      });

      const totalAmount = itemsPayload.reduce((acc, curr) => acc + curr.total, 0);

      const payload = {
        uhid: rp.uhid,
        ipNumber: rp.ipNo,
        patient_name: rp.name,
        wardName: rp.ward,
        roomNo: rp.room,
        bedNo: rp.bed,
        items: itemsPayload,
        total_amount: totalAmount,
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
        <PatientPanel>
          <div className="patient-left">
            <PatientAvatar>
              {rp.name.split(" ").map(n => n[0]).filter(Boolean).join("").slice(0, 2) || "P"}
            </PatientAvatar>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                {rp.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                UHID: <span style={{ color: "#0d8a7a" }}>{rp.uhid}</span> · IP: <span style={{ color: "#0d8a7a" }}>{rp.ipNo}</span>
              </div>
            </div>
          </div>

          <div className="patient-divider" />

          <PatientGrid>
            <PatientMeta>
              <span className="label">Ward</span>
              <span className="val">{rp.ward}</span>
            </PatientMeta>
            <PatientMeta>
              <span className="label">Room · Bed</span>
              <span className="val">Room {rp.room} · Bed {rp.bed}</span>
            </PatientMeta>
          </PatientGrid>
        </PatientPanel>

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
                  <option key={item.id} value={item.item_name}>
                    {item.item_name} {item.price ? `(₹${item.price})` : ""}
                  </option>
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
                  <Th style={{ textAlign: "right" }}>Rate</Th>
                  <Th style={{ textAlign: "center" }}>Quantity</Th>
                  <Th style={{ textAlign: "right" }}>Total</Th>
                  <Th style={{ textAlign: "right" }}>Action</Th>
                </Tr>
              </thead>
              <tbody>
                {Object.keys(selectedItems).map(itemName => {
                  const itemInfo = selectedItems[itemName];
                  const total = itemInfo.qty * itemInfo.rate;
                  return (
                    <Tr key={itemName}>
                      <Td style={{ fontWeight: 600 }}>{getIconForName(itemName)} {itemName}</Td>
                      <Td style={{ textAlign: "right" }}>₹{Number(itemInfo.rate).toFixed(2)}</Td>
                      <Td style={{ textAlign: "center", fontWeight: 700 }}>{itemInfo.qty}</Td>
                      <Td style={{ textAlign: "right", fontWeight: 700 }}>₹{total.toFixed(2)}</Td>
                      <Td style={{ textAlign: "right" }}>
                        <GlobalButton danger style={{ padding: "6px 10px", marginLeft: "auto" }} onClick={() => handleRemoveItem(itemName)}>
                          <FiTrash2 /> Remove
                        </GlobalButton>
                      </Td>
                    </Tr>
                  );
                })}
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
                  <Th style={{ textAlign: "right" }}>Total Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </thead>
              <tbody>
                {history.slice(0, 3).map((h, i) => (
                  <Tr key={i}>
                    <Td>{h.requested_date}</Td>
                    <Td style={{ fontWeight: 600 }}>
                      {Array.isArray(h.items)
                        ? h.items.map(it => `${it.item} (x${it.qty})${it.rate ? ` @ ₹${it.rate}` : ""}`).join(', ')
                        : '-'}
                    </Td>
                    <Td style={{ textAlign: "right", fontWeight: 700 }}>
                      ₹{h.total_amount ? Number(h.total_amount).toFixed(2) : "0.00"}
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
