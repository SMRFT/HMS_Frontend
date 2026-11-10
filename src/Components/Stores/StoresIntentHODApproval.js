import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  DatePicker,
  Table,
  Modal,
  Button as AntButton,
  Select,
  Tag,
  Tooltip
} from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import apiRequest from "../../Auth/apiRequest";
import {
  Search,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  ShieldCheck,
  FileText,
  AlertCircle,
  Eye,
  Printer,
  Ban,
  Building2,
  User,
  Layers
} from "lucide-react";

const { RangePicker } = DatePicker;
const { Option } = Select;

// ── Styled Components ────────────────────────────────────────────────────────
const PageContainer = styled.div`
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
  color: #1e293b;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .title-group {
    h1 {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
  }

  .stat-content {
    h4 {
      margin: 0 0 6px 0;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
    }
    .value {
      font-size: 1.7rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg || "#f1f5f9"};
    color: ${props => props.$color || "#64748b"};
  }
`;

const FilterCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

  .filter-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .search-wrapper {
    flex: 1;
    min-width: 240px;
    position: relative;

    input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.88rem;
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: #0284c7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      }
    }

    svg {
      position: absolute;
      left: 11px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }
  }
`;

const TabsNav = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
  flex-wrap: wrap;

  .tab-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    color: #64748b;
    transition: all 0.18s ease;

    &:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    &.active {
      background: #0284c7;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);

      .count-badge {
        background: rgba(255, 255, 255, 0.25);
        color: #ffffff;
      }
    }

    .count-badge {
      font-size: 0.72rem;
      padding: 1px 7px;
      border-radius: 12px;
      background: #e2e8f0;
      color: #475569;
      font-weight: 700;
    }
  }
`;

const ContentCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  overflow: hidden;
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;

  &.primary {
    background: #0284c7;
    color: #ffffff;
    &:hover {
      background: #0369a1;
    }
  }

  &.success {
    background: #10b981;
    color: #ffffff;
    &:hover {
      background: #059669;
    }
  }

  &.danger {
    background: #ef4444;
    color: #ffffff;
    &:hover {
      background: #dc2626;
    }
  }

  &.outline {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #334155;
    &:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalContent = styled.div`
  font-family: 'Outfit', 'Inter', -apple-system, sans-serif;

  .intent-summary-box {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    padding: 14px 18px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;

    .info-item {
      label {
        font-size: 0.75rem;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        display: block;
        margin-bottom: 3px;
      }
      span {
        font-size: 0.92rem;
        font-weight: 700;
        color: #0f172a;
      }
    }
  }

  .items-table-container {
    max-height: 380px;
    overflow-y: auto;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;

      th {
        background: #f1f5f9;
        color: #475569;
        font-weight: 700;
        text-align: left;
        padding: 10px 14px;
        position: sticky;
        top: 0;
        z-index: 1;
        border-bottom: 1px solid #cbd5e1;
      }

      td {
        padding: 10px 14px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      tr:hover td {
        background: #f8fafc;
      }
    }
  }
`;

const PrintSlipContainer = styled.div`
  font-family: 'Inter', -apple-system, sans-serif;
  padding: 20px;
  background: #ffffff;
  color: #000000;

  .header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 12px;
    margin-bottom: 16px;

    h2 {
      margin: 0 0 4px 0;
      font-size: 1.4rem;
      font-weight: 800;
      text-transform: uppercase;
    }
    h4 {
      margin: 0;
      font-size: 1rem;
      color: #333;
      font-weight: 600;
    }
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 0.85rem;

    .row {
      display: flex;
      gap: 6px;
      strong {
        width: 130px;
      }
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 0.85rem;

    th, td {
      border: 1px solid #333;
      padding: 6px 10px;
      text-align: left;
    }

    th {
      background: #f0f0f0;
      font-weight: 700;
    }
  }

  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
    padding-top: 10px;

    .sig-box {
      text-align: center;
      width: 180px;
      border-top: 1px dashed #444;
      padding-top: 6px;
      font-size: 0.82rem;
      font-weight: 600;
    }
  }
`;

// Helpers to extract department code and name safely across various payload models
const getDeptCode = (d) => String(d?.code || d?.department_code || d?.department_id || d?._id || "").trim();
const getDeptName = (d) => String(d?.name || d?.department_name || d?.description || getDeptCode(d)).trim();

export default function StoresIntentHODApproval() {
  const [loading, setLoading] = useState(false);
  const [intents, setIntents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assignedDeptCodes, setAssignedDeptCodes] = useState([]);

  // Filters
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [activeTab, setActiveTab] = useState("Pending"); // "Pending", "Approved", "Rejected", "All"
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs()
  ]);

  // Modals
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [printModalVisible, setPrintModalVisible] = useState(false);
  const printRef = useRef(null);

  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "";
  const loggedInEmpId =
    localStorage.getItem("employeeId") ||
    localStorage.getItem("auth-user-id") ||
    localStorage.getItem("user_id") ||
    "HMS";

  // 1. Fetch assigned departments from separate StoresIntentDepartmentApproval collection/model
  useEffect(() => {
    const fetchAssignedDepartments = async () => {
      try {
        const url = `${Hmsbaseurl.replace(/\/$/, '')}/stores-intent-department-approval/${loggedInEmpId}/`;
        const res = await apiRequest(url, "GET");
        const doc = res?.data || res || {};
        const depts = doc.departments || [];
        setAssignedDeptCodes(Array.isArray(depts) ? depts : []);
      } catch (err) {
        console.warn("Could not fetch store intent assigned departments:", err);
      }
    };
    fetchAssignedDepartments();
  }, [loggedInEmpId, Hmsbaseurl]);

  // 2. Fetch Departments Master
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const url = `${Hmsbaseurl.replace(/\/$/, '')}/department-master/`;
        const res = await apiRequest(url, "GET");
        const list = Array.isArray(res) ? res : (res?.data || res?.data?.data || []);
        if (Array.isArray(list)) {
          setDepartments(list);
        }
      } catch (err) {
        console.error("Error fetching departments master:", err);
      }
    };
    fetchDepartments();
  }, [Hmsbaseurl]);

  // 3. Fetch Intents (scoped by assigned departments)
  const fetchIntents = useCallback(async () => {
    try {
      setLoading(true);
      const payload = {
        scoped_employee_id: loggedInEmpId
      };

      if (dateRange && dateRange[0] && dateRange[1]) {
        payload.from_date = dateRange[0].format("YYYY-MM-DD");
        payload.to_date = dateRange[1].format("YYYY-MM-DD");
      }

      // If user has specific assigned departments and is not superadmin with empty list
      if (assignedDeptCodes && assignedDeptCodes.length > 0) {
        if (selectedDept !== "ALL") {
          payload.department = selectedDept;
        } else {
          payload.departments = assignedDeptCodes;
        }
      } else if (selectedDept !== "ALL") {
        payload.department = selectedDept;
      }

      const url = `${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/`;
      const res = await apiRequest(url, "POST", payload);

      const list = Array.isArray(res) ? res : (res?.data || []);
      setIntents(list);
    } catch (err) {
      console.error("Error fetching stores intents:", err);
      toast.error("Failed to load stores intent records");
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedDept, assignedDeptCodes, loggedInEmpId, Hmsbaseurl]);

  useEffect(() => {
    fetchIntents();
  }, [fetchIntents]);

  // Department options for dropdown (filter to assigned departments if user has assignments)
  const availableDeptOptions = useMemo(() => {
    if (!departments || departments.length === 0) return [];
    if (assignedDeptCodes && assignedDeptCodes.length > 0) {
      return departments.filter(d => {
        const code = getDeptCode(d);
        return assignedDeptCodes.includes(code);
      });
    }
    return departments;
  }, [departments, assignedDeptCodes]);

  // Filtered intents by search and active tab
  const filteredIntents = useMemo(() => {
    return intents.filter(intent => {
      // Tab filter
      const hodStatus = intent.hod_status || (intent.is_hod_approved ? "Approved" : "Pending");
      if (activeTab === "Pending" && hodStatus !== "Pending") return false;
      if (activeTab === "Approved" && hodStatus !== "Approved") return false;
      if (activeTab === "Rejected" && hodStatus !== "Rejected") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const id = String(intent.intent_id || "").toLowerCase();
        const dept = String(intent.department_name || intent.department || "").toLowerCase();
        const requester = String(intent.created_by_name || intent.created_by || "").toLowerCase();
        const hasItem = (intent.items || []).some(it =>
          String(it.name || it.item_id || "").toLowerCase().includes(q)
        );
        return id.includes(q) || dept.includes(q) || requester.includes(q) || hasItem;
      }

      return true;
    });
  }, [intents, activeTab, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    let total = intents.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    intents.forEach(it => {
      const status = it.hod_status || (it.is_hod_approved ? "Approved" : "Pending");
      if (status === "Pending") pending++;
      else if (status === "Approved") approved++;
      else if (status === "Rejected") rejected++;
    });

    return { total, pending, approved, rejected };
  }, [intents]);

  // Open review modal
  const handleOpenReview = (intent) => {
    setSelectedIntent(intent);
    setReviewModalVisible(true);
  };

  // Submit HOD Approval or Rejection
  const handleSubmitAction = async (decision) => {
    if (!selectedIntent?.intent_id) return;

    try {
      setActionLoading(true);
      const isApproved = decision === "Approved";
      const payload = {
        is_hod_approved: isApproved,
        hod_status: isApproved ? "Approved" : "Rejected",
        hod_approved_by: loggedInEmpId,
        hod_approved_date: new Date().toISOString()
      };

      const url = `${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/update/${selectedIntent.intent_id}/`;
      const res = await apiRequest(url, "PATCH", payload);

      if (res && res.error) {
        toast.error(res.error || "Failed to update intent status");
      } else {
        toast.success(`Intent ${selectedIntent.intent_id} marked as ${payload.hod_status} successfully!`);
        setReviewModalVisible(false);
        fetchIntents();
      }
    } catch (err) {
      console.error("Error updating intent approval:", err);
      toast.error("Error updating intent approval status");
    } finally {
      setActionLoading(false);
    }
  };

  // Open print modal
  const handleOpenPrint = (intent) => {
    setSelectedIntent(intent);
    setPrintModalVisible(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!filteredIntents || filteredIntents.length === 0) {
      toast.info("No data to export");
      return;
    }

    const rows = filteredIntents.map(it => {
      const items = it.items || [];
      const totalReq = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
      const totalPending = items.reduce((sum, i) => sum + Math.max(0, Number(i.quantity || 0) - Number(i.approved_quantity || 0)), 0);
      return {
        "Intent ID": it.intent_id,
        "Date": it.date ? dayjs(it.date).format("YYYY-MM-DD") : "",
        "Department": it.department_name || it.department,
        "Requester": it.created_by_name || it.created_by,
        "Total Items": items.length,
        "Requested Qty": totalReq,
        "Pending Qty": totalPending,
        "HOD Status": it.hod_status || (it.is_hod_approved ? "Approved" : "Pending"),
        "HOD Approved By": it.hod_approved_by_name || it.hod_approved_by || "",
        "HOD Remarks": it.hod_remarks || "",
        "Store Approved": it.is_approved ? "Yes" : "No"
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Department_Intents");
    XLSX.writeFile(wb, `Department_Intents_Admin_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
  };

  // Table Columns
  const columns = [
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (val, record) => (
        <div>
          <div style={{ fontWeight: 700, color: "#1e293b" }}>
            {val ? dayjs(val).format("DD-MM-YYYY") : "-"}
          </div>
          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
            {record.created_date ? dayjs(record.created_date).format("hh:mm A") : ""}
          </div>
        </div>
      )
    },
    {
      title: "Intent ID",
      dataIndex: "intent_id",
      key: "intent_id",
      width: 140,
      render: (val) => (
        <span style={{ fontWeight: 800, color: "#0284c7", letterSpacing: "0.02em" }}>
          {val}
        </span>
      )
    },
    {
      title: "Department",
      dataIndex: "department_name",
      key: "department_name",
      width: 180,
      render: (val, record) => (
        <div style={{ fontWeight: 700, color: "#0f172a" }}>
          {val || record.department}
        </div>
      )
    },
    {
      title: "Requester",
      dataIndex: "created_by_name",
      key: "created_by_name",
      width: 150,
      render: (val, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <User size={14} color="#64748b" />
          <span style={{ fontWeight: 600, color: "#334155" }}>
            {val || record.created_by || "Dept Staff"}
          </span>
        </div>
      )
    },
    {
      title: "Requested Items",
      key: "items",
      render: (_, record) => {
        const items = record.items || [];
        const totalPending = items.reduce((acc, it) => acc + Math.max(0, Number(it.quantity || 0) - Number(it.approved_quantity || 0)), 0);
        const totalReq = items.reduce((acc, it) => acc + Number(it.quantity || 0), 0);
        return (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.85rem" }}>
                {items.length} {items.length === 1 ? "Item" : "Items"} ({totalReq} Req)
              </span>
              {totalPending > 0 && (
                <span style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: "#fffbeb",
                  color: "#d97706",
                  border: "1px solid #fde68a",
                  padding: "1px 6px",
                  borderRadius: 4
                }}>
                  {totalPending} Pending
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.76rem", color: "#64748b", maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {items.map(i => {
                const req = Number(i.quantity || 0);
                const apprv = Number(i.approved_quantity || 0);
                const pend = Math.max(0, req - apprv);
                return `${i.name || i.itemName || i.item_name || i.item_id} (Req: ${req}${pend > 0 ? `, Pend: ${pend}` : ""})`;
              }).join(", ")}
            </div>
          </div>
        );
      }
    },
    {
      title: "Pending Qty",
      key: "pending_qty",
      width: 120,
      render: (_, record) => {
        const items = record.items || [];
        const totalPending = items.reduce((acc, it) => acc + Math.max(0, Number(it.quantity || 0) - Number(it.approved_quantity || 0)), 0);
        return (
          <span style={{
            display: "inline-block",
            fontWeight: 800,
            fontSize: "0.9rem",
            color: totalPending > 0 ? "#d97706" : "#10b981",
            background: totalPending > 0 ? "#fffbeb" : "#ecfdf5",
            padding: "3px 10px",
            borderRadius: 6,
            border: totalPending > 0 ? "1px solid #fde68a" : "1px solid #a7f3d0"
          }}>
            {totalPending}
          </span>
        );
      }
    },
    {
      title: "HOD Approval",
      key: "hod_status",
      width: 150,
      render: (_, record) => {
        const status = record.hod_status || (record.is_hod_approved ? "Approved" : "Pending");
        if (status === "Approved") {
          return (
            <div>
              <Tag color="success" style={{ fontWeight: 700, borderRadius: 6 }}>
                Approved
              </Tag>
              {record.hod_approved_by_name && (
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                  by {record.hod_approved_by_name}
                </div>
              )}
            </div>
          );
        }
        if (status === "Rejected") {
          return (
            <Tag color="error" style={{ fontWeight: 700, borderRadius: 6 }}>
              Rejected
            </Tag>
          );
        }
        return (
          <Tag color="warning" style={{ fontWeight: 700, borderRadius: 6 }}>
            Pending HOD
          </Tag>
        );
      }
    },
    {
      title: "Store Status",
      dataIndex: "is_approved",
      key: "is_approved",
      width: 120,
      render: (val) => (
        <Tag color={val ? "blue" : "default"} style={{ fontWeight: 600, borderRadius: 6 }}>
          {val ? "Store Issued" : "Store Pending"}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Tooltip title="Review & Approve Intent">
            <ActionBtn className="primary" onClick={() => handleOpenReview(record)}>
              <Eye size={14} /> Review
            </ActionBtn>
          </Tooltip>
          <Tooltip title="Print Intent Slip">
            <ActionBtn className="outline" onClick={() => handleOpenPrint(record)}>
              <Printer size={14} />
            </ActionBtn>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <div className="title-group">
          <h1>
            <ShieldCheck size={28} color="#0284c7" /> Department Store Intent Admin Approval
          </h1>
          <p>
            Review, adjust quantities, and grant department administrative approval for store intent requisitions.
          </p>
        </div>
        <div className="header-actions">
          <AntButton icon={<Download size={15} />} onClick={handleExportExcel}>
            Export Excel
          </AntButton>
          <AntButton
            type="primary"
            icon={<RefreshCw size={15} className={loading ? "spin" : ""} />}
            onClick={fetchIntents}
            style={{ background: "#0284c7" }}
          >
            Refresh
          </AntButton>
        </div>
      </PageHeader>

      {/* Notice if user has assigned departments */}
      {assignedDeptCodes && assignedDeptCodes.length > 0 ? (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 10,
            padding: "10px 16px",
            marginBottom: 20,
            fontSize: "0.85rem",
            color: "#1e40af",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Building2 size={16} />
          <span>
            You are authorized to approve store intent requests for <strong>{assignedDeptCodes.length} department(s)</strong>.
          </span>
        </div>
      ) : (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 10,
            padding: "10px 16px",
            marginBottom: 20,
            fontSize: "0.85rem",
            color: "#92400e",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <AlertCircle size={16} />
          <span>
            Viewing as General / All Departments. (Assign specific departments for this admin in <strong>Employee Master &gt; Intent Dept Approval</strong> tab).
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard $bg="#f0f9ff" $color="#0284c7">
          <div className="stat-content">
            <h4>Total Requisitions</h4>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-icon">
            <FileText size={22} />
          </div>
        </StatCard>
        <StatCard $bg="#fffbeb" $color="#d97706">
          <div className="stat-content">
            <h4>Pending HOD Approval</h4>
            <div className="value">{stats.pending}</div>
          </div>
          <div className="stat-icon">
            <Clock size={22} />
          </div>
        </StatCard>
        <StatCard $bg="#ecfdf5" $color="#10b981">
          <div className="stat-content">
            <h4>HOD Approved</h4>
            <div className="value">{stats.approved}</div>
          </div>
          <div className="stat-icon">
            <CheckCircle size={22} />
          </div>
        </StatCard>
        <StatCard $bg="#fef2f2" $color="#ef4444">
          <div className="stat-content">
            <h4>Rejected</h4>
            <div className="value">{stats.rejected}</div>
          </div>
          <div className="stat-icon">
            <Ban size={22} />
          </div>
        </StatCard>
      </StatsGrid>

      {/* Filter Toolbar */}
      <FilterCard>
        <div className="filter-row">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search Intent ID, department, requester, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 220 }}>
            <Select
              style={{ width: "100%" }}
              value={selectedDept}
              onChange={setSelectedDept}
              placeholder="Filter Department"
            >
              <Option value="ALL">All Authorized Departments</Option>
              {availableDeptOptions.map(d => {
                const code = getDeptCode(d);
                const name = getDeptName(d);
                return (
                  <Option key={code} value={code}>
                    {name}
                  </Option>
                );
              })}
            </Select>
          </div>

          <div>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD-MM-YYYY"
            />
          </div>
        </div>
      </FilterCard>

      {/* Navigation Tabs */}
      <TabsNav>
        <button
          className={`tab-item ${activeTab === "Pending" ? "active" : ""}`}
          onClick={() => setActiveTab("Pending")}
        >
          <Clock size={16} /> Pending HOD Approval
          <span className="count-badge">{stats.pending}</span>
        </button>
        <button
          className={`tab-item ${activeTab === "Approved" ? "active" : ""}`}
          onClick={() => setActiveTab("Approved")}
        >
          <CheckCircle size={16} /> HOD Approved
          <span className="count-badge">{stats.approved}</span>
        </button>
        <button
          className={`tab-item ${activeTab === "Rejected" ? "active" : ""}`}
          onClick={() => setActiveTab("Rejected")}
        >
          <Ban size={16} /> Rejected
          <span className="count-badge">{stats.rejected}</span>
        </button>
        <button
          className={`tab-item ${activeTab === "All" ? "active" : ""}`}
          onClick={() => setActiveTab("All")}
        >
          <Layers size={16} /> All Requisitions
          <span className="count-badge">{stats.total}</span>
        </button>
      </TabsNav>

      {/* Main Table */}
      <ContentCard>
        <Table
          columns={columns}
          dataSource={filteredIntents}
          rowKey={(r) => r.intent_id || r._id}
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          locale={{ emptyText: "No store intent requisitions found for this selection" }}
        />
      </ContentCard>

      {/* Review & Approve Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem", fontWeight: 800 }}>
            <ShieldCheck size={22} color="#0284c7" />
            Review Intent Requisition: {selectedIntent?.intent_id}
          </div>
        }
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        width={850}
        footer={[
          <AntButton key="close" onClick={() => setReviewModalVisible(false)}>
            Close
          </AntButton>,
          <AntButton
            key="reject"
            danger
            loading={actionLoading}
            onClick={() => handleSubmitAction("Rejected")}
          >
            Reject Request
          </AntButton>,
          <AntButton
            key="approve"
            type="primary"
            style={{ background: "#10b981", borderColor: "#10b981" }}
            loading={actionLoading}
            onClick={() => handleSubmitAction("Approved")}
          >
            Approve Intent
          </AntButton>
        ]}
      >
        {selectedIntent && (
          <ModalContent>
            {/* Summary Box */}
            <div className="intent-summary-box">
              <div className="info-item">
                <label>Intent ID</label>
                <span>{selectedIntent.intent_id}</span>
              </div>
              <div className="info-item">
                <label>Department</label>
                <span>{selectedIntent.department_name || selectedIntent.department}</span>
              </div>
              <div className="info-item">
                <label>Date</label>
                <span>{selectedIntent.date ? dayjs(selectedIntent.date).format("DD-MM-YYYY") : "-"}</span>
              </div>
              <div className="info-item">
                <label>Requested By</label>
                <span>{selectedIntent.created_by_name || selectedIntent.created_by || "Dept Staff"}</span>
              </div>
              {selectedIntent.nursing_station && (
                <div className="info-item">
                  <label>Nursing Station</label>
                  <span>{selectedIntent.nursing_station}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="items-table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Item Name</th>
                    <th style={{ textAlign: "right", width: 130 }}>Requested Qty</th>
                    <th style={{ textAlign: "right", width: 130 }}>Pending Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedIntent.items || []).map((item, idx) => {
                    const reqQty = Number(item.quantity || 0);
                    const apprvQty = Number(item.approved_quantity || 0);
                    const pendingQty = Math.max(0, reqQty - apprvQty);
                    return (
                      <tr key={item.item_id || idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: "#0f172a" }}>{item.name || item.itemName || item.item_name || item.item_id}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, fontSize: "0.95rem", color: "#64748b" }}>
                          {reqQty}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 800, fontSize: "0.95rem", color: pendingQty > 0 ? "#d97706" : "#10b981" }}>
                          {pendingQty}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ModalContent>
        )}
      </Modal>

      {/* Print Slip Modal */}
      <Modal
        title="Print Intent Requisition Slip"
        open={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        width={750}
        footer={[
          <AntButton key="close" onClick={() => setPrintModalVisible(false)}>
            Close
          </AntButton>,
          <AntButton key="print" type="primary" icon={<Printer size={15} />} onClick={handlePrint}>
            Print Document
          </AntButton>
        ]}
      >
        {selectedIntent && (
          <PrintSlipContainer ref={printRef}>
            <div className="header">
              <h2>SHANMUGA HOSPITAL</h2>
              <h4>Department Store Intent Requisition Slip</h4>
            </div>

            <div className="meta-grid">
              <div className="row">
                <strong>Intent No:</strong>
                <span>{selectedIntent.intent_id}</span>
              </div>
              <div className="row">
                <strong>Date:</strong>
                <span>{selectedIntent.date ? dayjs(selectedIntent.date).format("DD-MM-YYYY") : "-"}</span>
              </div>
              <div className="row">
                <strong>Department:</strong>
                <span>{selectedIntent.department_name || selectedIntent.department}</span>
              </div>
              <div className="row">
                <strong>Raised By:</strong>
                <span>{selectedIntent.created_by_name || selectedIntent.created_by}</span>
              </div>
              <div className="row">
                <strong>HOD Status:</strong>
                <span>{selectedIntent.hod_status || "Approved"}</span>
              </div>
              <div className="row">
                <strong>HOD Approved By:</strong>
                <span>{selectedIntent.hod_approved_by_name || selectedIntent.hod_approved_by || loggedInEmpId}</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Item Description</th>
                  <th style={{ textAlign: "right", width: 130 }}>Quantity Requested</th>
                  <th style={{ textAlign: "right", width: 130 }}>Pending Quantity</th>
                </tr>
              </thead>
              <tbody>
                {(selectedIntent.items || []).map((it, idx) => {
                  const reqQty = Number(it.quantity || 0);
                  const apprvQty = Number(it.approved_quantity || 0);
                  const pendingQty = Math.max(0, reqQty - apprvQty);
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{it.name || it.itemName || it.item_name || it.item_id}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{reqQty}</td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: pendingQty > 0 ? "#d97706" : "#10b981" }}>{pendingQty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="signatures">
              <div className="sig-box">Department Requester</div>
              <div className="sig-box">HOD / Admin Approval</div>
              <div className="sig-box">Stores Incharge</div>
            </div>
          </PrintSlipContainer>
        )}
      </Modal>
    </PageContainer>
  );
}

