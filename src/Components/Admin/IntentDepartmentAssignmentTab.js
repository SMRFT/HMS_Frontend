import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  Search,
  Check,
  Building2,
  Copy,
  X,
  RefreshCw,
  Save,
  CheckSquare,
  Info
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";

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
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  padding: 18px 24px;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.2);
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

    .counter-badge {
      background: rgba(255, 255, 255, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  background: #f8fafc;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  .search-box {
    position: relative;
    flex: 1;
    min-width: 240px;
    max-width: 400px;

    input {
      width: 100%;
      padding: 9px 12px 9px 36px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.88rem;
      outline: none;
      transition: all 0.2s;
      background: #ffffff;

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

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &.primary {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
      transform: translateY(-1px);
    }
  }

  &.secondary {
    background: #ffffff;
    color: #334155;
    border: 1px solid #cbd5e1;

    &:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
  }

  &.outline-danger {
    background: #ffffff;
    color: #ef4444;
    border: 1px solid #fca5a5;

    &:hover:not(:disabled) {
      background: #fef2f2;
    }
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const DeptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  max-height: 520px;
  overflow-y: auto;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const DeptCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid ${props => props.$selected ? "#0284c7" : "#e2e8f0"};
  background: ${props => props.$selected ? "#f0f9ff" : "#ffffff"};
  cursor: pointer;
  transition: all 0.18s ease-in-out;
  user-select: none;

  &:hover {
    border-color: #0284c7;
    background: ${props => props.$selected ? "#e0f2fe" : "#f8fafc"};
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 1.5px solid ${props => props.$selected ? "#0284c7" : "#cbd5e1"};
    background: ${props => props.$selected ? "#0284c7" : "#ffffff"};
    color: #ffffff;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .dept-meta {
    flex: 1;
    min-width: 0;

    .dept-code {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      color: ${props => props.$selected ? "#0369a1" : "#64748b"};
      background: ${props => props.$selected ? "#e0f2fe" : "#f1f5f9"};
      padding: 1px 6px;
      border-radius: 4px;
      margin-bottom: 3px;
      letter-spacing: 0.03em;
    }

    .dept-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const CopyBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f1f5f9;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #475569;
  flex-wrap: wrap;

  select {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    font-size: 0.82rem;
    background: #ffffff;
    outline: none;
    min-width: 200px;
  }
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  color: #1e40af;
  font-size: 0.84rem;
  line-height: 1.45;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

// Helpers to extract department code and name safely across various payload models
const getDeptCode = (d) => String(d?.code || d?.department_code || d?.department_id || d?._id || "").trim();
const getDeptName = (d) => String(d?.name || d?.department_name || d?.description || getDeptCode(d)).trim();

export default function IntentDepartmentAssignmentTab({
  selectedEmployee,
  departments: initialDepartments = [],
  employees = [],
  onUpdateEmployee
}) {
  const [departments, setDepartments] = useState(initialDepartments || []);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [configuredAssignments, setConfiguredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copyEmpId, setCopyEmpId] = useState("");

  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "";

  // 1. Fetch configured employee assignments list for copy dropdown
  const fetchAllAssignments = useCallback(async () => {
    try {
      const url = `${Hmsbaseurl.replace(/\/$/, '')}/stores-intent-department-approval/`;
      const res = await apiRequest(url, "GET");
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setConfiguredAssignments(list);
    } catch (err) {
      console.warn("Could not fetch configured department assignments:", err);
    }
  }, [Hmsbaseurl]);

  useEffect(() => {
    fetchAllAssignments();
  }, [fetchAllAssignments]);

  // 2. Fetch selected employee's assignments from separate collection
  useEffect(() => {
    if (selectedEmployee?.employeeId) {
      const fetchEmpAssignments = async () => {
        try {
          setLoading(true);
          const url = `${Hmsbaseurl.replace(/\/$/, '')}/stores-intent-department-approval/${selectedEmployee.employeeId}/`;
          const res = await apiRequest(url, "GET");
          const data = res?.data || res || {};
          const depts = data.departments || [];
          setSelectedDepts(Array.isArray(depts) ? [...depts] : []);
        } catch (err) {
          console.error("Error fetching employee department assignments:", err);
          setSelectedDepts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchEmpAssignments();
    } else {
      setSelectedDepts([]);
    }
  }, [selectedEmployee?.employeeId, Hmsbaseurl]);

  // 3. Fetch departments if not provided
  useEffect(() => {
    const fetchDepartments = async () => {
      if (departments && departments.length > 0) return;
      try {
        setLoading(true);
        const url = `${Hmsbaseurl.replace(/\/$/, '')}/department-master/`;
        const res = await apiRequest(url, "GET");
        const list = Array.isArray(res) ? res : (res?.data || res?.data?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          setDepartments(list);
        }
      } catch (err) {
        console.error("Error fetching departments for intent assignment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [departments, Hmsbaseurl]);

  // Filtered departments based on search
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return departments;
    const q = searchTerm.toLowerCase();
    return departments.filter(d => {
      const code = getDeptCode(d).toLowerCase();
      const name = getDeptName(d).toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }, [departments, searchTerm]);

  // Toggle department
  const toggleDept = (code) => {
    if (!code) return;
    setSelectedDepts(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  // Select all filtered
  const selectAllFiltered = () => {
    const codesToAdd = filteredDepartments.map(d => getDeptCode(d)).filter(Boolean);
    setSelectedDepts(prev => Array.from(new Set([...prev, ...codesToAdd])));
  };

  // Clear all
  const clearAll = () => {
    setSelectedDepts([]);
  };

  // Copy from another employee
  const handleCopyPermissions = () => {
    if (!copyEmpId) {
      toast.warn("Please select an employee to copy from");
      return;
    }
    const source = configuredAssignments.find(a => a.employee_id === copyEmpId);
    if (!source || !source.departments || source.departments.length === 0) {
      toast.info("Selected employee has no assigned departments");
      return;
    }
    setSelectedDepts([...source.departments]);
    toast.success(`Copied ${source.departments.length} department assignments from ${source.employee_name || copyEmpId}`);
  };

  // Save assignments to separate StoresIntentDepartmentApproval model
  const handleSave = async () => {
    if (!selectedEmployee?.employeeId) {
      toast.error("No employee selected");
      return;
    }

    try {
      setSaving(true);
      const url = `${Hmsbaseurl.replace(/\/$/, '')}/stores-intent-department-approval/`;
      const payload = {
        employee_id: selectedEmployee.employeeId,
        departments: selectedDepts
      };
      const res = await apiRequest(url, "POST", payload);

      if (res && (res.success || res.status === 200 || !res.error)) {
        toast.success(`Store Intent department assignments saved successfully for ${selectedEmployee.employeeName || selectedEmployee.employeeId}`);
        fetchAllAssignments();
        if (onUpdateEmployee) {
          onUpdateEmployee({
            ...selectedEmployee
          });
        }
      } else {
        toast.error(res?.error || res?.message || "Failed to update department assignments");
      }
    } catch (err) {
      console.error("Error saving intent approval departments:", err);
      toast.error("Error saving department assignments");
    } finally {
      setSaving(false);
    }
  };

  if (!selectedEmployee?.employeeId) {
    return (
      <TabContainer>
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          <Building2 size={40} style={{ opacity: 0.4, marginBottom: "10px" }} />
          <p>Please select an employee from the list to assign intent approval departments.</p>
        </div>
      </TabContainer>
    );
  }

  return (
    <TabContainer>
      {/* Employee Banner */}
      <EmpBanner>
        <div className="emp-info">
          <div className="avatar">
            {(selectedEmployee.employeeName || selectedEmployee.employeeId || "E")[0].toUpperCase()}
          </div>
          <div className="details">
            <h3>{selectedEmployee.employeeName || selectedEmployee.employeeId}</h3>
            <p>
              ID: <strong>{selectedEmployee.employeeId}</strong> &bull; Dept: {selectedEmployee.department_name || selectedEmployee.department || "N/A"} &bull; Role: {selectedEmployee.primaryRole || "Standard"}
            </p>
          </div>
        </div>
        <div className="banner-actions">
          <span className="counter-badge">
            {selectedDepts.length} of {departments.length} Departments Assigned
          </span>
        </div>
      </EmpBanner>

      {/* Info Notice */}
      <InfoBox>
        <Info size={18} />
        <div>
          Assigning departments here grants this employee administrative approval rights for Store Intent requisitions originating from these departments in the <strong>Department Intent Admin Approval (/StoresIntentHODApproval)</strong> page.
        </div>
      </InfoBox>

      {/* Copy Toolbar (optional helper) */}
      {configuredAssignments && configuredAssignments.filter(a => a.employee_id !== selectedEmployee.employeeId && a.departments?.length > 0).length > 0 && (
        <CopyBar>
          <Copy size={16} color="#0284c7" />
          <span>Copy assignments from:</span>
          <select value={copyEmpId} onChange={(e) => setCopyEmpId(e.target.value)}>
            <option value="">-- Select Employee --</option>
            {configuredAssignments
              .filter(a => a.employee_id !== selectedEmployee.employeeId && a.departments?.length > 0)
              .map(a => (
                <option key={a.employee_id} value={a.employee_id}>
                  {a.employee_name || a.employee_id} ({a.departments?.length || 0} depts)
                </option>
              ))}
          </select>
          <Button type="button" className="secondary" onClick={handleCopyPermissions} disabled={!copyEmpId}>
            Copy
          </Button>
        </CopyBar>
      )}

      {/* Main Toolbar */}
      <Toolbar>
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search department name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="actions">
          <Button type="button" className="secondary" onClick={selectAllFiltered}>
            <CheckSquare size={15} /> Select All {searchTerm ? "Filtered" : ""}
          </Button>
          <Button type="button" className="outline-danger" onClick={clearAll} disabled={selectedDepts.length === 0}>
            <X size={15} /> Clear All
          </Button>
          <Button type="button" className="primary" onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
            {saving ? "Saving..." : "Save Department Assignments"}
          </Button>
        </div>
      </Toolbar>

      {/* Department Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: 8 }} />
          <div>Loading departments...</div>
        </div>
      ) : (
        <DeptGrid>
          {filteredDepartments.map((dept) => {
            const code = getDeptCode(dept);
            const name = getDeptName(dept);
            const isSelected = selectedDepts.includes(code);
            return (
              <DeptCard
                key={code}
                $selected={isSelected}
                onClick={() => toggleDept(code)}
              >
                <div className="checkbox-wrapper">
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="dept-meta">
                  <span className="dept-code">{code}</span>
                  <div className="dept-name" title={name}>
                    {name}
                  </div>
                </div>
              </DeptCard>
            );
          })}
          {filteredDepartments.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "30px", color: "#94a3b8" }}>
              No departments match "{searchTerm}"
            </div>
          )}
        </DeptGrid>
      )}
    </TabContainer>
  );
}

