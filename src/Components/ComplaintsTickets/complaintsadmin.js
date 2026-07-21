import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { DatePicker, Select, ConfigProvider, Modal } from "antd";
import dayjs from "dayjs";
import apiRequest, { fetchAllEmployees } from "../../Auth/apiRequest";
import * as S from "../GlobalStyles";

const { Option } = Select;
const Hmsbaseurl = (process.env.REACT_APP_BACKEND_HMS_BASE_URL || "").replace(/\/$/, "");

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 16px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const AdminCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  background: ${props => props.$bg || "#f8fafc"};
  padding: 16px 20px;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: ${props => props.$color || "#0f172a"};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .count-badge {
    background: ${props => props.$badgeBg || "#0d9488"};
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
  }
`;

const FilterBar = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  padding: 16px 20px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: inline-block;
  background-color: ${props => {
    switch (props.$status?.toLowerCase()) {
      case "completed":
        return "#f0fdf4";
      case "in progress":
        return "#eff6ff";
      case "pending":
      default:
        return "#fffbeb";
    }
  }};
  color: ${props => {
    switch (props.$status?.toLowerCase()) {
      case "completed":
        return "#16a34a";
      case "in progress":
        return "#2563eb";
      case "pending":
      default:
        return "#d97706";
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status?.toLowerCase()) {
      case "completed":
        return "#bbf7d0";
      case "in progress":
        return "#bfdbfe";
      case "pending":
      default:
        return "#fde68a";
    }
  }};
`;

const PriorityBadge = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$prio) {
      case "Critical": return "#fef2f2";
      case "High": return "#fff5f5";
      case "Medium": return "#fffbeb";
      case "Low": return "#f0fdf4";
      default: return "#f1f5f9";
    }
  }};
  color: ${props => {
    switch (props.$prio) {
      case "Critical": return "#ef4444";
      case "High": return "#f87171";
      case "Medium": return "#d97706";
      case "Low": return "#16a34a";
      default: return "#475569";
    }
  }};
`;

const DetailLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 2px;
`;

const DetailValue = styled.div`
  font-size: 0.85rem;
  color: #0f172a;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #edf2f7;
  min-height: 32px;
  white-space: pre-wrap;
`;

const DownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #0d9488;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.75rem;
  margin-top: 4px;
  cursor: pointer;
  &:hover {
    color: #0f766e;
    text-decoration: underline;
  }
`;

const SectionSeparator = styled.div`
  height: 1px;
  background: #edf2f7;
  margin: 16px 0;
`;

const getPdfUrl = (dataUrl) => {
  if (!dataUrl) return "";
  if (dataUrl.startsWith("data:application/pdf;base64,")) {
    try {
      const base64Data = dataUrl.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error converting base64 to Blob URL", e);
      return dataUrl;
    }
  }
  return dataUrl;
};

const escapeCSV = (val) => {
  if (val === undefined || val === null) return '""';
  let str = String(val);
  str = str.replace(/"/g, '""');
  return `"${str}"`;
};

const ComplaintsAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [completedTickets, setCompletedTickets] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Date filters specifically for Completed tickets (default: 15 days range)
  const [fromDate, setFromDate] = useState(dayjs().subtract(15, "day").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));

  // Search input specifically for Completed tickets
  const [completedSearchQuery, setCompletedSearchQuery] = useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");

  // Detail & Lifecycle Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Edit fields
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("");
  const [severity, setSeverity] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rca, setRca] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, emps] = await Promise.all([
        apiRequest(`${Hmsbaseurl}/complaints/admin-list/?from_date=${fromDate}&to_date=${toDate}`, "GET"),
        fetchAllEmployees()
      ]);

      if (ticketsRes.success) {
        setPendingTickets(ticketsRes.data.pending || []);
        setCompletedTickets(ticketsRes.data.completed || []);
      } else {
        toast.error("Failed to load complaints list");
      }
      const uniqueEmps = [];
      const seen = new Set();
      if (Array.isArray(emps)) {
        emps.forEach(emp => {
          if (emp && emp.employeeId && !seen.has(emp.employeeId)) {
            seen.add(emp.employeeId);
            uniqueEmps.push(emp);
          }
        });
      }
      setEmployees(uniqueEmps);
    } catch (err) {
      toast.error("An error occurred loading admin dashboard data");
    }
    setLoading(false);
  };

  const handleFilter = async () => {
    setLoading(true);
    const res = await apiRequest(`${Hmsbaseurl}/complaints/admin-list/?from_date=${fromDate}&to_date=${toDate}`, "GET");
    if (res.success) {
      setPendingTickets(res.data.pending || []);
      setCompletedTickets(res.data.completed || []);
      toast.success("Completed tickets filtered successfully");
    } else {
      toast.error("Failed to filter completed complaints");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setCompletedSearchQuery("");
    const defaultFrom = dayjs().subtract(15, "day").format("YYYY-MM-DD");
    const defaultTo = dayjs().format("YYYY-MM-DD");
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setLoading(true);
    const res = await apiRequest(`${Hmsbaseurl}/complaints/admin-list/?from_date=${defaultFrom}&to_date=${defaultTo}`, "GET");
    if (res.success) {
      setPendingTickets(res.data.pending || []);
      setCompletedTickets(res.data.completed || []);
      toast.success("Filters reset to default");
    } else {
      toast.error("Failed to reset filters");
    }
    setLoading(false);
  };

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status || "Pending");
    setPriority(ticket.priority || "");
    setSeverity(ticket.severity || "");
    setAssignee(ticket.assignee || "");
    setDueDate(ticket.due_date || "");
    setRca(ticket.rca || "");
    setIsModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedTicket) return;

    setUpdating(true);
    const payload = {
      status,
      priority,
      severity,
      assignee,
      due_date: dueDate || null,
      rca
    };

    const res = await apiRequest(`${Hmsbaseurl}/complaints/${selectedTicket.issue_id}/`, "PATCH", payload);
    if (res.success) {
      toast.success(`Ticket ${selectedTicket.issue_id} updated successfully!`);
      setIsModalOpen(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to update ticket");
    }
    setUpdating(false);
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    if (!window.confirm(`Are you sure you want to permanently delete ticket ${selectedTicket.issue_id}?`)) {
      return;
    }

    setUpdating(true);
    const res = await apiRequest(`${Hmsbaseurl}/complaints/${selectedTicket.issue_id}/`, "DELETE");
    if (res.success) {
      toast.success(`Ticket ${selectedTicket.issue_id} deleted successfully.`);
      setIsModalOpen(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to delete ticket");
    }
    setUpdating(false);
  };

  // Filter pending tickets locally by search query
  const filteredPendingTickets = pendingTickets.filter(ticket => {
    if (!pendingSearchQuery.trim()) return true;
    const query = pendingSearchQuery.toLowerCase();
    return (
      (ticket.issue_id || "").toLowerCase().includes(query) ||
      (ticket.title || "").toLowerCase().includes(query) ||
      (ticket.reporter || "").toLowerCase().includes(query) ||
      (ticket.reporter_name || "").toLowerCase().includes(query) ||
      (ticket.assignee || "").toLowerCase().includes(query) ||
      (ticket.description || "").toLowerCase().includes(query) ||
      (ticket.rca || "").toLowerCase().includes(query)
    );
  });

  // Filter completed tickets locally by search query
  const filteredCompletedTickets = completedTickets.filter(ticket => {
    if (!completedSearchQuery.trim()) return true;
    const query = completedSearchQuery.toLowerCase();
    return (
      (ticket.issue_id || "").toLowerCase().includes(query) ||
      (ticket.title || "").toLowerCase().includes(query) ||
      (ticket.reporter || "").toLowerCase().includes(query) ||
      (ticket.reporter_name || "").toLowerCase().includes(query) ||
      (ticket.assignee || "").toLowerCase().includes(query) ||
      (ticket.description || "").toLowerCase().includes(query) ||
      (ticket.rca || "").toLowerCase().includes(query)
    );
  });

  const exportCSV = (ticketsList, filename) => {
    if (ticketsList.length === 0) {
      toast.warning("No tickets available to export");
      return;
    }
    
    const headers = [
      "Ticket ID",
      "Title",
      "Description",
      "Steps to Reproduce",
      "Environment",
      "Ticket Type",
      "Department",
      "Modules",
      "Status",
      "Priority",
      "Severity",
      "Reporter ID",
      "Reporter Name",
      "Assignee",
      "Reported Date",
      "Target Due Date",
      "Final Completion Date",
      "Labels/Tags",
      "RCA"
    ];

    const rows = ticketsList.map(ticket => {
      const labels = Array.isArray(ticket.labels_tags) ? ticket.labels_tags.join("; ") : "";
      return [
        escapeCSV(ticket.issue_id),
        escapeCSV(ticket.title),
        escapeCSV(ticket.description),
        escapeCSV(ticket.steps_to_reproduce),
        escapeCSV(ticket.environment),
        escapeCSV(ticket.ticket_type),
        escapeCSV(ticket.department),
        escapeCSV(ticket.modules),
        escapeCSV(ticket.status),
        escapeCSV(ticket.priority),
        escapeCSV(ticket.severity),
        escapeCSV(ticket.reporter),
        escapeCSV(ticket.reporter_name),
        escapeCSV(ticket.assignee_name ? `${ticket.assignee_name} (${ticket.assignee})` : (ticket.assignee || "")),
        escapeCSV(ticket.reported_date ? dayjs(ticket.reported_date).format("YYYY-MM-DD HH:mm") : ""),
        escapeCSV(ticket.due_date || ""),
        escapeCSV(ticket.final_completion_date || ""),
        escapeCSV(labels),
        escapeCSV(ticket.rca)
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully!");
  };

  const handleExportPendingCSV = () => {
    exportCSV(filteredPendingTickets, `pending_complaints_${dayjs().format("YYYY-MM-DD")}.csv`);
  };

  const handleExportCompletedCSV = () => {
    exportCSV(filteredCompletedTickets, `completed_complaints_${dayjs().format("YYYY-MM-DD")}.csv`);
  };

  const handlePrintPending = () => {
    if (filteredPendingTickets.length === 0) {
      toast.warning("No pending tickets available to print");
      return;
    }
    const printWindow = window.open("", "_blank");
    const html = `
      <html>
        <head>
          <title>Pending Complaints & Support Tickets Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 1.5rem; color: #b45309; margin-bottom: 5px; }
            p { font-size: 0.85rem; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 0.8rem; }
            th { background-color: #f2f2f2; font-weight: bold; color: #111; }
            tr:nth-child(even) { background-color: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Pending Complaints & Support Tickets Report</h1>
          <p>Generated on: ${dayjs().format("DD/MM/YYYY hh:mm A")} | Date Range: ${dayjs(fromDate).format("DD/MM/YYYY")} to ${dayjs(toDate).format("DD/MM/YYYY")}</p>
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Reporter</th>
                <th>Assignee</th>
                <th>Reported Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPendingTickets.map(t => `
                <tr>
                  <td style="font-weight: bold;">${t.issue_id}</td>
                  <td>${t.title}</td>
                  <td>${t.reporter_name || t.reporter}</td>
                  <td>${t.assignee_name ? `${t.assignee_name} (${t.assignee})` : (t.assignee || "-")}</td>
                  <td>${dayjs(t.reported_date).format("DD/MM/YYYY")}</td>
                  <td>${t.status}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintCompleted = () => {
    if (filteredCompletedTickets.length === 0) {
      toast.warning("No completed tickets available to print");
      return;
    }
    const printWindow = window.open("", "_blank");
    const html = `
      <html>
        <head>
          <title>Completed Complaints & Support Tickets Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 1.5rem; color: #15803d; margin-bottom: 5px; }
            p { font-size: 0.85rem; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 0.8rem; }
            th { background-color: #f2f2f2; font-weight: bold; color: #111; }
            tr:nth-child(even) { background-color: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Completed Complaints & Support Tickets Report</h1>
          <p>Generated on: ${dayjs().format("DD/MM/YYYY hh:mm A")} | Date Range: ${dayjs(fromDate).format("DD/MM/YYYY")} to ${dayjs(toDate).format("DD/MM/YYYY")}</p>
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Reporter</th>
                <th>Assignee</th>
                <th>Reported Date</th>
                <th>Completed Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCompletedTickets.map(t => `
                <tr>
                  <td style="font-weight: bold;">${t.issue_id}</td>
                  <td>${t.title}</td>
                  <td>${t.reporter_name || t.reporter}</td>
                  <td>${t.assignee_name ? `${t.assignee_name} (${t.assignee})` : (t.assignee || "-")}</td>
                  <td>${dayjs(t.reported_date).format("DD/MM/YYYY")}</td>
                  <td>${t.final_completion_date ? dayjs(t.final_completion_date).format("DD/MM/YYYY") : "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#0d9488" } }}>
      <S.PageWrapper>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>Complaints Administration Panel</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "0.85rem" }}>Manage support tickets, assign resolving staff, and track resolution timelines</p>
        </div>

        {/* Section 1: Pending Tickets */}
        <AdminCard style={{ marginBottom: "24px" }}>
          <CardHeader $bg="#fffbeb" $color="#b45309" $badgeBg="#d97706" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3>Pending / Active Tickets</h3>
              <span className="count-badge">{filteredPendingTickets.length}</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <S.Button onClick={handlePrintPending} style={{ padding: "4px 10px", fontSize: "0.75rem", background: "#ffffff", border: "1px solid #d97706", color: "#d97706", height: "30px", display: "flex", alignItems: "center", gap: "4px" }}>
                🖨️ Print
              </S.Button>
              <S.Button onClick={handleExportPendingCSV} style={{ padding: "4px 10px", fontSize: "0.75rem", background: "#ffffff", border: "1px solid #d97706", color: "#d97706", height: "30px", display: "flex", alignItems: "center", gap: "4px" }}>
                📥 CSV
              </S.Button>
            </div>
          </CardHeader>

          {/* Pending tickets filter row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", padding: "16px 20px", borderBottom: "1px solid #edf2f7", background: "#fafbfd", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>From Date</label>
              <DatePicker 
                value={dayjs(fromDate)} 
                onChange={d => setFromDate(d ? d.format("YYYY-MM-DD") : "")} 
                format="DD/MM/YYYY"
                style={{ height: "34px", borderRadius: "6px" }}
                allowClear={false}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>To Date</label>
              <DatePicker 
                value={dayjs(toDate)} 
                onChange={d => setToDate(d ? d.format("YYYY-MM-DD") : "")} 
                format="DD/MM/YYYY"
                style={{ height: "34px", borderRadius: "6px" }}
                allowClear={false}
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1 1 200px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Search Pending Tickets</label>
              <input 
                type="text" 
                placeholder="Search by ID, Title, Staff, Reporter..." 
                value={pendingSearchQuery}
                onChange={e => setPendingSearchQuery(e.target.value)}
                style={{
                  height: "34px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  padding: "0 10px",
                  fontSize: "0.8rem",
                  outline: "none"
                }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <S.Button onClick={handleFilter} disabled={loading} style={{ height: "34px", padding: "0 16px", fontSize: "0.8rem" }}>
                🔍 Filter
              </S.Button>
              <S.Button secondary onClick={handleReset} disabled={loading} style={{ height: "34px", padding: "0 16px", fontSize: "0.8rem" }}>
                🔄 Reset
              </S.Button>
            </div>
          </div>

          <S.FormContent style={{ padding: 0 }}>
            <S.TableWrapper style={{ border: "none", borderRadius: 0 }}>
              <S.Table>
                <thead>
                  <tr>
                    <S.Th width="110">ID</S.Th>
                    <S.Th width="100">TYPE</S.Th>
                    <S.Th>TITLE / REPORTER</S.Th>
                    <S.Th width="110">STATUS</S.Th>
                    <S.Th width="90">PRIORITY</S.Th>
                    <S.Th width="130">REPORTED ON</S.Th>
                    <S.Th width="120">ASSIGNEE</S.Th>
                    <S.Th width="80" style={{ textAlign: "center" }}>ACTION</S.Th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <S.Td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                        Loading...
                      </S.Td>
                    </tr>
                  ) : filteredPendingTickets.length === 0 ? (
                    <tr>
                      <S.Td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                        No pending tickets found.
                      </S.Td>
                    </tr>
                  ) : (
                    filteredPendingTickets.map(ticket => (
                      <S.Tr key={ticket.issue_id} style={{ cursor: "pointer" }} onClick={() => openEditModal(ticket)}>
                        <S.Td style={{ fontWeight: 700, color: "#0d9488" }}>{ticket.issue_id}</S.Td>
                        <S.Td>
                          <span style={{
                            background: ticket.ticket_type === "Add ons" ? "#fff3e0" : ticket.ticket_type === "Changes" ? "#e8f5e9" : "#e1f5fe",
                            color: ticket.ticket_type === "Add ons" ? "#ef6c00" : ticket.ticket_type === "Changes" ? "#2e7d32" : "#0277bd",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            border: `1px solid ${ticket.ticket_type === "Add ons" ? "#ffe0b2" : ticket.ticket_type === "Changes" ? "#c8e6c9" : "#b3e5fc"}`
                          }}>{ticket.ticket_type || "Issue"}</span>
                        </S.Td>
                        <S.Td>
                          <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{ticket.title}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                            By: {ticket.reporter_name || ticket.reporter}
                          </div>
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                              {ticket.attachments.map((file, idx) => {
                                const isImage = file.file_type?.startsWith("image/");
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => setPreviewFile(file)}
                                    title={`Click to preview: ${file.name}`}
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "4px",
                                      overflow: "hidden",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: "#f8fafc",
                                      fontSize: "0.6rem"
                                    }}
                                  >
                                    {isImage ? (
                                      <img src={file.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                      "📄"
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </S.Td>
                        <S.Td>
                          <StatusBadge $status={ticket.status}>{ticket.status}</StatusBadge>
                        </S.Td>
                        <S.Td>
                          <PriorityBadge $prio={ticket.priority}>{ticket.priority || "-"}</PriorityBadge>
                        </S.Td>
                        <S.Td style={{ fontSize: "0.78rem" }}>
                          {dayjs(ticket.reported_date).format("DD/MM/YYYY hh:mm A")}
                        </S.Td>
                        <S.Td style={{ fontSize: "0.78rem" }}>
                          {ticket.assignee_name ? `${ticket.assignee_name} (${ticket.assignee})` : (ticket.assignee || "-")}
                        </S.Td>
                        <S.Td style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
                          <S.Button onClick={() => openEditModal(ticket)} style={{ padding: "4px 8px", fontSize: "0.72rem", margin: "0 auto" }}>
                            ⚙️ Manage
                          </S.Button>
                        </S.Td>
                      </S.Tr>
                    ))
                  )}
                </tbody>
              </S.Table>
            </S.TableWrapper>
          </S.FormContent>
        </AdminCard>

        {/* Section 2: Completed Tickets with Filter */}
        <AdminCard>
          <CardHeader $bg="#f0fdf4" $color="#15803d" $badgeBg="#16a34a" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3>Completed Tickets</h3>
              <span className="count-badge">{filteredCompletedTickets.length}</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <S.Button onClick={handlePrintCompleted} style={{ padding: "4px 10px", fontSize: "0.75rem", background: "#ffffff", border: "1px solid #16a34a", color: "#16a34a", height: "30px", display: "flex", alignItems: "center", gap: "4px" }}>
                🖨️ Print
              </S.Button>
              <S.Button onClick={handleExportCompletedCSV} style={{ padding: "4px 10px", fontSize: "0.75rem", background: "#ffffff", border: "1px solid #16a34a", color: "#16a34a", height: "30px", display: "flex", alignItems: "center", gap: "4px" }}>
                📥 CSV
              </S.Button>
            </div>
          </CardHeader>
          
          {/* Completed tickets filter row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", padding: "16px 20px", borderBottom: "1px solid #edf2f7", background: "#fafbfd", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>From Date</label>
              <DatePicker 
                value={dayjs(fromDate)} 
                onChange={d => setFromDate(d ? d.format("YYYY-MM-DD") : "")} 
                format="DD/MM/YYYY"
                style={{ height: "34px", borderRadius: "6px" }}
                allowClear={false}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>To Date</label>
              <DatePicker 
                value={dayjs(toDate)} 
                onChange={d => setToDate(d ? d.format("YYYY-MM-DD") : "")} 
                format="DD/MM/YYYY"
                style={{ height: "34px", borderRadius: "6px" }}
                allowClear={false}
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1 1 200px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Search Completed Tickets</label>
              <input 
                type="text" 
                placeholder="Search by ID, Title, Staff, Reporter..." 
                value={completedSearchQuery}
                onChange={e => setCompletedSearchQuery(e.target.value)}
                style={{
                  height: "34px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  padding: "0 10px",
                  fontSize: "0.8rem",
                  outline: "none"
                }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <S.Button onClick={handleFilter} disabled={loading} style={{ height: "34px", padding: "0 16px", fontSize: "0.8rem" }}>
                🔍 Filter
              </S.Button>
              <S.Button secondary onClick={handleReset} disabled={loading} style={{ height: "34px", padding: "0 16px", fontSize: "0.8rem" }}>
                🔄 Reset
              </S.Button>
            </div>
          </div>

          <S.FormContent style={{ padding: 0 }}>
            <S.TableWrapper style={{ border: "none", borderRadius: 0 }}>
              <S.Table>
                <thead>
                  <tr>
                    <S.Th width="110">ID</S.Th>
                    <S.Th width="100">TYPE</S.Th>
                    <S.Th>TITLE / REPORTER</S.Th>
                    <S.Th width="110">STATUS</S.Th>
                    <S.Th width="90">PRIORITY</S.Th>
                    <S.Th width="120">REPORTED ON</S.Th>
                    <S.Th width="120">COMPLETED ON</S.Th>
                    <S.Th width="110">ASSIGNEE</S.Th>
                    <S.Th width="80" style={{ textAlign: "center" }}>ACTION</S.Th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <S.Td colSpan="9" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                        Loading...
                      </S.Td>
                    </tr>
                  ) : filteredCompletedTickets.length === 0 ? (
                    <tr>
                      <S.Td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                        No completed tickets match the selected filters.
                      </S.Td>
                    </tr>
                  ) : (
                    filteredCompletedTickets.map(ticket => (
                      <S.Tr key={ticket.issue_id} style={{ cursor: "pointer" }} onClick={() => openEditModal(ticket)}>
                        <S.Td style={{ fontWeight: 700, color: "#0d9488" }}>{ticket.issue_id}</S.Td>
                        <S.Td>
                          <span style={{
                            background: ticket.ticket_type === "Add ons" ? "#fff3e0" : ticket.ticket_type === "Changes" ? "#e8f5e9" : "#e1f5fe",
                            color: ticket.ticket_type === "Add ons" ? "#ef6c00" : ticket.ticket_type === "Changes" ? "#2e7d32" : "#0277bd",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            border: `1px solid ${ticket.ticket_type === "Add ons" ? "#ffe0b2" : ticket.ticket_type === "Changes" ? "#c8e6c9" : "#b3e5fc"}`
                          }}>{ticket.ticket_type || "Issue"}</span>
                        </S.Td>
                        <S.Td>
                          <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{ticket.title}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                            By: {ticket.reporter_name || ticket.reporter}
                          </div>
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                              {ticket.attachments.map((file, idx) => {
                                const isImage = file.file_type?.startsWith("image/");
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => setPreviewFile(file)}
                                    title={`Click to preview: ${file.name}`}
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "4px",
                                      overflow: "hidden",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: "#f8fafc",
                                      fontSize: "0.6rem"
                                    }}
                                  >
                                    {isImage ? (
                                      <img src={file.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                      "📄"
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </S.Td>
                        <S.Td>
                          <StatusBadge $status={ticket.status}>{ticket.status}</StatusBadge>
                        </S.Td>
                        <S.Td>
                          <PriorityBadge $prio={ticket.priority}>{ticket.priority || "-"}</PriorityBadge>
                        </S.Td>
                        <S.Td style={{ fontSize: "0.78rem" }}>
                          {dayjs(ticket.reported_date).format("DD/MM/YYYY")}
                        </S.Td>
                        <S.Td style={{ fontSize: "0.78rem", fontWeight: 600, color: "#16a34a" }}>
                          {ticket.final_completion_date ? dayjs(ticket.final_completion_date).format("DD/MM/YYYY") : "-"}
                        </S.Td>
                        <S.Td style={{ fontSize: "0.78rem" }}>
                          {ticket.assignee_name ? `${ticket.assignee_name} (${ticket.assignee})` : (ticket.assignee || "-")}
                        </S.Td>
                        <S.Td style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
                          <S.Button onClick={() => openEditModal(ticket)} style={{ padding: "4px 8px", fontSize: "0.72rem", margin: "0 auto" }}>
                            ⚙️ Manage
                          </S.Button>
                        </S.Td>
                      </S.Tr>
                    ))
                  )}
                </tbody>
              </S.Table>
            </S.TableWrapper>
          </S.FormContent>
        </AdminCard>

        {/* Admin Detail and Lifecycle Update Modal */}
        <Modal
          title={
            <div style={{ borderBottom: "1px solid #edf2f7", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "95%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0d9488" }}>{selectedTicket?.issue_id}</span>
                <span style={{
                  background: selectedTicket?.ticket_type === "Add ons" ? "#fff3e0" : selectedTicket?.ticket_type === "Changes" ? "#e8f5e9" : "#e1f5fe",
                  color: selectedTicket?.ticket_type === "Add ons" ? "#ef6c00" : selectedTicket?.ticket_type === "Changes" ? "#2e7d32" : "#0277bd",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: `1px solid ${selectedTicket?.ticket_type === "Add ons" ? "#ffe0b2" : selectedTicket?.ticket_type === "Changes" ? "#c8e6c9" : "#b3e5fc"}`
                }}>{selectedTicket?.ticket_type || "Issue"}</span>
                <StatusBadge $status={status}>{status}</StatusBadge>
              </div>
              <PriorityBadge $prio={priority}>{priority || "NO PRIORITY"}</PriorityBadge>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          width={850}
          centered
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", width: "100%", gap: "12px" }}>
              {/* <S.Button key="delete" danger onClick={handleDeleteTicket} disabled={updating} style={{ padding: "6px 16px", background: "#ef4444", borderColor: "#ef4444", color: "white" }}>
                🗑️ Delete Complaint
              </S.Button> */}
              <S.Button key="cancel" secondary onClick={() => setIsModalOpen(false)} style={{ padding: "6px 16px" }}>
                Cancel
              </S.Button>
              <S.Button key="save" onClick={handleSaveChanges} disabled={updating} style={{ padding: "6px 20px" }}>
                {updating ? "Saving..." : "Save Changes"}
              </S.Button>
            </div>
          }
        >
          {selectedTicket && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginTop: "16px" }}>
              {/* Left Column: Complaint Details (Read-only) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderRight: "1px solid #edf2f7", paddingRight: "20px" }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#0d9488", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Complaint Details</h4>
                
                <div>
                  <DetailLabel>Title</DetailLabel>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b", background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #edf2f7" }}>
                    {selectedTicket.title}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                  <div>
                    <DetailLabel>Reporter</DetailLabel>
                    <DetailValue>{selectedTicket.reporter_name ? `${selectedTicket.reporter_name} (${selectedTicket.reporter})` : selectedTicket.reporter}</DetailValue>
                  </div>
                  <div>
                    <DetailLabel>Department</DetailLabel>
                    <DetailValue>{selectedTicket.department || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not Set</span>}</DetailValue>
                  </div>
                  <div>
                    <DetailLabel>Modules</DetailLabel>
                    <DetailValue>{selectedTicket.modules || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not Set</span>}</DetailValue>
                  </div>
                  <div>
                    <DetailLabel>Reported Date</DetailLabel>
                    <DetailValue>{dayjs(selectedTicket.reported_date).format("DD/MM/YYYY hh:mm A")}</DetailValue>
                  </div>
                </div>

                <div>
                  <DetailLabel>Description</DetailLabel>
                  <DetailValue style={{ minHeight: "60px" }}>{selectedTicket.description || <span style={{ color: "#94a3b8" }}>No description provided</span>}</DetailValue>
                </div>

                <div>
                  <DetailLabel>Steps to Reproduce</DetailLabel>
                  <DetailValue style={{ minHeight: "60px" }}>{selectedTicket.steps_to_reproduce || <span style={{ color: "#94a3b8" }}>No steps provided</span>}</DetailValue>
                </div>

                <div>
                  <DetailLabel>Environment Details</DetailLabel>
                  <DetailValue style={{ minHeight: "45px" }}>{selectedTicket.environment || <span style={{ color: "#94a3b8" }}>No environment details provided</span>}</DetailValue>
                </div>

                <div>
                  <DetailLabel>Labels / Tags</DetailLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", minHeight: "30px", marginTop: "2px" }}>
                    {(!selectedTicket.labels_tags || selectedTicket.labels_tags.length === 0) && (
                      <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>No tags</span>
                    )}
                    {selectedTicket.labels_tags?.map(t => (
                      <span key={t} style={{
                        background: "#e0f2f1",
                        color: "#0d9488",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        border: "1px solid #b2dfdb"
                      }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <DetailLabel>Attachments ({selectedTicket.attachments?.length || 0})</DetailLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {(!selectedTicket.attachments || selectedTicket.attachments.length === 0) && (
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem", fontStyle: "italic" }}>No attachments</span>
                    )}
                    {selectedTicket.attachments?.map((file, idx) => {
                      const isImage = file.file_type?.startsWith("image/");
                      return (
                        <div key={idx} style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          padding: "6px",
                          background: "#fff",
                          width: "100px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center"
                        }}>
                          {isImage ? (
                            <div style={{
                              width: "30px",
                              height: "30px",
                              backgroundImage: `url(${file.url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "2px"
                            }} />
                          ) : (
                            <span style={{ fontSize: "1rem" }}>📄</span>
                          )}
                          <span style={{
                            fontSize: "0.65rem",
                            color: "#64748b",
                            maxWidth: "80px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                            marginTop: "2px"
                          }}>{file.name}</span>
                           <div style={{ display: "flex", gap: "4px", width: "100%", marginTop: "6px", justifyContent: "center" }}>
                            <span 
                              onClick={() => setPreviewFile(file)}
                              style={{ 
                                fontSize: "0.65rem", 
                                color: "#0d9488", 
                                cursor: "pointer", 
                                fontWeight: 600,
                                background: "#e0f2f1",
                                padding: "2px 5px",
                                borderRadius: "4px",
                                border: "1px solid #b2dfdb"
                              }}
                            >
                              Preview
                            </span>
                            <DownloadLink 
                              href={file.url} 
                              download={file.name} 
                              style={{ 
                                margin: 0, 
                                padding: "2px 5px",
                                background: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                fontSize: "0.65rem",
                                display: "inline-flex",
                                alignItems: "center"
                              }}
                            >
                              Download
                            </DownloadLink>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Administration & Lifecycle Controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#0d9488", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Administration & Actions</h4>

                <S.InputWrapper>
                  <S.Label required>Ticket Status</S.Label>
                  <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: status === "Pending" ? "700" : "normal", color: status === "Pending" ? "#d97706" : "#475569" }}>
                      <input 
                        type="radio" 
                        name="ticket-status-radio" 
                        value="Pending" 
                        checked={status === "Pending"} 
                        onChange={e => setStatus(e.target.value)} 
                      />
                      <span>Pending</span>
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: status === "In Progress" ? "700" : "normal", color: status === "In Progress" ? "#2563eb" : "#475569" }}>
                      <input 
                        type="radio" 
                        name="ticket-status-radio" 
                        value="In Progress" 
                        checked={status === "In Progress"} 
                        onChange={e => setStatus(e.target.value)} 
                      />
                      <span>In Progress</span>
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: status === "Completed" ? "700" : "normal", color: status === "Completed" ? "#16a34a" : "#475569" }}>
                      <input 
                        type="radio" 
                        name="ticket-status-radio" 
                        value="Completed" 
                        checked={status === "Completed"} 
                        onChange={e => setStatus(e.target.value)} 
                      />
                      <span>Completed</span>
                    </label>
                  </div>
                </S.InputWrapper>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <S.InputWrapper>
                    <S.Label>Priority</S.Label>
                    <S.Select value={priority} onChange={e => setPriority(e.target.value)}>
                      <option value="">-- Set Priority --</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </S.Select>
                  </S.InputWrapper>
                  
                  <S.InputWrapper>
                    <S.Label>Severity</S.Label>
                    <S.Select value={severity} onChange={e => setSeverity(e.target.value)}>
                      <option value="">-- Set Severity --</option>
                      <option value="Minor">Minor</option>
                      <option value="Major">Major</option>
                      <option value="Critical">Critical</option>
                      <option value="Blocker">Blocker</option>
                    </S.Select>
                  </S.InputWrapper>
                </div>

                <S.InputWrapper>
                  <S.Label>Assign Resolving Staff</S.Label>
                  <Select
                    showSearch
                    placeholder="Select Staff Member"
                    value={assignee || undefined}
                    onChange={val => setAssignee(val || "")}
                    style={{ width: "100%", height: "34px" }}
                    optionFilterProp="children"
                    allowClear
                  >
                    {employees.map(emp => (
                      <Option key={emp.employeeId} value={emp.employeeId}>
                        {emp.employeeName} ({emp.employeeId})
                      </Option>
                    ))}
                  </Select>
                </S.InputWrapper>

                <S.InputWrapper>
                  <S.Label>Target Due Date</S.Label>
                  <DatePicker 
                    value={dueDate ? dayjs(dueDate) : null} 
                    onChange={d => setDueDate(d ? d.format("YYYY-MM-DD") : "")} 
                    format="DD/MM/YYYY"
                    style={{ height: "34px", borderRadius: "6px" }}
                  />
                </S.InputWrapper>

                {status === "Completed" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
                    <DetailLabel>Final Completion Date (Auto-generated)</DetailLabel>
                    <DetailValue>
                      {selectedTicket.final_completion_date 
                        ? dayjs(selectedTicket.final_completion_date).format("DD/MM/YYYY") 
                        : dayjs().format("DD/MM/YYYY (Today)")}
                    </DetailValue>
                  </div>
                )}

                <SectionSeparator />

                <S.InputWrapper>
                  <S.Label>Root Cause Analysis (RCA)</S.Label>
                  <S.TextArea 
                    placeholder="Document root cause, details of fix, and preventative actions..."
                    value={rca}
                    onChange={e => setRca(e.target.value)}
                    style={{ minHeight: "80px", fontSize: "0.8rem" }}
                  />
                </S.InputWrapper>
              </div>
            </div>
          )}
        </Modal>

        {/* File Preview Modal */}
        <Modal
          open={!!previewFile}
          title={previewFile?.name}
          zIndex={2000}
          footer={[
            <S.Button key="close" onClick={() => setPreviewFile(null)}>
              Close
            </S.Button>,
            <a key="download" href={previewFile?.url} download={previewFile?.name} style={{ textDecoration: "none", marginLeft: "8px" }}>
              <S.Button style={{ background: S.colors.primary, borderColor: S.colors.primary, color: "white" }}>
                Download File
              </S.Button>
            </a>
          ]}
          onCancel={() => setPreviewFile(null)}
          width={800}
          centered
        >
          {previewFile && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", padding: "10px", background: "#f8fafc", borderRadius: "8px" }}>
              {previewFile.file_type?.startsWith("image/") ? (
                <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              ) : previewFile.file_type === "application/pdf" ? (
                <iframe src={getPdfUrl(previewFile.url)} title={previewFile.name} style={{ width: "100%", height: "60vh", border: "none" }} />
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <span style={{ fontSize: "4rem" }}>📄</span>
                  <p style={{ marginTop: "12px", color: "#64748b", fontWeight: 600 }}>{previewFile.name}</p>
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Preview is not supported for this file type.</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </S.PageWrapper>
    </ConfigProvider>
  );
};

export default ComplaintsAdmin;
