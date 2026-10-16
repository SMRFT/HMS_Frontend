import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  CheckCircle2,
  XCircle,
  Printer,
  RefreshCw,
  Search,
  Calendar,
  Eye,
  FileText,
  Clock,
  ArrowRight,
  TrendingDown,
  UserCheck,
  AlertCircle
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import HospitalHeader from "../Images/Header.png";

const colors = {
  primary: "#136A63",
  primaryHover: "#0E524C",
  primaryLight: "#E6F4F2",
  accent: "#D97706",
  accentLight: "#FEF3C7",
  success: "#16A34A",
  successLight: "#DCFCE7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
};

const PageContainer = styled.div`
  padding: 24px;
  background: ${colors.background};
  min-height: calc(100vh - 80px);
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  .title-group {
    h1 {
      font-size: 1.55rem;
      color: ${colors.textPrimary};
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      color: ${colors.textSecondary};
      font-size: 0.88rem;
      margin: 4px 0 0 0;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const RefreshBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ffffff;
  color: ${colors.primary};
  border: 1.5px solid ${colors.primary};
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.primaryLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NavTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid ${colors.border};
  padding-bottom: 2px;
`;

const NavTab = styled.button`
  padding: 10px 20px;
  background: ${props => props.$active ? colors.primaryLight : "transparent"};
  color: ${props => props.$active ? colors.primary : colors.textSecondary};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? colors.primary : "transparent"};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? "700" : "500"};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s;

  &:hover {
    color: ${colors.primary};
    background: ${colors.primaryLight};
  }
`;

const Badge = styled.span`
  background: ${props => props.$variant === "primary" ? colors.primary : props.$variant === "accent" ? colors.accent : "#94A3B8"};
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
`;

const MetricCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .meta {
    .label {
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 600;
      color: ${colors.textSecondary};
      letter-spacing: 0.04em;
    }
    .value {
      font-size: 1.45rem;
      font-weight: 700;
      color: ${props => props.$color || colors.textPrimary};
      margin-top: 4px;
    }
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: ${props => props.$bg || colors.primaryLight};
    color: ${props => props.$color || colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const FilterBar = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .search-wrap {
    flex: 1;
    min-width: 260px;
    position: relative;
    display: flex;
    align-items: center;

    svg {
      position: absolute;
      left: 12px;
      color: ${colors.textMuted};
    }

    input {
      width: 100%;
      padding: 9px 12px 9px 38px;
      border: 1.5px solid ${colors.border};
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      transition: border 0.2s;

      &:focus {
        border-color: ${colors.primary};
      }
    }
  }

  .date-group {
    display: flex;
    align-items: center;
    gap: 8px;

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: ${colors.textSecondary};
    }

    input[type="date"] {
      padding: 8px 12px;
      border: 1.5px solid ${colors.border};
      border-radius: 8px;
      font-size: 0.88rem;
      outline: none;
      color: ${colors.textPrimary};

      &:focus {
        border-color: ${colors.primary};
      }
    }
  }
`;

const TableCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    background: #F8FAFC;
    color: ${colors.textSecondary};
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 14px 16px;
    border-bottom: 2px solid ${colors.border};
    white-space: nowrap;
  }

  td {
    padding: 14px 16px;
    font-size: 0.88rem;
    color: ${colors.textPrimary};
    border-bottom: 1px solid ${colors.border};
    vertical-align: middle;
  }

  tr:hover td {
    background: #F9FAFB;
  }
`;

const PatientTag = styled.div`
  .name {
    font-weight: 700;
    font-size: 0.92rem;
    color: ${colors.textPrimary};
  }
  .sub {
    font-size: 0.78rem;
    color: ${colors.textSecondary};
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const WardTag = styled.span`
  display: inline-block;
  background: #F1F5F9;
  color: #334155;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  background: ${props => props.$type === "Approved" ? colors.successLight : props.$type === "Pending" ? colors.accentLight : colors.dangerLight};
  color: ${props => props.$type === "Approved" ? colors.success : props.$type === "Pending" ? colors.accent : colors.danger};
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  margin-right: 6px;

  &.approve {
    background: ${colors.success};
    color: #ffffff;
    &:hover { background: #15803d; }
  }

  &.reject {
    background: ${colors.danger};
    color: #ffffff;
    &:hover { background: #b91c1c; }
  }

  &.print {
    background: #0284C7;
    color: #ffffff;
    &:hover { background: #0369A1; }
  }

  &.view {
    background: #F1F5F9;
    color: #334155;
    border: 1px solid #CBD5E1;
    &:hover { background: #E2E8F0; }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: ${props => props.$maxWidth || "750px"};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F8FAFC;

  h3 {
    margin: 0;
    font-size: 1.15rem;
    color: ${colors.textPrimary};
    font-weight: 700;
  }

  button {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    color: ${colors.textMuted};
    cursor: pointer;
    &:hover { color: ${colors.danger}; }
  }
`;

const ModalBody = styled.div`
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  padding: 14px 24px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #F8FAFC;
`;

export default function WardReturnApprovals() {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "report"
  const [pendingList, setPendingList] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modals
  const [selectedPrintBill, setSelectedPrintBill] = useState(null);
  const [selectedViewItem, setSelectedViewItem] = useState(null);

  const fetchPendingReturns = async () => {
    try {
      const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
      const res = await apiRequest(`${HmsBaseUrl}get_pending_ward_returns/`, "GET");
      const backendResponse = res.data || {};
      if (res.success && backendResponse.success !== false) {
        setPendingList(backendResponse.data || []);
      } else {
        setPendingList([]);
      }
    } catch (e) {
      console.error("Failed to fetch pending ward returns:", e);
      setPendingList([]);
    }
  };

  const fetchApprovedReturns = async () => {
    try {
      const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
      let url = `${HmsBaseUrl}get_ward_return_details/`;
      const params = [];
      if (fromDate) params.push(`from_date=${fromDate}`);
      if (toDate) params.push(`to_date=${toDate}`);
      if (params.length) url += `?${params.join("&")}`;

      const res = await apiRequest(url, "GET");
      const backendResponse = res.data || {};
      if (res.success && backendResponse.success !== false) {
        setApprovedList(backendResponse.data || []);
      } else {
        setApprovedList([]);
      }
    } catch (e) {
      console.error("Failed to fetch approved returns:", e);
      setApprovedList([]);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchPendingReturns(), fetchApprovedReturns()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [fromDate, toDate]);

  // Confirmation & Toast state
  const [confirmModal, setConfirmModal] = useState(null); // { billId, returnRequestId, action, patientName, itemCount, returnAmount }
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAction = async (billId, returnRequestId, action) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const employeeId = localStorage.getItem("employee_id") || "50886";

    setActionLoading(returnRequestId);
    setConfirmModal(null);
    try {
      const payload = {
        Bill_id: billId,
        return_request_id: returnRequestId,
        action: action,
        "auth-user-id": employeeId
      };

      const res = await apiRequest(`${HmsBaseUrl}approve_ward_return/`, "POST", payload);
      const backendResponse = res.data || {};

      if (res.success && backendResponse.success !== false) {
        showToast(backendResponse.message || `Return ${action}d successfully`, "success");
        await loadAll();
        if (action === "Approve" && backendResponse.ward_return_details) {
          setSelectedPrintBill(backendResponse.ward_return_details);
          setActiveTab("report");
        }
      } else {
        showToast(backendResponse.error || backendResponse.message || res.error || "Failed to process return", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error processing request", "error");
    } finally {
      setActionLoading(null);
    }
  };


  const executePrint = () => {
    const printContent = document.getElementById("ward-return-print-area");
    if (!printContent) return;
    const printWindow = window.open("", "", "width=900,height=750");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ward Return Bill - ${selectedPrintBill?.ward_return_bill_no || "Print"}</title>
            <style>
              @page { size: auto; margin: 10mm 15mm; }
              body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #111; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 6px 8px; }
              th { background: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase; }
              @media print {
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 400);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Summary Metrics
  const totalPendingCount = pendingList.length;
  const totalApprovedCount = approvedList.length;
  const totalApprovedReturnValue = approvedList.reduce((acc, curr) => acc + (parseFloat(curr.return_amount) || 0), 0);
  const totalOriginalBillValue = approvedList.reduce((acc, curr) => acc + (parseFloat(curr.original_bill_amount) || 0), 0);
  const totalNetRetainedValue = Math.max(0, totalOriginalBillValue - totalApprovedReturnValue);

  // Filtered lists
  const filterList = (list) => {
    return list.filter((item) => {
      let match = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const pName = (item.patient_name || "").toLowerCase();
        const uhid = (item.uhid || "").toLowerCase();
        const ip = (item.inpatient_number || item.ip_number || "").toLowerCase();
        const bNo = (item.bill_no || "").toLowerCase();
        const retNo = (item.ward_return_bill_no || "").toLowerCase();
        const ward = (item.ward_name || item.room_no || "").toLowerCase();
        match = pName.includes(q) || uhid.includes(q) || ip.includes(q) || bNo.includes(q) || retNo.includes(q) || ward.includes(q);
      }
      return match;
    });
  };

  const filteredPending = filterList(pendingList);
  const filteredApproved = filterList(approvedList);

  return (
    <PageContainer>
      {/* ── Header ── */}
      <HeaderSection>
        <div className="title-group">
          <h1>
            <FileText size={28} color={colors.primary} />
            Ward Returns Management
          </h1>
          <p>Review ward medicine returns, approve stock adjustments in blocked qty, and generate return credit bills.</p>
        </div>
        <div className="header-actions">
          <RefreshBtn onClick={loadAll} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </RefreshBtn>
        </div>
      </HeaderSection>

      {/* ── Metric Cards ── */}
      <MetricCardsGrid>
        <MetricCard $bg={colors.accentLight} $color={colors.accent}>
          <div className="meta">
            <div className="label">Pending Approvals</div>
            <div className="value">{totalPendingCount}</div>
          </div>
          <div className="icon-wrap">
            <Clock size={22} />
          </div>
        </MetricCard>

        <MetricCard $bg={colors.successLight} $color={colors.success}>
          <div className="meta">
            <div className="label">Approved Returns</div>
            <div className="value">{totalApprovedCount}</div>
          </div>
          <div className="icon-wrap">
            <UserCheck size={22} />
          </div>
        </MetricCard>

        <MetricCard $bg="#FEF2F2" $color={colors.danger}>
          <div className="meta">
            <div className="label">Total Return Value</div>
            <div className="value">₹{totalApprovedReturnValue.toFixed(2)}</div>
          </div>
          <div className="icon-wrap">
            <TrendingDown size={22} />
          </div>
        </MetricCard>

        <MetricCard $bg={colors.primaryLight} $color={colors.primary}>
          <div className="meta">
            <div className="label">Net Retained Amount</div>
            <div className="value">₹{totalNetRetainedValue.toFixed(2)}</div>
          </div>
          <div className="icon-wrap">
            <FileText size={22} />
          </div>
        </MetricCard>
      </MetricCardsGrid>

      {/* ── Sub Tabs ── */}
      <NavTabs>
        <NavTab $active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>
          <Clock size={16} />
          Pending Approvals
          <Badge $variant="accent">{pendingList.length}</Badge>
        </NavTab>
        <NavTab $active={activeTab === "report"} onClick={() => setActiveTab("report")}>
          <FileText size={16} />
          Approved Returns Report &amp; Print
          <Badge $variant="primary">{approvedList.length}</Badge>
        </NavTab>
      </NavTabs>

      {/* ── Search & Date Filter Bar ── */}
      <FilterBar>
        <div className="search-wrap">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Patient Name, UHID, IP Number, Bill No, Return Bill No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="date-group">
          <label>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="date-group">
          <label>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {(fromDate || toDate || searchQuery) && (
          <button
            onClick={() => { setFromDate(""); setToDate(""); setSearchQuery(""); }}
            style={{ padding: "8px 14px", border: "none", background: "#E2E8F0", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
          >
            Clear Filters
          </button>
        )}
      </FilterBar>

      {/* ── Main Tab Content ── */}
      <TableCard>
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center", color: colors.textSecondary }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 12px", display: "block", color: colors.primary }} />
            Loading ward returns data...
          </div>
        ) : activeTab === "pending" ? (
          // ── PENDING APPROVALS TABLE ──
          filteredPending.length === 0 ? (
            <div style={{ padding: "50px", textAlign: "center", color: colors.textSecondary }}>
              <CheckCircle2 size={36} color={colors.success} style={{ margin: "0 auto 10px", display: "block" }} />
              <strong>No Pending Ward Returns</strong>
              <div style={{ fontSize: "0.85rem", marginTop: 4 }}>All ward return requests have been processed.</div>
            </div>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Ward / Room</th>
                  <th>Bill Details</th>
                  <th>Requested By &amp; Time</th>
                  <th>Returning Items</th>
                  <th>Amounts</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((req, i) => (
                  <tr key={req.return_request_id || i}>
                    <td>
                      <PatientTag>
                        <div className="name">{req.patient_name || "—"}</div>
                        <div className="sub">
                          <span>{req.uhid || "—"}</span>
                          <span>|</span>
                          <span>{req.ip_number || "—"}</span>
                        </div>
                      </PatientTag>
                    </td>

                    <td>
                      <WardTag>{req.ward_name || req.room_no || "General Ward"}</WardTag>
                      {req.doctor_name && (
                        <div style={{ fontSize: "0.78rem", color: colors.textSecondary, marginTop: 4 }}>
                          Doc: {req.doctor_name}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{req.bill_no || `Bill #${req.Bill_id}`}</div>
                      <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>
                        Date: {formatDate(req.bill_date)}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{req.requested_by || "Ward Staff"}</div>
                      <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>
                        {formatDateTime(req.requested_at)}
                      </div>
                    </td>

                    <td style={{ maxWidth: 300 }}>
                      {req.items && req.items.length > 0 ? (
                        req.items.map((itm, idx) => (
                          <div key={idx} style={{ fontSize: "0.82rem", marginBottom: 4, background: "#F1F5F9", padding: "4px 8px", borderRadius: 4 }}>
                            <strong>{itm.return_qty || itm.qty}x</strong> {itm.item_name || `Item #${itm.item_id}`}
                            <div style={{ fontSize: "0.75rem", color: colors.textSecondary }}>
                              Batch: {itm.batch_number || "—"} • Rate: ₹{Number(itm.price || 0).toFixed(2)}
                              {itm.reason ? ` • ${itm.reason}` : ""}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: colors.textMuted }}>No items listed</span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: "0.82rem" }}>
                        <div>Orig Bill: <strong>₹{Number(req.original_bill_amount || 0).toFixed(2)}</strong></div>
                        <div style={{ color: colors.accent, fontWeight: 700, marginTop: 2 }}>
                          Return: -₹{Number(req.return_amount || 0).toFixed(2)}
                        </div>
                        <div style={{ color: colors.success, fontWeight: 700, marginTop: 2 }}>
                          Net: ₹{Math.max(0, Number(req.original_bill_amount || 0) - Number(req.return_amount || 0)).toFixed(2)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusPill $type="Pending">Pending Approval</StatusPill>
                    </td>

                    <td>
                      <ActionBtn
                        className="approve"
                        disabled={actionLoading === req.return_request_id}
                        onClick={() => setConfirmModal({
                          billId: req.Bill_id,
                          returnRequestId: req.return_request_id,
                          action: "Approve",
                          patientName: req.patient_name || req.uhid,
                          itemCount: (req.items || []).length,
                          returnAmount: req.return_amount
                        })}
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </ActionBtn>
                      <ActionBtn
                        className="reject"
                        disabled={actionLoading === req.return_request_id}
                        onClick={() => setConfirmModal({
                          billId: req.Bill_id,
                          returnRequestId: req.return_request_id,
                          action: "Reject",
                          patientName: req.patient_name || req.uhid,
                          itemCount: (req.items || []).length,
                          returnAmount: req.return_amount
                        })}
                      >
                        <XCircle size={14} />
                        Reject
                      </ActionBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )
        ) : (
          // ── APPROVED RETURNS REPORT TABLE ──
          filteredApproved.length === 0 ? (
            <div style={{ padding: "50px", textAlign: "center", color: colors.textSecondary }}>
              <FileText size={36} color={colors.textMuted} style={{ margin: "0 auto 10px", display: "block" }} />
              <strong>No Approved Ward Returns Found</strong>
              <div style={{ fontSize: "0.85rem", marginTop: 4 }}>Approved return bills will be listed here with print capability.</div>
            </div>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <th>Return Bill No</th>
                  <th>Return Date &amp; Time</th>
                  <th>Original Bill No</th>
                  <th>Patient Details</th>
                  <th>Ward / Room</th>
                  <th style={{ textAlign: "right" }}>Original Bill (₹)</th>
                  <th style={{ textAlign: "right" }}>Return Amt (₹)</th>
                  <th style={{ textAlign: "right" }}>Net Amt (₹)</th>
                  <th>Approved By</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApproved.map((ret, i) => (
                  <tr key={ret.ward_return_bill_no || i}>
                    <td>
                      <strong style={{ color: colors.primary }}>{ret.ward_return_bill_no}</strong>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{formatDate(ret.ward_return_bill_date)}</div>
                      <div style={{ fontSize: "0.78rem", color: colors.textMuted }}>
                        {new Date(ret.ward_return_bill_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{ret.bill_no || "—"}</div>
                    </td>

                    <td>
                      <PatientTag>
                        <div className="name">{ret.patient_name || "—"}</div>
                        <div className="sub">
                          <span>{ret.uhid || "—"}</span>
                          <span>|</span>
                          <span>{ret.inpatient_number || "—"}</span>
                        </div>
                      </PatientTag>
                    </td>

                    <td>
                      <WardTag>{ret.room_no || "—"}</WardTag>
                    </td>

                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      ₹{Number(ret.original_bill_amount || 0).toFixed(2)}
                    </td>

                    <td style={{ textAlign: "right", fontWeight: 700, color: colors.accent }}>
                      - ₹{Number(ret.return_amount || 0).toFixed(2)}
                    </td>

                    <td style={{ textAlign: "right", fontWeight: 700, color: colors.success }}>
                      ₹{Number(ret.balance_amount ?? (ret.original_bill_amount - ret.return_amount) ?? 0).toFixed(2)}
                    </td>

                    <td>
                      <div>{ret.pharmacist_name || ret.created_by || "Pharmacist"}</div>
                    </td>

                    <td>
                      <StatusPill $type="Approved">Approved</StatusPill>
                    </td>

                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <ActionBtn
                        className="print"
                        title="Print Return Bill"
                        onClick={() => setSelectedPrintBill(ret)}
                      >
                        <Printer size={14} />
                        Print Bill
                      </ActionBtn>
                      <ActionBtn
                        className="view"
                        title="View Items"
                        onClick={() => setSelectedViewItem(ret)}
                      >
                        <Eye size={14} />
                        Details
                      </ActionBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )
        )}
      </TableCard>

      {/* ── PRINT BILL MODAL ── */}
      {selectedPrintBill && (
        <ModalBackdrop onClick={() => setSelectedPrintBill(null)}>
          <ModalContent $maxWidth="850px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Ward Return Bill Print Preview</h3>
              <button onClick={() => setSelectedPrintBill(null)}>✕</button>
            </ModalHeader>

            <ModalBody>
              <div id="ward-return-print-area" style={{ padding: "20px 24px", fontFamily: "Segoe UI, Arial, sans-serif", fontSize: "12px", color: "#111", background: "#fff" }}>
                {/* Header with Hospital Logo and Info */}
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 4 }}>
                    <img
                      src={HospitalHeader}
                      alt="Shanmuga Hospital Limited"
                      style={{ height: 48, objectFit: "contain" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#005b8e", letterSpacing: 0.5 }}>
                        SHANMUGA HOSPITAL LIMITED
                      </div>
                      <div style={{ fontSize: 11, color: "#333", marginTop: 1 }}>
                        51/24, Saradha College Road, Salem - 636007
                      </div>
                      <div style={{ fontSize: 11, color: "#333" }}>
                        Ph No: 04272706666
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 6, fontWeight: 800, fontSize: 13, letterSpacing: 1, color: "#1e293b" }}>
                    PHARMACY WARD RETURN BILL / CREDIT NOTE
                  </div>
                  <div style={{ fontSize: 10.5, fontStyle: "italic", color: "#64748b", marginTop: 1 }}>
                    *** Duplicate / Return Voucher ***
                  </div>
                </div>

                {/* DL NO, CIN, GST NO */}
                <div style={{ borderTop: "1px solid #cbd5e0", paddingTop: 5, marginBottom: 2, display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#111" }}>
                  <span>DL NO : TN-01-20-21-00202</span>
                  <span>PHARMACY IP WARD RETURN</span>
                </div>
                <div style={{ borderBottom: "1px solid #cbd5e0", paddingBottom: 5, marginBottom: 10, display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#111" }}>
                  <span>CIN : L85110TZ2020PLC033974</span>
                  <span>GST NO : 33ABDCS8326A1ZP</span>
                </div>

                {/* Patient & Bill Metadata */}
                <div style={{ display: "flex", gap: 24, marginBottom: 12, borderBottom: "1px solid #cbd5e0", paddingBottom: 10 }}>
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "110px 1fr", rowGap: 4, fontSize: 12 }}>
                    <span style={{ color: "#555" }}>Patient</span>
                    <span style={{ fontWeight: 700 }}>: {selectedPrintBill.patient_name || "—"}</span>
                    <span style={{ color: "#555" }}>UHID No</span>
                    <span>: {selectedPrintBill.uhid || "—"}</span>
                    <span style={{ color: "#555" }}>IN Patient NO</span>
                    <span>: {selectedPrintBill.inpatient_number || selectedPrintBill.ip_number || "—"}</span>
                    <span style={{ color: "#555" }}>Ward / Room</span>
                    <span>: {selectedPrintBill.room_no || selectedPrintBill.ward_name || "—"}</span>
                    <span style={{ color: "#555" }}>Doctor</span>
                    <span>: {selectedPrintBill.doctor_name || "—"}</span>
                  </div>

                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 4, fontSize: 12 }}>
                    <span style={{ color: "#555" }}>Return Bill No</span>
                    <span style={{ fontWeight: 700, color: colors.primary }}>: {selectedPrintBill.ward_return_bill_no || "—"}</span>
                    <span style={{ color: "#555" }}>Return Date</span>
                    <span>: {formatDateTime(selectedPrintBill.ward_return_bill_date)}</span>
                    <span style={{ color: "#555" }}>Original Bill No</span>
                    <span style={{ fontWeight: 700 }}>: {selectedPrintBill.bill_no || "—"}</span>
                    <span style={{ color: "#555" }}>Original Bill Date</span>
                    <span>: {formatDate(selectedPrintBill.bill_date)}</span>
                    <span style={{ color: "#555" }}>Approved By</span>
                    <span>: {selectedPrintBill.pharmacist_name || selectedPrintBill.created_by || "Pharmacist"}</span>
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                  <thead>
                    <tr style={{ background: "#edf2f7", borderTop: "1px solid #cbd5e0", borderBottom: "1px solid #cbd5e0" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 11 }}>S.No</th>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 11 }}>Particulars</th>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 11 }}>Batch</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 11 }}>Expiry</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 11 }}>Return Qty</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 11 }}>Rate (₹)</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 11 }}>CGST %</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 11 }}>SGST %</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 11 }}>Return Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedPrintBill.medicine_particulars || []).map((med, idx) => {
                      const retQty = parseFloat(med.return_qty || med.qty || 0);
                      const rate = parseFloat(med.price || med.mrp || 0);
                      const amt = parseFloat(med.return_amount || (retQty * rate) || 0);
                      const cgst = parseFloat(med.CGST_Percentage || 2.5);
                      const sgst = parseFloat(med.SGST_Percentage || 2.5);

                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "6px 8px", fontSize: 11 }}>{idx + 1}</td>
                          <td style={{ padding: "6px 8px", fontSize: 11, fontWeight: 600 }}>{med.item_name || `Item #${med.item_id}`}</td>
                          <td style={{ padding: "6px 8px", fontSize: 11 }}>{med.batch_number || "—"}</td>
                          <td style={{ padding: "6px 8px", fontSize: 11, textAlign: "center" }}>{med.expiry_date || "—"}</td>
                          <td style={{ padding: "6px 8px", fontSize: 11, textAlign: "center", fontWeight: 700 }}>{retQty}</td>
                          <td style={{ padding: "6px 8px", fontSize: 11, textAlign: "right" }}>{rate.toFixed(2)}</td>
                          <td style={{ padding: "6px 8px", fontSize: 11, textAlign: "center" }}>{cgst}</td>
                          <td style={{ padding: "6px 8px", fontSize: 11, textAlign: "center" }}>{sgst}</td>
                          <td style={{ padding: "6px 8px", fontSize: 11, textAlign: "right", fontWeight: 700 }}>{amt.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Amount Comparison Box */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "#475569", maxWidth: 350 }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Ward Return Credit Note</div>
                    <div>Stock has been automatically restored/adjusted in IP Pharmacy blocked stock.</div>
                    <div style={{ marginTop: 6, fontStyle: "italic" }}>E &amp; OE. Verified and approved by Pharmacy Department.</div>
                  </div>

                  <div style={{ background: "#F8FAFC", border: "1.5px solid #CBD5E1", borderRadius: 8, padding: "10px 16px", minWidth: 320 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: "#334155", fontWeight: 600 }}>Actual / Original Bill Amount:</span>
                      <span style={{ fontWeight: 700 }}>₹{Number(selectedPrintBill.original_bill_amount || 0).toFixed(2)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: colors.danger }}>
                      <span style={{ fontWeight: 600 }}>Less: Ward Return Amount:</span>
                      <span style={{ fontWeight: 700 }}>- ₹{Number(selectedPrintBill.return_amount || 0).toFixed(2)}</span>
                    </div>

                    <div style={{ borderTop: "2px solid #94A3B8", paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 13, color: colors.success }}>
                      <span style={{ fontWeight: 800 }}>Net Adjusted Bill Amount:</span>
                      <span style={{ fontWeight: 800 }}>
                        ₹{Number(selectedPrintBill.balance_amount ?? (selectedPrintBill.original_bill_amount - selectedPrintBill.return_amount) ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#334155", paddingTop: 10, borderTop: "1px dashed #cbd5e0" }}>
                  <div>
                    <div>Prepared By: <strong>{selectedPrintBill.pharmacist_name || selectedPrintBill.created_by || "Pharmacist"}</strong></div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Date: {new Date().toLocaleDateString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div>Ward Incharge / Sister Sign</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 14 }}>____________________</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div>Authorised Pharmacist Sign</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 14 }}>____________________</div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <button
                onClick={() => setSelectedPrintBill(null)}
                style={{ padding: "8px 16px", border: "1px solid #CBD5E1", background: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                Close
              </button>
              <button
                onClick={executePrint}
                style={{ padding: "8px 20px", background: colors.primary, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
              >
                <Printer size={16} />
                Print Bill
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* ── VIEW ITEMS DETAIL MODAL ── */}
      {selectedViewItem && (
        <ModalBackdrop onClick={() => setSelectedViewItem(null)}>
          <ModalContent $maxWidth="650px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Returned Items Details ({selectedViewItem.ward_return_bill_no || "Return"})</h3>
              <button onClick={() => setSelectedViewItem(null)}>✕</button>
            </ModalHeader>

            <ModalBody>
              <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", background: "#F1F5F9", padding: "10px 14px", borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: colors.textSecondary }}>Patient</div>
                  <strong style={{ fontSize: "0.95rem" }}>{selectedViewItem.patient_name || "—"}</strong>
                  <div style={{ fontSize: "0.78rem", color: colors.textSecondary }}>{selectedViewItem.uhid} | {selectedViewItem.inpatient_number}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", color: colors.textSecondary }}>Original Bill No</div>
                  <strong style={{ fontSize: "0.95rem" }}>{selectedViewItem.bill_no || "—"}</strong>
                </div>
              </div>

              <StyledTable>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Batch</th>
                    <th>Expiry</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Rate</th>
                    <th style={{ textAlign: "right" }}>Return Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedViewItem.medicine_particulars || []).map((med, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{med.item_name || `Item #${med.item_id}`}</strong>
                        {med.reason && <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>Reason: {med.reason}</div>}
                      </td>
                      <td>{med.batch_number || "—"}</td>
                      <td>{med.expiry_date || "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{med.return_qty || med.qty}</td>
                      <td style={{ textAlign: "right" }}>₹{Number(med.price || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: colors.accent }}>
                        ₹{Number(med.return_amount || (med.return_qty * med.price) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>

              <div style={{ marginTop: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.88rem" }}>
                  <span>Original Bill Amount:</span>
                  <strong>₹{Number(selectedViewItem.original_bill_amount || 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.88rem", color: colors.danger }}>
                  <span>Return Amount:</span>
                  <strong>- ₹{Number(selectedViewItem.return_amount || 0).toFixed(2)}</strong>
                </div>
                <div style={{ borderTop: "1px solid #CBD5E1", paddingTop: 4, display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: colors.success }}>
                  <strong>Net Remaining Amount:</strong>
                  <strong>₹{Number(selectedViewItem.balance_amount ?? (selectedViewItem.original_bill_amount - selectedViewItem.return_amount) ?? 0).toFixed(2)}</strong>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <button
                onClick={() => setSelectedViewItem(null)}
                style={{ padding: "8px 16px", border: "1px solid #CBD5E1", background: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                Close
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}
      {/* ── ACTION CONFIRMATION MODAL ── */}
      {confirmModal && (
        <ModalBackdrop onClick={() => setConfirmModal(null)}>
          <ModalContent $maxWidth="500px" onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Confirm {confirmModal.action === "Approve" ? "Return Approval" : "Rejection"}</h3>
              <button onClick={() => setConfirmModal(null)}>✕</button>
            </ModalHeader>
            <ModalBody>
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                {confirmModal.action === "Approve" ? (
                  <CheckCircle2 size={44} color={colors.success} style={{ margin: "0 auto 12px" }} />
                ) : (
                  <XCircle size={44} color={colors.danger} style={{ margin: "0 auto 12px" }} />
                )}
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
                  {confirmModal.action === "Approve" ? "Approve Ward Medicine Return?" : "Reject Return Request?"}
                </div>
                <div style={{ fontSize: "0.88rem", color: colors.textSecondary, lineHeight: 1.5 }}>
                  {confirmModal.action === "Approve" ? (
                    <>
                      You are approving return of <strong>{confirmModal.itemCount} item(s)</strong> worth <strong>₹{Number(confirmModal.returnAmount || 0).toFixed(2)}</strong> for patient <strong>{confirmModal.patientName}</strong>.
                      <div style={{ marginTop: 10, fontSize: "0.82rem", color: colors.primary, background: colors.primaryLight, padding: "8px 12px", borderRadius: 6 }}>
                        Stock will be restored in blocked quantity, and a formal return bill will be generated.
                      </div>
                    </>
                  ) : (
                    <>Are you sure you want to reject this ward return request?</>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <button
                onClick={() => setConfirmModal(null)}
                style={{ padding: "8px 16px", border: "1px solid #CBD5E1", background: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading === confirmModal.returnRequestId}
                onClick={() => handleAction(confirmModal.billId, confirmModal.returnRequestId, confirmModal.action)}
                style={{
                  padding: "8px 20px",
                  background: confirmModal.action === "Approve" ? colors.success : colors.danger,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {confirmModal.action === "Approve" ? "Yes, Approve Return" : "Yes, Reject"}
              </button>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: toast.type === "success" ? "#166534" : "#991b1b",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: 8,
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 999999,
          fontSize: "0.9rem",
          fontWeight: 600
        }}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </PageContainer>
  );
}
