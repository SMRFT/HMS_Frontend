import apiRequest from "./apiRequest";

const getBaseUrl = () => {
  const base = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "";
  return base.replace(/\/$/, "");
};

/**
 * Fetch all report master groups (Stores, Accounts, General Reports, etc.)
 * Supports optional group filter e.g. 'Stores'
 */
export const fetchReportMasters = async (groupOrSeed = null) => {
  const base = getBaseUrl();
  let url = `${base}/report-master/`;
  if (typeof groupOrSeed === "string" && groupOrSeed.trim()) {
    url = `${base}/report-master/?group=${encodeURIComponent(groupOrSeed.trim())}`;
  } else if (groupOrSeed === true) {
    url = `${base}/report-master/?seed=true`;
  }
  const res = await apiRequest(url, "GET");
  if (res && res.success && res.data) {
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.data)) return res.data.data;
  }
  return [];
};

/**
 * Create or update a report master group dynamically.
 */
export const saveReportMaster = async (payload) => {
  const base = getBaseUrl();
  const res = await apiRequest(`${base}/report-master/`, "POST", payload);
  return res && res.success;
};

/**
 * Deactivate / delete a report master group.
 */
export const deleteReportMaster = async (reportId) => {
  const base = getBaseUrl();
  const res = await apiRequest(`${base}/report-master/${encodeURIComponent(reportId)}/`, "DELETE");
  return res && res.success;
};

/**
 * Fetch report configuration allocated to a specific employee.
 */
export const fetchEmployeeReportConfig = async (employeeId) => {
  if (!employeeId) return null;
  const base = getBaseUrl();
  const res = await apiRequest(`${base}/report-configuration-master/?employeeId=${encodeURIComponent(employeeId)}`, "GET");
  if (res && res.success && res.data) {
    return res.data.data || res.data || null;
  }
  return null;
};

/**
 * Save / allocate report configuration for an employee.
 */
export const saveEmployeeReportConfig = async (employeeId, reportPermissions, reports) => {
  const base = getBaseUrl();
  const payload = {
    employeeid: String(employeeId).trim(),
    employee_id: String(employeeId).trim(),
    report_permissions: reportPermissions || {},
    reports: reports || {}
  };
  const res = await apiRequest(`${base}/report-configuration-master/`, "POST", payload);
  return res && res.success;
};

/**
 * Copy or transfer report configuration from source employee to one or more target employees.
 */
export const copyEmployeeReportConfig = async (sourceEmployeeId, targetEmployeeIds, isTransfer = false) => {
  const base = getBaseUrl();
  const payload = {
    source_employee_id: String(sourceEmployeeId).trim(),
    target_employee_ids: targetEmployeeIds || [],
    is_transfer: Boolean(isTransfer)
  };
  const res = await apiRequest(`${base}/report-configuration-copy/`, "POST", payload);
  return res && res.success;
};

/**
 * Fetch active report permissions for logged-in employee to store in session/localStorage.
 */
export const fetchMyReportPermissions = async (employeeId) => {
  if (!employeeId) return null;
  const base = getBaseUrl();
  const res = await apiRequest(`${base}/my-report-permissions/?employeeId=${encodeURIComponent(employeeId)}`, "GET");
  if (res && res.success && res.data) {
    return res.data.data || res.data || null;
  }
  return null;
};
