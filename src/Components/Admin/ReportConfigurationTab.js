import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Search,
  Check,
  Shield,
  Copy,
  X,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  Layers,
  ChevronDown,
  ChevronRight,
  Save,
  FolderPlus
} from "lucide-react";
import {
  fetchReportMasters,
  saveReportMaster,
  deleteReportMaster,
  fetchEmployeeReportConfig,
  saveEmployeeReportConfig,
  copyEmployeeReportConfig
} from "../../Auth/reportConfigApi";

// ── Styled Components ────────────────────────────────────────────────────────
const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
  font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
`;

const EmpBanner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: #ffffff;
  padding: 18px 24px;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.2);
  flex-wrap: wrap;
  gap: 16px;

  .emp-info {
    display: flex;
    align-items: center;
    gap: 14px;

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.2rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .details {
      h3 {
        margin: 0 0 2px 0;
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.01em;
      }
      p {
        margin: 0;
        font-size: 0.85rem;
        opacity: 0.9;
      }
    }
  }

  .banner-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    .btn-action {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;

      &:hover {
        background: #ffffff;
        color: #0d9488;
      }
    }

    .btn-save-main {
      background: #ffffff;
      color: #0d9488;
      border: none;
      padding: 9px 20px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transition: all 0.2s ease;

      &:hover {
        background: #f0fdf4;
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .search-box {
    position: relative;
    flex: 1;
    min-width: 280px;

    input {
      width: 100%;
      height: 42px;
      padding: 0 14px 0 40px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      font-size: 0.88rem;
      outline: none;
      background: #ffffff;
      transition: all 0.2s ease;

      &:focus {
        border-color: #0d9488;
        box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
      }
    }

    svg {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      width: 17px;
      height: 17px;
    }
  }

  .quick-stats {
    display: flex;
    align-items: center;
    gap: 12px;

    .badge-stat {
      background: #f1f5f9;
      color: #475569;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      border: 1px solid #e2e8f0;

      strong {
        color: #0d9488;
      }
    }

    .btn-toggle-all {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #f8fafc;
        border-color: #94a3b8;
      }
    }
  }
`;

const CategoryCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-bottom: 16px;

  .category-header {
    background: #f8fafc;
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer;
    user-select: none;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .title {
        font-size: 1rem;
        font-weight: 800;
        color: #0f172a;
      }

      .count-badge {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 12px;
        background: #e0f2fe;
        color: #0369a1;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;

      .btn-cat-select {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #475569;
        cursor: pointer;

        &:hover {
          border-color: #0d9488;
          color: #0d9488;
        }
      }
    }
  }

  .reports-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 12px;
    padding: 16px;
  }
`;

const ReportItemCard = styled.div`
  border: 1px solid ${props => (props.$active ? "#0d9488" : "#e2e8f0")};
  background: ${props => (props.$active ? "#f0fdf4" : "#ffffff")};
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: #0d9488;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 6px;

    .item-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: ${props => (props.$active ? "#065f46" : "#1e293b")};
      line-height: 1.35;
    }

    .custom-checkbox {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid ${props => (props.$active ? "#0d9488" : "#cbd5e1")};
      background: ${props => (props.$active ? "#0d9488" : "#ffffff")};
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
  }

  .item-desc {
    font-size: 0.78rem;
    color: #64748b;
    line-height: 1.35;
    margin-bottom: 8px;
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;

    .route-pill {
      font-family: monospace;
      font-size: 0.72rem;
      color: #475569;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .code-pill {
      font-family: monospace;
      font-size: 0.72rem;
      color: #047857;
      background: #ecfdf5;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  overflow: hidden;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 22px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #64748b;
      padding: 4px;
      border-radius: 6px;

      &:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
    }
  }

  .modal-body {
    padding: 20px 22px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 14px 22px;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    gap: 10px;
  }
`;

// Helper: Normalize group pages into uniform list
export const getGroupPages = (group) => {
  if (!group) return [];
  if (Array.isArray(group.pages)) {
    return group.pages.map((p, idx) => ({
      name: p.name || p.title || p.route || `Report ${idx + 1}`,
      route: p.route,
      description: p.description || "",
      icon: p.icon || "FileText",
      page_id: p.page_id ?? (idx + 1),
      permission: typeof p.permissions === "object" ? Object.values(p.permissions)[0] : (p.permission || "")
    }));
  }
  if (group.reports && typeof group.reports === "object") {
    return Object.entries(group.reports).map(([route, rObj], idx) => ({
      name: rObj.title || rObj.name || route,
      route: route,
      description: rObj.description || "",
      icon: rObj.icon || "FileText",
      page_id: rObj.page_id ?? (idx + 1),
      permission: rObj.permission || ""
    }));
  }
  return [];
};

// ── Component ───────────────────────────────────────────────────────────────
const ReportConfigurationTab = ({ selectedEmployee, employees = [] }) => {
  const [reportMasters, setReportMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active employee allocated permissions: { [route]: page_id }
  const [allocatedPermissions, setAllocatedPermissions] = useState({});
  // Active employee allocated report groups: { [group_id]: group_title }
  const [allocatedReports, setAllocatedReports] = useState({});

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  // Modals state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceEmpId, setCopySourceEmpId] = useState("");
  const [copyTargetEmpIds, setCopyTargetEmpIds] = useState([]);
  const [isTransferMode, setIsTransferMode] = useState(false);
  const [copySearchText, setCopySearchText] = useState("");

  const [showMasterModal, setShowMasterModal] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [selectedGroupForNewPage, setSelectedGroupForNewPage] = useState("");
  const [newPageData, setNewPageData] = useState({
    title: "",
    route: "",
    description: "",
    permission: "",
    page_id: ""
  });

  const empId = selectedEmployee?.employeeId || selectedEmployee?.id;

  // Load report masters and employee report config
  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    if (empId) {
      loadEmployeeConfig(empId);
    } else {
      setAllocatedPermissions({});
      setAllocatedReports({});
    }
  }, [empId]);

  const loadMasters = async (seed = false) => {
    try {
      setLoading(true);
      const data = await fetchReportMasters(seed);
      setReportMasters(data);
      // Expand all categories by default
      const exp = {};
      data.forEach(m => {
        const gid = String(m.group_id ?? m.report_id ?? m.group);
        exp[gid] = true;
      });
      setExpandedCategories(exp);
    } catch (err) {
      console.error("Error loading report masters:", err);
      toast.error("Failed to load report masters");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeConfig = async (eId) => {
    try {
      setLoading(true);
      const config = await fetchEmployeeReportConfig(eId);
      if (config) {
        setAllocatedPermissions(config.report_permissions || {});
        setAllocatedReports(config.reports || {});
      } else {
        setAllocatedPermissions({});
        setAllocatedReports({});
      }
    } catch (err) {
      console.error("Error loading employee report config:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpand = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Toggle single report page
  const handleToggleReport = (group, page) => {
    const route = page.route;
    const pageId = page.page_id ?? route;
    const isCurrentlyAllocated = Boolean(allocatedPermissions[route]);
    const groupId = String(group.group_id ?? group.report_id);
    const groupTitle = group.group || group.report_title || "";

    setAllocatedPermissions(prev => {
      const next = { ...prev };
      if (isCurrentlyAllocated) {
        delete next[route];
      } else {
        next[route] = pageId;
      }
      return next;
    });

    // Also update allocatedReports group dictionary
    setAllocatedReports(prev => {
      const next = { ...prev };
      const groupPages = getGroupPages(group);
      const anyRemaining = groupPages.some(p => {
        if (p.route === route) return !isCurrentlyAllocated;
        return Boolean(allocatedPermissions[p.route]);
      });

      if (anyRemaining) {
        next[groupId] = groupTitle;
      } else {
        delete next[groupId];
      }
      return next;
    });
  };

  // Select / Deselect all in a group
  const handleToggleGroup = (group) => {
    const groupPages = getGroupPages(group);
    const allSelected = groupPages.length > 0 && groupPages.every(p => Boolean(allocatedPermissions[p.route]));
    const groupId = String(group.group_id ?? group.report_id);
    const groupTitle = group.group || group.report_title || "";

    setAllocatedPermissions(prev => {
      const next = { ...prev };
      if (allSelected) {
        groupPages.forEach(p => delete next[p.route]);
      } else {
        groupPages.forEach(p => {
          next[p.route] = p.page_id ?? p.route;
        });
      }
      return next;
    });

    setAllocatedReports(prev => {
      const next = { ...prev };
      if (allSelected) {
        delete next[groupId];
      } else {
        next[groupId] = groupTitle;
      }
      return next;
    });
  };

  // Global Select All / Clear All
  const handleGlobalSelectAll = () => {
    const newPerms = {};
    const newReports = {};
    reportMasters.forEach(group => {
      const groupId = String(group.group_id ?? group.report_id);
      const groupTitle = group.group || group.report_title || "";
      newReports[groupId] = groupTitle;
      const groupPages = getGroupPages(group);
      groupPages.forEach(p => {
        newPerms[p.route] = p.page_id ?? p.route;
      });
    });
    setAllocatedPermissions(newPerms);
    setAllocatedReports(newReports);
  };

  const handleGlobalClearAll = () => {
    setAllocatedPermissions({});
    setAllocatedReports({});
  };

  // Save report configuration to backend
  const handleSaveConfig = async () => {
    if (!empId) {
      toast.warning("Please select an employee first");
      return;
    }

    try {
      setSaving(true);
      const success = await saveEmployeeReportConfig(empId, allocatedPermissions, allocatedReports);
      if (success) {
        toast.success(`Report permissions updated for ${selectedEmployee?.employeeName || empId}!`);
        // If updating the currently logged-in user, refresh localStorage permissions
        const currentUserId = localStorage.getItem("employeeId") || localStorage.getItem("user_id");
        if (String(currentUserId) === String(empId)) {
          localStorage.setItem("report_permissions", JSON.stringify(allocatedPermissions));
          localStorage.setItem("allocated_reports", JSON.stringify(allocatedReports));
          localStorage.setItem("has_custom_report_config", "true");
        }
      } else {
        toast.error("Failed to save report configuration");
      }
    } catch (err) {
      console.error("Save config error:", err);
      toast.error("Error saving report configuration");
    } finally {
      setSaving(false);
    }
  };

  // Open Copy / Transfer modal
  const openCopyModal = () => {
    setCopySourceEmpId(empId || "");
    setCopyTargetEmpIds([]);
    setIsTransferMode(false);
    setShowCopyModal(true);
  };

  const handleApplyCopy = async () => {
    if (!copySourceEmpId) {
      toast.warning("Please select a source employee");
      return;
    }
    if (copyTargetEmpIds.length === 0) {
      toast.warning("Please select at least one target employee");
      return;
    }

    const modeText = isTransferMode ? "transfer" : "copy";
    const confirmResult = await Swal.fire({
      title: `Confirm Permission ${isTransferMode ? "Transfer" : "Copy"}?`,
      text: `Are you sure you want to ${modeText} report permissions from ${copySourceEmpId} to ${copyTargetEmpIds.length} employee(s)?${
        isTransferMode ? " Source permissions will be cleared!" : ""
      }`,
      icon: isTransferMode ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isTransferMode ? "#d97706" : "#0d9488",
      confirmButtonText: `Yes, ${isTransferMode ? "Transfer" : "Copy"}`
    });

    if (confirmResult.isConfirmed) {
      try {
        const success = await copyEmployeeReportConfig(copySourceEmpId, copyTargetEmpIds, isTransferMode);
        if (success) {
          toast.success(`Successfully ${isTransferMode ? "transferred" : "copied"} permissions!`);
          setShowCopyModal(false);
          if (empId) loadEmployeeConfig(empId);
        } else {
          toast.error("Failed to apply copy/transfer");
        }
      } catch (e) {
        toast.error("Error in copy/transfer operation");
      }
    }
  };

  // Dynamic Report Master Category & Route Handlers
  const handleAddNewCategory = async () => {
    if (!newGroupTitle.trim()) {
      toast.warning("Enter category title");
      return;
    }

    try {
      const nextId = reportMasters.length + 1;
      const success = await saveReportMaster({
        group: newGroupTitle.trim(),
        group_id: nextId,
        order: nextId,
        pages: []
      });
      if (success) {
        toast.success(`Added report category "${newGroupTitle.trim()}"`);
        setNewGroupTitle("");
        loadMasters();
      }
    } catch (e) {
      toast.error("Error adding category");
    }
  };

  const handleAddNewReportPage = async () => {
    if (!selectedGroupForNewPage) {
      toast.warning("Select a category");
      return;
    }
    if (!newPageData.title.trim() || !newPageData.route.trim()) {
      toast.warning("Enter Title and Route Path");
      return;
    }

    const targetGroup = reportMasters.find(m => String(m.group_id ?? m.report_id) === String(selectedGroupForNewPage));
    if (!targetGroup) return;

    const routeKey = newPageData.route.startsWith("/") ? newPageData.route.trim() : `/${newPageData.route.trim()}`;
    const existingPages = Array.isArray(targetGroup.pages) ? [...targetGroup.pages] : [];

    const newPageObj = {
      name: newPageData.title.trim(),
      route: routeKey,
      description: newPageData.description.trim() || "",
      icon: "FileText",
      permissions: {
        [newPageData.title.trim()]: newPageData.permission.trim() || `HMS-RPT-${newPageData.title.replace(/\s+/g, "-").toUpperCase()}`
      },
      page_id: newPageData.page_id.trim() || (existingPages.length + 1)
    };

    // Filter out if route already exists
    const updatedPages = existingPages.filter(p => p.route !== routeKey).concat(newPageObj);

    try {
      const success = await saveReportMaster({
        group: targetGroup.group || targetGroup.report_title,
        group_id: targetGroup.group_id ?? targetGroup.report_id,
        order: targetGroup.order || 1,
        pages: updatedPages
      });
      if (success) {
        toast.success(`Added report "${newPageData.title}"`);
        setNewPageData({ title: "", route: "", description: "", permission: "", page_id: "" });
        loadMasters();
      }
    } catch (e) {
      toast.error("Error adding report page");
    }
  };

  const handleDeleteReportPage = async (group, routeKey) => {
    const result = await Swal.fire({
      title: "Remove Report?",
      text: `Remove ${routeKey} from ${group.group || group.report_title}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Remove"
    });

    if (result.isConfirmed) {
      const existingPages = Array.isArray(group.pages) ? group.pages : [];
      const updatedPages = existingPages.filter(p => p.route !== routeKey);

      try {
        const success = await saveReportMaster({
          group: group.group || group.report_title,
          group_id: group.group_id ?? group.report_id,
          order: group.order || 1,
          pages: updatedPages
        });
        if (success) {
          toast.success("Report removed");
          loadMasters();
        }
      } catch (e) {
        toast.error("Error removing report");
      }
    }
  };

  // Filtered reports calculation
  const totalAllocatedCount = Object.keys(allocatedPermissions).length;

  const filteredMasters = useMemo(() => {
    if (!searchTerm.trim()) return reportMasters;
    const q = searchTerm.trim().toLowerCase();

    return reportMasters
      .map(group => {
        const groupTitle = (group.group || group.report_title || "").toLowerCase();
        const pages = getGroupPages(group);

        const matchedPages = pages.filter(p => {
          const name = (p.name || "").toLowerCase();
          const route = (p.route || "").toLowerCase();
          const desc = (p.description || "").toLowerCase();
          const perm = (p.permission || "").toLowerCase();
          const pageId = String(p.page_id || "").toLowerCase();

          return (
            name.includes(q) ||
            route.includes(q) ||
            desc.includes(q) ||
            perm.includes(q) ||
            pageId.includes(q)
          );
        });

        if (groupTitle.includes(q)) {
          return group;
        }

        if (matchedPages.length > 0) {
          return {
            ...group,
            pages: matchedPages
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [reportMasters, searchTerm]);

  const filteredEmployeesForCopy = useMemo(() => {
    if (!copySearchText.trim()) return employees;
    const q = copySearchText.trim().toLowerCase();
    return employees.filter(emp =>
      (emp.employeeName || "").toLowerCase().includes(q) ||
      (emp.employeeId || "").toLowerCase().includes(q) ||
      (emp.department || "").toLowerCase().includes(q)
    );
  }, [employees, copySearchText]);

  return (
    <TabContainer>
      {/* ── Employee Top Banner ── */}
      <EmpBanner>
        <div className="emp-info">
          <div className="avatar">
            {(selectedEmployee?.employeeName || "E").charAt(0).toUpperCase()}
          </div>
          <div className="details">
            <h3>{selectedEmployee?.employeeName || "No Employee Selected"}</h3>
            <p>
              ID: <strong>{empId || "-"}</strong> &nbsp;|&nbsp; Dept:{" "}
              <strong>{selectedEmployee?.department || "General"}</strong> &nbsp;|&nbsp; Role:{" "}
              <strong>{selectedEmployee?.designation || "Staff"}</strong>
            </p>
          </div>
        </div>

        <div className="banner-actions">
          <button
            type="button"
            className="btn-action"
            onClick={openCopyModal}
            title="Copy or Transfer report permissions to/from other employees"
          >
            <Copy size={15} /> Copy / Transfer
          </button>
          <button
            type="button"
            className="btn-action"
            onClick={() => setShowMasterModal(true)}
            title="Add or Edit Report Master categories and routes dynamically"
          >
            <Layers size={15} /> Report Master
          </button>
          <button
            type="button"
            className="btn-action"
            onClick={() => loadMasters(true)}
            title="Re-seed Default Reports"
          >
            <RefreshCw size={15} /> Reset Defaults
          </button>
          <button
            type="button"
            className="btn-save-main"
            onClick={handleSaveConfig}
            disabled={saving || !empId}
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </EmpBanner>

      {/* ── Search & Global Controls ── */}
      <FilterBar>
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search report by name, route, description, or code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="quick-stats">
          <div className="badge-stat">
            Allocated Reports: <strong>{totalAllocatedCount}</strong>
          </div>
          <button
            type="button"
            className="btn-toggle-all"
            onClick={handleGlobalSelectAll}
          >
            Select All Reports
          </button>
          <button
            type="button"
            className="btn-toggle-all"
            onClick={handleGlobalClearAll}
          >
            Clear All
          </button>
        </div>
      </FilterBar>

      {/* ── Report Groups List ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "10px" }}>Loading Report Allocation Catalog...</p>
        </div>
      ) : filteredMasters.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No reports found matching your criteria.
        </div>
      ) : (
        filteredMasters.map(group => {
          const groupId = String(group.group_id ?? group.report_id);
          const groupTitle = group.group || group.report_title || "Report Group";
          const groupPages = getGroupPages(group);
          const allocatedInGroup = groupPages.filter(p => Boolean(allocatedPermissions[p.route])).length;
          const isExpanded = expandedCategories[groupId] !== false;
          const isAllGroupSelected = groupPages.length > 0 && allocatedInGroup === groupPages.length;

          return (
            <CategoryCard key={groupId}>
              <div
                className="category-header"
                onClick={() => toggleCategoryExpand(groupId)}
              >
                <div className="header-left">
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className="title">{groupTitle}</span>
                  <span className="count-badge">
                    {allocatedInGroup} / {groupPages.length} Allocated
                  </span>
                </div>

                <div
                  className="header-right"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn-cat-select"
                    onClick={() => handleToggleGroup(group)}
                  >
                    {isAllGroupSelected ? "Deselect Group" : "Select Group"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="reports-grid">
                  {groupPages.map(page => {
                    const isAllocated = Boolean(allocatedPermissions[page.route]);

                    return (
                      <ReportItemCard
                        key={page.route}
                        $active={isAllocated}
                        onClick={() => handleToggleReport(group, page)}
                      >
                        <div className="item-top">
                          <span className="item-title">{page.name}</span>
                          <div className="custom-checkbox">
                            {isAllocated && <Check size={14} />}
                          </div>
                        </div>

                        {page.description && (
                          <div className="item-desc">{page.description}</div>
                        )}

                        <div className="item-meta">
                          <span className="route-pill">{page.route}</span>
                          {page.permission && (
                            <span className="code-pill">{page.permission}</span>
                          )}
                          {page.page_id && (
                            <span className="code-pill" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                              ID: {page.page_id}
                            </span>
                          )}
                        </div>
                      </ReportItemCard>
                    );
                  })}
                </div>
              )}
            </CategoryCard>
          );
        })
      )}

      {/* ── Copy / Transfer Modal ── */}
      {showCopyModal && (
        <ModalOverlay onClick={() => setShowCopyModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Copy / Transfer Report Permissions</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowCopyModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Mode Toggle */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Action Mode:</span>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                  <input
                    type="radio"
                    name="copyMode"
                    checked={!isTransferMode}
                    onChange={() => setIsTransferMode(false)}
                  />
                  <strong>Copy (Duplicate permissions)</strong>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem", marginLeft: "14px" }}>
                  <input
                    type="radio"
                    name="copyMode"
                    checked={isTransferMode}
                    onChange={() => setIsTransferMode(true)}
                  />
                  <strong style={{ color: "#d97706" }}>Transfer (Move from source)</strong>
                </label>
              </div>

              {/* Source Employee */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>
                  Source Employee (Take permissions from)
                </label>
                <select
                  value={copySourceEmpId}
                  onChange={e => setCopySourceEmpId(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  <option value="">-- Choose Source Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName} ({emp.employeeId}) - {emp.department || "Staff"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Employees */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>
                  Target Employees (Apply permissions to) &nbsp;
                  <span style={{ color: "#0d9488" }}>({copyTargetEmpIds.length} selected)</span>
                </label>
                <input
                  type="text"
                  placeholder="Filter target employees..."
                  value={copySearchText}
                  onChange={e => setCopySearchText(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "8px", boxSizing: "border-box" }}
                />

                <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
                  {filteredEmployeesForCopy
                    .filter(emp => emp.employeeId !== copySourceEmpId)
                    .map(emp => {
                      const isSelected = copyTargetEmpIds.includes(emp.employeeId);
                      return (
                        <div
                          key={emp.employeeId}
                          onClick={() => {
                            if (isSelected) {
                              setCopyTargetEmpIds(prev => prev.filter(id => id !== emp.employeeId));
                            } else {
                              setCopyTargetEmpIds(prev => [...prev, emp.employeeId]);
                            }
                          }}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "6px",
                            background: isSelected ? "#f0fdf4" : "transparent",
                            border: `1px solid ${isSelected ? "#86efac" : "transparent"}`,
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px"
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>
                              {emp.employeeName}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              {emp.employeeId} | {emp.department}
                            </div>
                          </div>
                          <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: "2px solid #0d9488", background: isSelected ? "#0d9488" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: "600" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCopy}
                style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#0d9488", color: "#fff", cursor: "pointer", fontWeight: "700" }}
              >
                Apply {isTransferMode ? "Transfer" : "Copy"}
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ── Report Master Configuration Modal ── */}
      {showMasterModal && (
        <ModalOverlay onClick={() => setShowMasterModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: "750px" }}>
            <div className="modal-header">
              <h3>Report Master Configuration</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowMasterModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Add New Category */}
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FolderPlus size={16} /> Add New Report Category
                </h4>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Category title (e.g., Pharmacy, Diagnostics)..."
                    value={newGroupTitle}
                    onChange={e => setNewGroupTitle(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#0d9488", color: "#fff", fontWeight: "700", cursor: "pointer" }}
                  >
                    Add Category
                  </button>
                </div>
              </div>

              {/* Add New Report Item */}
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Plus size={16} /> Add Report Page to Category
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>Select Category</label>
                    <select
                      value={selectedGroupForNewPage}
                      onChange={e => setSelectedGroupForNewPage(e.target.value)}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="">-- Choose Category --</option>
                      {reportMasters.map(m => {
                        const gid = String(m.group_id ?? m.report_id);
                        return (
                          <option key={gid} value={gid}>
                            {m.group || m.report_title}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>Report Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Daily Shift Collection"
                      value={newPageData.title}
                      onChange={e => setNewPageData(p => ({ ...p, title: e.target.value }))}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>Route Path</label>
                    <input
                      type="text"
                      placeholder="e.g., /DailyShiftCollection"
                      value={newPageData.route}
                      onChange={e => setNewPageData(p => ({ ...p, route: e.target.value }))}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>Permission Code</label>
                    <input
                      type="text"
                      placeholder="e.g., HMS-RPT-SHIFT-COLL"
                      value={newPageData.permission}
                      onChange={e => setNewPageData(p => ({ ...p, permission: e.target.value }))}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewReportPage}
                  style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#0d9488", color: "#fff", fontWeight: "700", cursor: "pointer" }}
                >
                  Add Report Page
                </button>
              </div>

              {/* Master Categories & List View */}
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                {reportMasters.map(g => {
                  const gid = String(g.group_id ?? g.report_id);
                  const gPages = getGroupPages(g);
                  return (
                    <div key={gid} style={{ marginBottom: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>
                          {g.group || g.report_title} (ID: {gid})
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {gPages.length} reports
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {gPages.map(page => (
                          <div
                            key={page.route}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              background: "#f8fafc",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "0.78rem"
                            }}
                          >
                            <div>
                              <strong>{page.name}</strong> &nbsp;
                              <span style={{ color: "#64748b" }}>({page.route})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteReportPage(g, page.route)}
                              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                              title="Remove from group"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowMasterModal(false)}
                style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: "700" }}
              >
                Close
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </TabContainer>
  );
};

export default ReportConfigurationTab;
