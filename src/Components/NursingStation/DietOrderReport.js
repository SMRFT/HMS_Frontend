import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper, colors } from "../GlobalStyles";
import { FiSearch, FiRefreshCcw, FiFilter, FiCalendar, FiClock, FiUser, FiInfo, FiPrinter, FiDownload, FiFileText, FiX } from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary: "#10b981",    // Emerald
  primaryDark: "#059669",
  secondary: "#6366f1",  // Indigo
  bgGlass: "rgba(255, 255, 255, 0.75)",
  border: "rgba(226, 232, 240, 0.8)",
  shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const GlassContainer = styled.div`
  background: ${T.bgGlass};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid ${T.border};
  border-radius: 28px;
  padding: 25px;
  box-shadow: ${T.shadow};
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) { padding: 15px; border-radius: 20px; }
  @media print { background: white; border: none; padding: 0; box-shadow: none; backdrop-filter: none; }
`;

const HeaderSection = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 25px; flex-wrap: wrap; gap: 15px;
  @media print { display: none; }
`;

const Title = styled.h2`
  margin: 0; font-size: 1.6rem; font-weight: 900;
  background: linear-gradient(135deg, ${T.primaryDark}, ${T.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex; align-items: center; gap: 12px;
  @media (max-width: 480px) { font-size: 1.3rem; }
`;

const FilterGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 15px; margin-bottom: 25px;
  background: rgba(255, 255, 255, 0.3);
  padding: 15px; border-radius: 20px;
  @media print { display: none; }
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
`;

const Label = styled.label`
  font-size: 0.7rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const StyledInput = styled.input`
  background: white; border: 1px solid #e2e8f0;
  padding: 10px 12px; border-radius: 12px;
  font-size: 0.9rem; font-weight: 600; outline: none; width: 100%; box-sizing: border-box;
  &:focus { border-color: ${T.primary}; }
`;

const StyledSelect = styled.select`
  background: white; border: 1px solid #e2e8f0;
  padding: 10px 12px; border-radius: 12px;
  font-size: 0.9rem; font-weight: 600; cursor: pointer; outline: none; width: 100%; box-sizing: border-box;
  &:focus { border-color: ${T.primary}; }
`;

const ActionBtn = styled.button`
  background: ${({ variant }) => variant === "primary" ? `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})` : "#fff"};
  color: ${({ variant }) => variant === "primary" ? "white" : "#475569"};
  border: 1px solid #e2e8f0;
  padding: 10px 16px; border-radius: 12px; font-weight: 800; font-size: 0.8rem;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;
  flex: 1; min-width: 120px; justify-content: center;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  @media (max-width: 480px) { padding: 8px 12px; font-size: 0.75rem; }
`;

const TableScrollArea = styled.div`
  max-height: 60vh; overflow: auto; border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  @media print { max-height: none; overflow: visible; }
`;

const GlassTable = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0;
  min-width: 850px;
  @media print { border-collapse: collapse; min-width: 100%; }
`;

const Th = styled.th`
  position: sticky; top: 0; z-index: 10;
  background: #f8fafc; padding: 14px 15px; text-align: left;
  font-size: 0.7rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 1px;
  border-bottom: 2px solid #f1f5f9;
`;

const Tr = styled.tr`
  &:hover td { background: rgba(255, 255, 255, 0.9); }
`;

const Td = styled.td`
  padding: 15px; background: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid #f1f5f9; font-size: 0.85rem;
  @media print { border: 1px solid #eee; background: white !important; }
`;

const StatusBadge = styled.span`
  padding: 5px 12px; border-radius: 10px; font-size: 0.7rem; font-weight: 800;
  display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
  ${({ status }) => {
    switch (status) {
      case "Delivered": return css`background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;`;
      case "Received": return css`background: #fef9c3; color: #854d0e; border: 1px solid #fef08a;`;
      case "Cancelled": return css`background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;`;
      default: return css`background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;`;
    }
  }}
`;

const SearchBtn = styled.button`
  background: linear-gradient(135deg, ${T.primary}, ${T.primaryDark});
  color: white; border: none; width: 100%; height: 44px;
  border-radius: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover { opacity: 0.9; transform: scale(0.98); }
`;

const PrintBtn = styled.button`
  background: #f1f5f9; border: none; color: ${T.primary};
  width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: #e2e8f0; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
const DietOrderReport = () => {
    const today = new Date().toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [statusFilter, setStatusFilter] = useState("");
    const [sessionFilter, setSessionFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // Ensure exact field names for session filter
            const query = `from_date=${fromDate}&to_date=${toDate}${statusFilter ? `&status=${statusFilter}` : ""}${sessionFilter ? `&meal_time=${sessionFilter}` : ""}`;
            const res = await apiRequest(`${HmsBaseUrl}get_all_diet_orders/?${query}`, "GET");
            if (res.success && res.data) {
                const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setOrders(dataArray);
            } else { setOrders([]); }
        } catch (e) { console.error(e); setOrders([]); } finally { setLoading(false); }
    }, [fromDate, toDate, statusFilter, sessionFilter]);

    // Live filtering when dates or simple dropdowns change
    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        const lowTerm = searchTerm.toLowerCase();
        return orders.filter(o => 
            (o.patient_name || "").toLowerCase().includes(lowTerm) ||
            (o.uhid || "").toLowerCase().includes(lowTerm) ||
            (o.inpatient_number || "").toLowerCase().includes(lowTerm) ||
            (o.room_no || "").toLowerCase().includes(lowTerm)
        );
    }, [orders, searchTerm]);

    const handleExportXLS = () => {
        const data = filteredOrders.map(o => ({
            "Order Date": o.order_date,
            "Order Time": o.order_time,
            "Patient Name": o.patient_name,
            "UHID": o.uhid,
            "IP Number": o.inpatient_number,
            "Ward/Room": `${o.ward_name} / ${o.room_no}`,
            "Meal Session": o.meal_time,
            "Diet Type": o.diet_type,
            "Food Items": o.food_items,
            "Attenders": o.attender_count,
            "Status": o.status
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DietOrders");
        XLSX.writeFile(wb, `DietReport_${fromDate}_v_${toDate}.xlsx`);
    };

    const handlePrintAllSlips = () => {
        const printWindow = window.open("", "_blank");
        const slipsHtml = filteredOrders.map(o => `
            <div class="slip">
                <div class="header">DIET ORDER SLIP</div>
                <div class="row"><strong>Patient:</strong> ${o.patient_name}</div>
                <div class="row"><strong>UHID:</strong> ${o.uhid} | <strong>IP No:</strong> ${o.inpatient_number}</div>
                <div class="row"><strong>Location:</strong> ${o.ward_name} / ${o.room_no}</div>
                <div class="row"><strong>Session:</strong> ${o.meal_time} | <strong>Diet:</strong> ${o.diet_type}</div>
                <div class="items"><strong>Configuration:</strong><br/> ${o.food_items || "-"}</div>
                <div class="footer">Generated: ${new Date().toLocaleTimeString()}</div>
            </div>
            <div class="page-break"></div>
        `).join("");

        printWindow.document.write(`
            <html>
                <head>
                    <title>Batch Preparation Slips</title>
                    <style>
                        body { font-family: sans-serif; margin: 0; padding: 0; width: 80mm; }
                        .slip { padding: 10px; border-bottom: 1px dashed #000; break-inside: avoid; }
                        .header { text-align: center; border-bottom: 2px solid #000; font-weight: 800; margin-bottom: 8px; }
                        .row { font-size: 13px; margin: 3px 0; }
                        .items { font-size: 12px; background: #f0f0f0; padding: 6px; margin-top: 5px; border-radius: 4px; }
                        .footer { font-size: 10px; text-align: center; margin-top: 5px; }
                        .page-break { page-break-after: always; }
                    </style>
                </head>
                <body>
                    ${slipsHtml}
                    <script>window.onload = () => { window.print(); window.close(); };</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintSingleSlip = (o) => {
        const printWindow = window.open("", "_blank", "width=350,height=500");
        printWindow.document.write(`
            <html>
                <head>
                    <style>
                        body { font-family: monospace; width: 80mm; padding: 10px; }
                        .center { text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
                        .row { margin: 5px 0; font-size: 14px; }
                        hr { border: 1px dashed #000; }
                    </style>
                </head>
                <body>
                    <div class="center">DIET ORDER SLIP</div>
                    <hr/>
                    <div class="row">NAME: ${o.patient_name}</div>
                    <div class="row">UHID: ${o.uhid}</div>
                    <div class="row">ROOM: ${o.ward_name} / ${o.room_no}</div>
                    <hr/>
                    <div class="row">MEAL: ${o.meal_time}</div>
                    <div class="row">DIET: ${o.diet_type}</div>
                    <div style="background:#eee; padding:10px; font-size:13px; margin-top:10px;">${o.food_items || "Normal Diet"}</div>
                    <hr/>
                    <div style="text-align:center; font-size:10px; margin-top:10px;">Printed: ${new Date().toLocaleString()}</div>
                    <script>window.onload = () => { window.print(); window.close(); };</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const updateStatus = async (id, s) => {
        const res = await apiRequest(`${HmsBaseUrl}update_diet_status/`, "PATCH", { diet_id: id, status: s });
        if (res.success) fetchOrders();
    };

    return (
        <PageWrapper style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eef2ff 100%)", minHeight: "100vh", padding: "20px" }}>
            <GlassContainer id="printable-area">
                <HeaderSection>
                    <Title>🍱 Diet Fulfillment Hub</Title>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%", justifyContent: "flex-end" }}>
                        <ActionBtn variant="primary" onClick={handlePrintAllSlips} disabled={filteredOrders.length === 0}>
                            <FiPrinter /> Print Slips
                        </ActionBtn>
                        <ActionBtn onClick={handleExportXLS} disabled={filteredOrders.length === 0}>
                            <FiFileText /> XLSX
                        </ActionBtn>
                        <ActionBtn onClick={() => window.print()}>
                            <FiPrinter /> Page
                        </ActionBtn>
                    </div>
                </HeaderSection>

                <FilterGrid>
                    <FormGroup>
                        <Label>From</Label>
                        <StyledInput type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>To</Label>
                        <StyledInput type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Meal Session</Label>
                        <StyledSelect value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}>
                            <option value="">All Sessions</option>
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Dinner">Dinner</option>
                        </StyledSelect>
                    </FormGroup>
                    <FormGroup>
                        <Label>Status</Label>
                        <StyledSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="Ordered">Ordered</option>
                            <option value="Received">Received</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </StyledSelect>
                    </FormGroup>
                    <FormGroup style={{ minWidth: "220px" }}>
                        <Label>Search Patient / Room</Label>
                        <div style={{ position: "relative" }}>
                            <StyledInput 
                                placeholder="Name, UHID, IP..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ paddingRight: "35px" }}
                            />
                            {searchTerm ? <FiX onClick={() => setSearchTerm("")} style={{ position: "absolute", right: "12px", top: "14px", cursor: "pointer", color: "#94a3b8" }} /> : <FiSearch style={{ position: "absolute", right: "12px", top: "14px", color: "#94a3b8" }} />}
                        </div>
                    </FormGroup>
                    <FormGroup style={{ justifyContent: "flex-end" }}>
                        <SearchBtn onClick={fetchOrders} title="Refresh Results"><FiRefreshCcw /></SearchBtn>
                    </FormGroup>
                </FilterGrid>

                <TableScrollArea>
                    <GlassTable>
                        <thead>
                            <tr>
                                <Th>Patient Profile</Th>
                                <Th>Location</Th>
                                <Th>Meal & Diet</Th>
                                <Th>Status</Th>
                                <Th style={{ textAlign: "right", minWidth: "150px" }}>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><Td colSpan="5" style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>Loading logs...</Td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><Td colSpan="5" style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>No records found.</Td></tr>
                            ) : (
                                filteredOrders.map(o => (
                                    <Tr key={o.diet_id}>
                                        <Td>
                                            <div style={{ color: T.primaryDark, fontWeight: 900, marginBottom: "4px" }}>{o.patient_name}</div>
                                            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>
                                                UHID: {o.uhid} | IP: {o.inpatient_number}
                                            </div>
                                            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>
                                                {o.order_date} @ {o.order_time}
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ fontWeight: 800 }}>{o.ward_name}</div>
                                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: T.secondary, background: "#e0e7ff", padding: "2px 8px", borderRadius: "6px", width: "fit-content", marginTop: "4px" }}>
                                                {o.room_no || "-"}
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ fontWeight: 800, color: "#1e293b" }}>{o.meal_time} - {o.diet_type}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#64748b", background: "#f8fafc", padding: "6px", borderRadius: "8px", marginTop: "4px", border: "1px solid #f1f5f9" }}>
                                                {o.food_items || "Default Configuration"}
                                            </div>
                                        </Td>
                                        <Td>
                                            <StatusBadge status={o.status}>{o.status}</StatusBadge>
                                        </Td>
                                        <Td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "center" }}>
                                                <StyledSelect 
                                                    value={o.status} 
                                                    onChange={e => updateStatus(o.diet_id, e.target.value)}
                                                    style={{ fontSize: "0.7rem", padding: "6px", width: "100px" }}
                                                >
                                                    <option value="Ordered">Ordered</option>
                                                    <option value="Received">Received</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </StyledSelect>
                                                <PrintBtn onClick={() => handlePrintSingleSlip(o)}><FiPrinter size={14} /></PrintBtn>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </GlassTable>
                </TableScrollArea>
            </GlassContainer>

            <style>
                {`
                @media print {
                    @page { margin: 10mm; }
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
                }
                `}
            </style>
        </PageWrapper>
    );
};

export default DietOrderReport;
