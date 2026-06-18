import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { CheckCircle, XCircle } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

const colors = {
  primary: "#136A63",
  secondary: "#0E524C",
  accent: "#FF8C00",
  background: "#F0F4F8",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#1A202C",
  textSecondary: "#4A5568",
  danger: "#E53E3E",
  success: "#38A169",
};

const PageContainer = styled.div`
  padding: 24px;
  background: ${colors.background};
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 1.5rem;
    color: ${colors.textPrimary};
    font-weight: 600;
  }
`;

const TableContainer = styled.div`
  background: ${colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid ${colors.border};
  }

  th {
    background: #FAFCFF;
    color: ${colors.textSecondary};
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    color: ${colors.textPrimary};
    font-size: 0.95rem;
  }

  tr:hover {
    background: #F8FAFC;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #FEF3C7;
  color: #D97706;
`;

const ActionButton = styled.button`
  background: ${props => props.reject ? colors.danger : colors.success};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 8px;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
  }

  &:disabled {
    background: #CBD5E0;
    cursor: not-allowed;
  }
`;

export default function WardReturnApprovals() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
      const res = await apiRequest(`${HmsBaseUrl}get_pending_ward_returns/`, "GET");
      
      // apiRequest returns { success: true, data: { success: true, data: [...] } }
      const backendResponse = res.data || {};
      
      if (res.success && (backendResponse.success !== false)) {
        setReturns(backendResponse.data || backendResponse || []);
      } else {
        console.error("Failed to fetch returns:", backendResponse.error);
        setReturns([]);
      }
    } catch (e) {
      console.error(e);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleAction = async (billId, returnRequestId, action) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const employeeId = localStorage.getItem("employee_id");

    if (!window.confirm(`Are you sure you want to ${action} this return?`)) return;

    try {
      const payload = {
        Bill_id: billId,
        return_request_id: returnRequestId,
        action: action,
        "auth-user-id": employeeId
      };

      const res = await apiRequest(`${HmsBaseUrl}approve_ward_return/`, "POST", payload);
      const backendResponse = res.data || {};
      
      if (res.success && (backendResponse.success !== false)) {
        alert(backendResponse.message || `Return ${action}d successfully`);
        fetchReturns();
      } else {
        alert(backendResponse.error || backendResponse.message || res.error || "Failed to process return");
      }
    } catch (e) {
      console.error(e);
      alert("Error processing request");
    }
  };

  return (
    <PageContainer>
      <Header>
        <h1>Ward Return Approvals</h1>
        <button onClick={fetchReturns} style={{ padding: "8px 16px", borderRadius: "6px", border: `1px solid ${colors.border}`, background: "white", cursor: "pointer" }}>
          ↻ Refresh
        </button>
      </Header>

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <input 
          type="text" 
          placeholder="Search by Patient, UHID, IP, Bill No..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: `1px solid ${colors.border}` }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", color: colors.textSecondary, fontWeight: 600 }}>From:</label>
          <input 
            type="date" 
            value={fromDate} 
            onChange={e => setFromDate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: `1px solid ${colors.border}` }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", color: colors.textSecondary, fontWeight: 600 }}>To:</label>
          <input 
            type="date" 
            value={toDate} 
            onChange={e => setToDate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: `1px solid ${colors.border}` }}
          />
        </div>
      </div>

      <TableContainer>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: colors.textSecondary }}>Loading pending returns...</div>
        ) : returns.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: colors.textSecondary }}>No pending ward returns.</div>
        ) : (
          <StyledTable>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Ward</th>
                <th>Requested By</th>
                <th>Requested At</th>
                <th>Items Returning</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.filter((req) => {
                let match = true;
                if (searchQuery) {
                  const q = searchQuery.toLowerCase();
                  match = (req.patient_name || "").toLowerCase().includes(q) ||
                          (req.uhid || "").toLowerCase().includes(q) ||
                          (req.ip_number || "").toLowerCase().includes(q) ||
                          (req.Bill_id || "").toLowerCase().includes(q);
                }
                if (match && fromDate) {
                  const reqDate = new Date(req.requested_at);
                  const from = new Date(fromDate);
                  from.setHours(0, 0, 0, 0);
                  if (reqDate < from) match = false;
                }
                if (match && toDate) {
                  const reqDate = new Date(req.requested_at);
                  const to = new Date(toDate);
                  to.setHours(23, 59, 59, 999);
                  if (reqDate > to) match = false;
                }
                return match;
              }).map((req, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.patient_name || "-"}</div>
                    <div style={{ fontSize: "0.8rem", color: colors.textSecondary }}>{req.uhid} | {req.ip_number}</div>
                  </td>
                  <td>{req.ward_name || "-"}</td>
                  <td>{req.requested_by || "-"}</td>
                  <td>{new Date(req.requested_at).toLocaleString()}</td>
                  <td>
                    {req.items.map((itm, idx) => (
                      <div key={idx} style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600 }}>{itm.qty || itm.return_qty}x</span> {itm.item_name || itm.name || "Item"} <span style={{ fontSize: "0.75rem", color: colors.textSecondary }}>(ID: {itm.item_id})</span> <span style={{ color: colors.textSecondary }}>({itm.reason || "No reason"})</span>
                      </div>
                    ))}
                  </td>
                  <td>
                    <StatusBadge>Pending Approval</StatusBadge>
                  </td>
                  <td>
                    <ActionButton onClick={() => handleAction(req.Bill_id, req.return_request_id, "Approve")}>
                      <CheckCircle size={14} /> Approve
                    </ActionButton>
                    <ActionButton reject onClick={() => handleAction(req.Bill_id, req.return_request_id, "Reject")}>
                      <XCircle size={14} /> Reject
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        )}
      </TableContainer>
    </PageContainer>
  );
}
