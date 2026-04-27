import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper, colors } from "../GlobalStyles";
import { FiSearch, FiRefreshCcw, FiFilter, FiCalendar, FiClock, FiUser, FiInfo } from "react-icons/fi";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: "#10b981",    // Emerald
  primaryDark: "#059669",
  secondary: "#6366f1",  // Indigo
  bgGlass: "rgba(255, 255, 255, 0.7)",
  border: "rgba(226, 232, 240, 0.8)",
  shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const GlassContainer = styled.div`
  background: ${T.bgGlass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${T.border};
  border-radius: 24px;
  padding: 30px;
  box-shadow: ${T.shadow};
  animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderSection = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  margin: 0; font-size: 1.75rem; font-weight: 900;
  background: linear-gradient(135deg, ${T.primaryDark}, ${T.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex; align-items: center; gap: 12px;
`;

const FilterBar = styled.div`
  display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-end;
  background: rgba(255, 255, 255, 0.4);
  padding: 20px; border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
`;

const Label = styled.label`
  font-size: 0.7rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px;
  margin-left: 4px;
`;

const StyledInput = styled.input`
  background: white; border: 1px solid #e2e8f0;
  padding: 10px 16px; border-radius: 12px;
  font-size: 0.9rem; font-weight: 600; color: #1e293b;
  outline: none; transition: all 0.2s;
  &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
`;

const StyledSelect = styled.select`
  background: white; border: 1px solid #e2e8f0;
  padding: 10px 16px; border-radius: 12px;
  font-size: 0.9rem; font-weight: 600; color: #1e293b;
  outline: none; cursor: pointer;
  &:focus { border-color: ${T.primary}; }
`;

const SearchBtn = styled.button`
  background: linear-gradient(135deg, ${T.primary}, ${T.primaryDark});
  color: white; border: none; width: 44px; height: 44px;
  border-radius: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
  transition: all 0.3s;
  &:hover { transform: translateY(-2px) rotate(5deg); box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.3); }
`;

const ExportBtn = styled.button`
  background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;
  padding: 10px 20px; border-radius: 12px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  &:hover { background: #e2e8f0; }
`;

const TableWrapper = styled.div`
  overflow-x: auto; margin-top: 10px;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const GlassTable = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 10px;
`;

const Th = styled.th`
  padding: 15px 20px; text-align: left;
  font-size: 0.75rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 1px;
`;

const Tr = styled.tr`
  transition: all 0.2s;
  &:hover td { transform: scale(1.005); background: rgba(255, 255, 255, 0.9); }
`;

const Td = styled.td`
  padding: 20px; background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  &:first-child { border-left: 1px solid rgba(255, 255, 255, 0.5); border-radius: 16px 0 0 16px; }
  &:last-child { border-right: 1px solid rgba(255, 255, 255, 0.5); border-radius: 0 16px 16px 0; }
`;

const StatusBadge = styled.span`
  padding: 6px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 800;
  display: inline-flex; align-items: center; gap: 6px;
  ${({ status }) => {
    switch (status) {
      case "Delivered": return css`background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; animation: ${pulse} 2s infinite;`;
      case "Received": return css`background: #fef9c3; color: #854d0e; border: 1px solid #fef08a;`;
      case "Cancelled": return css`background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;`;
      default: return css`background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;`;
    }
  }}
`;

const FoodBubble = styled.div`
  background: #f8fafc; padding: 8px 12px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 600; color: #334155;
  border: 1px solid #f1f5f9; margin-top: 8px;
`;

// ─── Component ────────────────────────────────────────────────────────────────
const DietOrderReport = () => {
    const today = new Date().toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [statusFilter, setStatusFilter] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const query = `from_date=${fromDate}&to_date=${toDate}${statusFilter ? `&status=${statusFilter}` : ""}`;
            const res = await apiRequest(`${HmsBaseUrl}get_all_diet_orders/?${query}`, "GET");
            if (res.success && res.data) {
                const dataArray = Array.isArray(res.data) ? res.data : (res.data.data && Array.isArray(res.data.data)) ? res.data.data : [];
                setOrders(dataArray);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (dietId, newStatus) => {
        try {
            const res = await apiRequest(`${HmsBaseUrl}update_diet_status/`, "PATCH", {
                diet_id: dietId,
                status: newStatus
            });
            if (res.success) {
                fetchOrders();
            } else {
                alert(res.error || "Failed to update status.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <PageWrapper style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)", minHeight: "100vh" }}>
            <GlassContainer>
                <HeaderSection>
                    <Title>🥗 Smart Diet Reporting</Title>
                    <ExportBtn disabled={orders.length === 0}>
                        💾 Export Report
                    </ExportBtn>
                </HeaderSection>

                <FilterBar>
                    <FormGroup>
                        <Label><FiCalendar size={10} /> Date From</Label>
                        <StyledInput type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label><FiCalendar size={10} /> Date To</Label>
                        <StyledInput type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label><FiFilter size={10} /> Status Filter</Label>
                        <StyledSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="Ordered">Ordered</option>
                            <option value="Received">Received</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </StyledSelect>
                    </FormGroup>
                    <SearchBtn onClick={fetchOrders}>
                        <FiSearch size={22} />
                    </SearchBtn>
                </FilterBar>

                <TableWrapper>
                    <GlassTable>
                        <thead>
                            <tr>
                                <Th>Order Details</Th>
                                <Th>Patient Profile</Th>
                                <Th>Location</Th>
                                <Th>Diet Plan</Th>
                                <Th>Extras</Th>
                                <Th>Status</Th>
                                <Th style={{ textAlign: "center" }}>Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><Td colSpan="7" style={{ textAlign: "center", padding: "100px", fontWeight: 700, color: "#94a3b8" }}>
                                    <FiRefreshCcw className="spinning" style={{ marginRight: "10px" }} /> Fetching global diet logs...
                                </Td></tr>
                            ) : orders.length === 0 ? (
                                <tr><Td colSpan="7" style={{ textAlign: "center", padding: "100px", fontWeight: 700, color: "#94a3b8" }}>
                                    No records found for the selected period.
                                </Td></tr>
                            ) : (
                                orders.map((o) => (
                                    <Tr key={o.diet_id}>
                                        <Td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>{o.order_date}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    <FiClock size={12} /> {o.order_time}
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <div style={{ fontSize: "1rem", fontWeight: 900, color: T.primary }}>{o.patient_name}</div>
                                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                                                    UHID: <span style={{ color: "#334155" }}>{o.uhid}</span> | IP: <span style={{ color: "#334155" }}>{o.inpatient_number}</span>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>{o.ward_name}</div>
                                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: T.secondary, background: "#e0e7ff", padding: "2px 8px", borderRadius: "6px", width: "fit-content" }}>
                                                    {o.room_no ? `Room ${o.room_no}` : "N/A"}
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1e293b" }}>{o.diet_type}</div>
                                                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>{o.meal_time}</div>
                                                {o.food_items && <FoodBubble>{o.food_items}</FoodBubble>}
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                {o.extra_items?.map((ext, idx) => (
                                                    <span key={idx} style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>• {ext.item} (x{ext.qty})</span>
                                                ))}
                                                {o.attender_count > 0 && (
                                                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#b45309", background: "#fef3c7", padding: "2px 6px", borderRadius: "6px" }}>
                                                        👥 Attenders: {o.attender_count}
                                                    </span>
                                                )}
                                            </div>
                                        </Td>
                                        <Td>
                                            <StatusBadge status={o.status}>
                                                {o.status === "Delivered" && "✅"} 
                                                {o.status === "Received" && "🔔"} 
                                                {o.status === "Cancelled" && "❌"}
                                                {o.status}
                                            </StatusBadge>
                                        </Td>
                                        <Td style={{ textAlign: "center" }}>
                                            <StyledSelect 
                                                value={o.status} 
                                                onChange={(e) => handleStatusUpdate(o.diet_id, e.target.value)}
                                                style={{ fontSize: "0.75rem", padding: "6px 10px" }}
                                            >
                                                <option value="Ordered">Ordered</option>
                                                <option value="Received">Received</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </StyledSelect>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </GlassTable>
                </TableWrapper>
            </GlassContainer>
            
            <style>
                {`
                .spinning { animation: spin 2s linear infinite; }
                @keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
                `}
            </style>
        </PageWrapper>
    );
};

export default DietOrderReport;
