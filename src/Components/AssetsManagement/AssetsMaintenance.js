import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import JsBarcode from 'jsbarcode';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { 
  Plus, Printer, Edit, Search, Save, X, Trash2, Loader, 
  ToggleLeft, ToggleRight, Eye, CheckCircle2, ShieldCheck, 
  Wrench, Clock, CheckCircle, FileText, Download, DollarSign, Activity 
} from 'lucide-react';

import apiRequest from '../../Auth/apiRequest';

import { PageWrapper, Container, ModalHeader, ModalTitle, Button, FormContent, ControlsContainer, InputWrapper, Input, SearchContainer, TableWrapper, Table, Tr, Th, Td, ModalOverlay, ModalBody, FormRow, Label, CloseButton, ButtonContainer } from '../GlobalStyles';
import * as S from '../GlobalStyles';

const baseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  background: none;
  cursor: pointer;
  color: ${props => props.$active ? '#2563eb' : '#64748b'};
  border-bottom: 3px solid ${props => props.$active ? '#2563eb' : 'transparent'};
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #2563eb;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const SummaryCard = styled.div`
  background: ${props => props.$bg || '#ffffff'};
  border: 1px solid ${props => props.$border || '#e2e8f0'};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const CardIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: ${props => props.$iconBg || '#eff6ff'};
  color: ${props => props.$iconColor || '#2563eb'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;

  .val {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }
  .lbl {
    font-size: 0.8rem;
    color: #64748b;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  ${props => props.$status === 'Approved' && `background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;`}
  ${props => props.$status === 'Pending' && `background: #fef9c3; color: #a16207; border: 1px solid #fef08a;`}
  ${props => props.$status === 'Completed' && `background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;`}
  ${props => props.$status === 'Rejected' && `background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;`}
`;

const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
  width: 100%;
`;

const FormGrid = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const FlexCol = styled.div`
  flex: ${props => props.flex || 1};
  min-width: ${props => props.minW || '140px'};
`;

const SearchableDepartmentSelect = ({ departments, selectedValue, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = React.useRef(null);

    const valStr = selectedValue ? String(selectedValue).trim() : '';

    const selectedDept = departments.find(d => {
        if (!valStr) return false;
        const dId = d.department_id ? String(d.department_id).trim() : '';
        const dName = d.department_name ? String(d.department_name).trim() : '';
        return (dId && dId.toLowerCase() === valStr.toLowerCase()) ||
               (dName && dName.toLowerCase() === valStr.toLowerCase());
    });

    const displayLabel = valStr
        ? (selectedDept ? selectedDept.department_name : valStr)
        : '-- All Departments --';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredDepts = departments.filter(d =>
        !searchTerm || (d.department_name && d.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '5px 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    background: '#ffffff',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    height: '32px'
                }}
            >
                <span style={{ color: valStr ? '#0f172a' : '#64748b', fontWeight: valStr ? '600' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayLabel}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '6px' }}>▼</span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    marginTop: '4px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    padding: '6px'
                }}>
                    <input
                        type="text"
                        autoFocus
                        placeholder="Type to search department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            marginBottom: '6px'
                        }}
                    />

                    <div
                        onClick={() => {
                            onChange('');
                            setIsOpen(false);
                            setSearchTerm('');
                        }}
                        style={{
                            padding: '6px 10px',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            background: !valStr ? '#eff6ff' : 'transparent',
                            color: !valStr ? '#2563eb' : '#334155',
                            fontWeight: !valStr ? '600' : 'normal'
                        }}
                    >
                        -- All Departments --
                    </div>

                    {filteredDepts.map((d, idx) => {
                        const dId = d.department_id ? String(d.department_id).trim() : '';
                        const dName = d.department_name ? String(d.department_name).trim() : '';
                        const isSelected = Boolean(valStr) && (
                            (dId && dId.toLowerCase() === valStr.toLowerCase()) ||
                            (dName && dName.toLowerCase() === valStr.toLowerCase())
                        );
                        const optVal = d.department_id || d.department_name || '';

                        return (
                            <div
                                key={idx}
                                onClick={() => {
                                    onChange(optVal);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    background: isSelected ? '#eff6ff' : 'transparent',
                                    color: isSelected ? '#2563eb' : '#334155',
                                    fontWeight: isSelected ? '600' : 'normal'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {d.department_name || d.department_id}
                            </div>
                        );
                    })}

                    {filteredDepts.length === 0 && (
                        <div style={{ padding: '8px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                            No matching department found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Assetsmaintenance = () => {
    const [activeTab, setActiveTab] = useState('machines'); // 'machines' | 'requests' | 'reports'

    // Assets State
    const [assets, setAssets] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Requests State
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    // Filters (Default: Last 30 days)
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        from_date: thirtyDaysAgo,
        to_date: today,
        search_barcode: '',
        machine_department: '',
        machine_active_status: 'all', // 'all' | 'true' | 'false'
        request_status: '',
        report_department: '',
        report_asset_id: '',
        report_incharge: '',
        report_cost: 'all', // 'all' | 'zero' | 'above_zero'
        report_search: ''
    });

    const initialForm = {
        asset_name: '',
        serial_number: '',
        barcode: '',
        date: today,
        department: '',
        warrenty_period: '',
        warrenty_end_date: '',
        status: 'Active',
        description: '',
        maintenance_details: []
    };

    const [formData, setFormData] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // View Modal State
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedViewAsset, setSelectedViewAsset] = useState(null);

    // Asset Services Modal State (for Service Reports Tab)
    const [showAssetServicesModal, setShowAssetServicesModal] = useState(false);
    const [selectedAssetServices, setSelectedAssetServices] = useState(null);

    // Deactivation Modal State
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [assetToDeactivate, setAssetToDeactivate] = useState(null);
    const [deactivateReason, setDeactivateReason] = useState("");

    // ADD SERVICE MODAL STATE (+ Add Service & Complete Service)
    const currentUser = localStorage.getItem('user_name') || localStorage.getItem('auth-user-name') || 'Technician / Incharge';
    const [showAddServiceModal, setShowAddServiceModal] = useState(false);
    const [addServiceData, setAddServiceData] = useState({
        asset_id: '',
        service_date: today,
        service_cost: 0,
        service_description: '',
        service_by: currentUser,
        linkedRequestId: null
    });
    const [addServiceLoading, setAddServiceLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/`);
        if (res.success && Array.isArray(res.data)) {
            setAssets(res.data);
        }
        setLoading(false);
    }, []);

    const fetchRequests = useCallback(async () => {
        setRequestsLoading(true);
        let query = `?from_date=${filters.from_date}&to_date=${filters.to_date}`;
        if (filters.request_status) query += `&status=${filters.request_status}`;

        const res = await apiRequest(`${baseurl}asset-maintenance-request/${query}`);
        if (res.success && Array.isArray(res.data)) {
            setRequests(res.data);
        }
        setRequestsLoading(false);
    }, [filters.from_date, filters.to_date, filters.request_status]);

    const fetchDepartments = useCallback(async () => {
        const res = await apiRequest(`${baseurl}department-master/`);
        if (res.success && Array.isArray(res.data)) {
            setDepartments(res.data);
        }
    }, []);

    const getDepartmentName = useCallback((deptId) => {
        if (!deptId) return '-';
        const dept = departments.find(d => String(d.department_id) === String(deptId) || String(d.department_name) === String(deptId));
        return dept ? dept.department_name : deptId;
    }, [departments]);

    useEffect(() => {
        fetchAssets();
        fetchRequests();
        fetchDepartments();
    }, [fetchAssets, fetchRequests, fetchDepartments]);

    const handleUniversalSearch = async () => {
        if (!filters.search_barcode) return fetchAssets();
        setLoading(true);
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(filters.search_barcode)}/`);
        if (res.success) {
            setAssets([res.data]);
        } else {
            toast.error("Asset not found");
            setAssets([]);
        }
        setLoading(false);
    };

    const handleEditForm = async (pk) => {
        setIsEditing(true);
        setCurrentId(pk);
        setShowForm(true);
        setFormLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(pk)}/`);
        if (res.success) setFormData(res.data);
        setFormLoading(false);
    };

    const handleCancelForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData(initialForm);
        setShowForm(false);
    };

    const handleSave = async () => {
        const method = isEditing ? 'PATCH' : 'POST';
        const url = isEditing
            ? `${baseurl}stores-assets-maintenance/${encodeURIComponent(currentId)}/`
            : `${baseurl}stores-assets-maintenance/`;

        setFormLoading(true);
        const res = await apiRequest(url, method, formData);

        if (res.success) {
            toast.success(isEditing ? "Updated Successfully" : "Created Successfully");
            handleCancelForm();
            fetchAssets();
        } else {
            toast.error("Failed to save data");
        }
        setFormLoading(false);
    };

    // Toggle logic
    const handleToggleActiveClick = (asset) => {
        if (asset.is_active === false) {
            activateAsset(asset.asset_id);
        } else {
            setAssetToDeactivate(asset);
            setDeactivateReason("");
            setShowDeactivateModal(true);
        }
    };

    const activateAsset = async (id) => {
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(id)}/`, 'PATCH', { is_active: true, deactivated_date: null, deactivate_remarks: "" });
        if (res.success) {
            toast.success("Asset reactivated");
            fetchAssets();
        } else toast.error("Failed to reactivate");
    };

    const confirmDeactivate = async () => {
        if (!deactivateReason.trim()) return toast.warning("Please provide a remark for deactivation");
        const res = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(assetToDeactivate.asset_id)}/`, 'PATCH', { is_active: false, deactivate_remarks: deactivateReason });

        if (res.success) {
            toast.success("Asset deactivated successfully");
            setShowDeactivateModal(false);
            fetchAssets();
        } else toast.error("Failed to deactivate");
    };

    // OPEN ADD SERVICE MODAL (Standalone or from Complete Service)
    const openAddServiceModal = (targetAssetId = '', linkedReq = null) => {
        setAddServiceData({
            asset_id: targetAssetId || (assets.length > 0 ? assets[0].asset_id : ''),
            service_date: today,
            service_cost: linkedReq ? (linkedReq.service_cost || 0) : 0,
            service_description: linkedReq ? linkedReq.description : '',
            service_by: currentUser,
            linkedRequestId: linkedReq ? linkedReq.request_id : null
        });
        setShowAddServiceModal(true);
    };

    // SUBMIT ADD SERVICE MODAL
    const handleSaveAddServiceModal = async () => {
        if (!addServiceData.asset_id) return toast.warning("Please select a Machine / Asset");
        if (!addServiceData.service_description.trim()) return toast.warning("Please enter service description / remarks");

        setAddServiceLoading(true);

        const targetAsset = assets.find(a => String(a.asset_id) === String(addServiceData.asset_id));
        if (!targetAsset) {
            setAddServiceLoading(false);
            return toast.error("Selected asset not found");
        }

        const existingLogs = list(targetAsset.maintenance_details || []);
        const newLog = {
            service_date: addServiceData.service_date,
            service_cost: parseFloat(addServiceData.service_cost) || 0,
            service_description: addServiceData.service_description,
            service_by: addServiceData.service_by
        };
        const updatedLogs = [...existingLogs, newLog];

        let success = false;

        if (addServiceData.linkedRequestId) {
            // If completing a Maintenance Request, backend handles updating status & logging to Asset
            const reqRes = await apiRequest(`${baseurl}asset-maintenance-request/${encodeURIComponent(addServiceData.linkedRequestId)}/`, 'PATCH', {
                status: 'Completed',
                service_cost: parseFloat(addServiceData.service_cost) || 0,
                service_remarks: addServiceData.service_description,
                completed_by: addServiceData.service_by,
                completion_date: addServiceData.service_date
            });
            success = reqRes.success;
        } else {
            // Standalone service log addition directly on Asset
            const assetRes = await apiRequest(`${baseurl}stores-assets-maintenance/${encodeURIComponent(addServiceData.asset_id)}/`, 'PATCH', {
                maintenance_details: updatedLogs,
                last_service_date: addServiceData.service_date
            });
            success = assetRes.success;
        }

        if (success) {
            toast.success("Service record saved successfully & Last Service Date updated!");
            setShowAddServiceModal(false);
            fetchAssets();
            fetchRequests();
        } else {
            toast.error("Failed to add service record");
        }
        setAddServiceLoading(false);
    };

    // Helper helper to ensure array type
    function list(val) {
        if (Array.isArray(val)) return val;
        return [];
    }

    // FILTERED MACHINES FOR TAB 1 (Department, Active/Inactive, and Search including Department text)
    const filteredMachines = React.useMemo(() => {
        return assets.filter(a => {
            if (filters.machine_department) {
                const targetFilter = String(filters.machine_department).toLowerCase().trim();
                const deptObj = departments.find(d =>
                    String(d.department_id || '').toLowerCase().trim() === targetFilter ||
                    String(d.department_name || '').toLowerCase().trim() === targetFilter
                );

                const deptId = deptObj ? String(deptObj.department_id || '').toLowerCase().trim() : targetFilter;
                const deptName = deptObj ? String(deptObj.department_name || '').toLowerCase().trim() : targetFilter;

                const assetDeptRaw = String(a.department || '').toLowerCase().trim();
                const assetDeptResolvedName = String(getDepartmentName(a.department) || '').toLowerCase().trim();

                const isMatch = (assetDeptRaw === deptId) ||
                                (assetDeptRaw === deptName) ||
                                (assetDeptRaw === targetFilter) ||
                                (assetDeptResolvedName === deptName);

                if (!isMatch) return false;
            }
            if (filters.machine_active_status === 'true' && a.is_active === false) {
                return false;
            }
            if (filters.machine_active_status === 'false' && a.is_active !== false) {
                return false;
            }
            if (filters.search_barcode) {
                const q = filters.search_barcode.toLowerCase().trim();
                const deptName = String(getDepartmentName(a.department) || '').toLowerCase();
                const match = (a.asset_id && a.asset_id.toLowerCase().includes(q)) ||
                              (a.barcode && a.barcode.toLowerCase().includes(q)) ||
                              (a.asset_name && a.asset_name.toLowerCase().includes(q)) ||
                              (a.incharge_name && a.incharge_name.toLowerCase().includes(q)) ||
                              (a.department && String(a.department).toLowerCase().includes(q)) ||
                              (deptName && deptName.includes(q));
                if (!match) return false;
            }
            return true;
        });
    }, [assets, filters.machine_department, filters.machine_active_status, filters.search_barcode, departments, getDepartmentName]);

    // EXTRACT UNIQUE INCHARGES FOR FILTER
    const uniqueIncharges = React.useMemo(() => {
        const set = new Set();
        assets.forEach(a => {
            if (a.incharge_name && a.incharge_name.trim()) {
                set.add(a.incharge_name.trim());
            }
        });
        return Array.from(set);
    }, [assets]);

    // FILTERED ASSETS FOR SERVICE REPORT (TAB 3)
    const filteredServiceAssets = React.useMemo(() => {
        return assets.filter(asset => {
            const logs = list(asset.maintenance_details);
            const totalCost = logs.reduce((sum, l) => sum + (parseFloat(l.service_cost) || 0), 0);

            // Department Filter
            if (filters.report_department) {
                const targetFilter = String(filters.report_department).toLowerCase().trim();
                const deptObj = departments.find(d =>
                    String(d.department_id || '').toLowerCase().trim() === targetFilter ||
                    String(d.department_name || '').toLowerCase().trim() === targetFilter
                );

                const deptId = deptObj ? String(deptObj.department_id || '').toLowerCase().trim() : targetFilter;
                const deptName = deptObj ? String(deptObj.department_name || '').toLowerCase().trim() : targetFilter;

                const assetDeptRaw = String(asset.department || '').toLowerCase().trim();
                const assetDeptResolvedName = String(getDepartmentName(asset.department) || '').toLowerCase().trim();

                const isMatch = (assetDeptRaw === deptId) ||
                                (assetDeptRaw === deptName) ||
                                (assetDeptRaw === targetFilter) ||
                                (assetDeptResolvedName === deptName) ||
                                (assetDeptRaw.includes(targetFilter)) ||
                                (assetDeptResolvedName.includes(targetFilter));

                if (!isMatch) return false;
            }

            // Asset Filter
            if (filters.report_asset_id && String(asset.asset_id) !== String(filters.report_asset_id)) {
                return false;
            }

            // Incharge Filter
            if (filters.report_incharge && String(asset.incharge_name || '') !== String(filters.report_incharge)) {
                return false;
            }

            // Cost Filter (0 or higher than 0)
            if (filters.report_cost === 'zero') {
                const hasZeroLog = logs.length === 0 || logs.some(l => (parseFloat(l.service_cost) || 0) === 0);
                if (totalCost !== 0 && !hasZeroLog) return false;
            } else if (filters.report_cost === 'above_zero') {
                const hasAboveZeroLog = logs.some(l => (parseFloat(l.service_cost) || 0) > 0);
                if (totalCost <= 0 && !hasAboveZeroLog) return false;
            }

            // Search Filter
            const q = (filters.report_search || '').toLowerCase();
            if (q) {
                const assetMatch = (asset.asset_id && asset.asset_id.toLowerCase().includes(q)) ||
                                   (asset.asset_name && asset.asset_name.toLowerCase().includes(q)) ||
                                   (asset.incharge_name && asset.incharge_name.toLowerCase().includes(q));
                const logMatch = logs.some(l => (l.service_description && l.service_description.toLowerCase().includes(q)) ||
                                                (l.service_by && l.service_by.toLowerCase().includes(q)));
                if (!assetMatch && !logMatch) return false;
            }

            return true;
        });
    }, [assets, filters.report_department, filters.report_asset_id, filters.report_incharge, filters.report_cost, filters.report_search, departments, getDepartmentName]);

    // SERVICE REPORT TOTALS
    const serviceReportTotals = React.useMemo(() => {
        let totalServices = 0;
        let totalExpenses = 0;
        filteredServiceAssets.forEach(asset => {
            const logs = list(asset.maintenance_details);
            totalServices += logs.length;
            totalExpenses += logs.reduce((sum, l) => sum + (parseFloat(l.service_cost) || 0), 0);
        });
        return {
            totalServices,
            totalExpenses,
            uniqueMachines: filteredServiceAssets.length
        };
    }, [filteredServiceAssets]);

    // EXPORT SERVICE REPORTS TO EXCEL
    const handleExportExcel = () => {
        if (filteredServiceAssets.length === 0) return toast.warning("No service records to export");

        const exportData = [];
        filteredServiceAssets.forEach(asset => {
            const logs = list(asset.maintenance_details);
            if (logs.length > 0) {
                logs.forEach((log, idx) => {
                    exportData.push({
                        "Asset ID": asset.asset_id,
                        "Asset Name": asset.asset_name,
                        "Department": getDepartmentName(asset.department),
                        "Incharge": asset.incharge_name || 'Unassigned',
                        "Service Date": log.service_date || asset.date || '-',
                        "Service Cost (₹)": parseFloat(log.service_cost) || 0,
                        "Service Description / Remarks": log.service_description || '-',
                        "Technician / Service By": log.service_by || '-'
                    });
                });
            } else {
                exportData.push({
                    "Asset ID": asset.asset_id,
                    "Asset Name": asset.asset_name,
                    "Department": getDepartmentName(asset.department),
                    "Incharge": asset.incharge_name || 'Unassigned',
                    "Service Date": '-',
                    "Service Cost (₹)": 0,
                    "Service Description / Remarks": 'No services logged',
                    "Technician / Service By": '-'
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Service Reports");
        XLSX.writeFile(wb, `Machine_Service_Report_${filters.from_date}_to_${filters.to_date}.xlsx`);
    };

    const printBarcode = (asset) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;

        const tempDiv = document.createElement('div');
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tempDiv.appendChild(svg);

        JsBarcode(svg, asset.barcode || asset.asset_id, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: false
        });

        doc.write(`
            <html>
                <head>
                    <style>
                        @page { size: 50mm 25mm; margin: 0; }
                        body { font-family: sans-serif; margin: 0; padding: 2mm; text-align: center; }
                        .name { font-size: 10px; font-weight: bold; margin-bottom: 2px; }
                        svg { width: 40mm; height: 12mm; }
                    </style>
                </head>
                <body>
                    <div class="name">${asset.asset_name}</div>
                    ${tempDiv.innerHTML}
                    <div>${asset.asset_id}</div>
                </body>
            </html>
        `);
        doc.close();
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
    };

    return (
        <PageWrapper>
            <Container>
                <ModalHeader $bg="white" style={{ borderBottom: 'none' }}>
                    <ModalTitle>Machine Maintenance Registry</ModalTitle>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            style={{ background: '#0284c7', color: 'white' }}
                            onClick={() => openAddServiceModal()}
                        >
                            <Plus size={18} style={{ marginRight: 4 }} /> Add Service
                        </Button>

                        {activeTab === 'machines' && (
                            <Button onClick={() => {
                                if (showForm) {
                                    handleCancelForm();
                                } else {
                                    setShowForm(true);
                                }
                            }}>
                                {showForm ? <><X size={18} style={{ marginRight: 4 }} /> Close Form</> : <><Plus size={18} style={{ marginRight: 4 }} /> New Machine</>}
                            </Button>
                        )}
                    </div>
                </ModalHeader>

                <FormContent style={{ paddingTop: 0 }}>
                    {/* TAB SYSTEM */}
                    <TabContainer>
                        <TabButton
                            $active={activeTab === 'machines'}
                            onClick={() => setActiveTab('machines')}
                        >
                            <Wrench size={16} /> Registered Machines
                        </TabButton>
                        <TabButton
                            $active={activeTab === 'requests'}
                            onClick={() => setActiveTab('requests')}
                        >
                            <Clock size={16} /> Maintenance Requests
                        </TabButton>
                        <TabButton
                            $active={activeTab === 'reports'}
                            onClick={() => setActiveTab('reports')}
                        >
                            <FileText size={16} /> Service Reports
                        </TabButton>
                    </TabContainer>

                    {/* ========================================= */}
                    {/* TAB 1: REGISTERED MACHINES */}
                    {/* ========================================= */}
                    {activeTab === 'machines' && (
                        <>
                            {/* INLINE FORM */}
                            {showForm && (
                                <FormGrid>
                                    {formLoading ? <div style={{ textAlign: 'center', padding: '20px' }}><Loader className="animate-spin" /></div> : (
                                        <>
                                            <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b' }}>
                                                {isEditing ? `Edit Machine: ${currentId}` : 'Register New Machine'}
                                            </h3>
                                            <FlexRow>
                                                <FlexCol flex={2}>
                                                    <InputWrapper>
                                                        <Label required>Machine Name (Asset Name)</Label>
                                                        <Input name="asset_name" value={formData.asset_name} onChange={handleInputChange} />
                                                    </InputWrapper>
                                                </FlexCol>
                                                <FlexCol flex={1.5}>
                                                    <InputWrapper>
                                                        <Label>Serial Number</Label>
                                                        <Input name="serial_number" value={formData.serial_number} onChange={handleInputChange} />
                                                    </InputWrapper>
                                                </FlexCol>
                                                <FlexCol flex={1}>
                                                    <InputWrapper>
                                                        <Label>Status</Label>
                                                        <S.Select name="status" value={formData.status} onChange={handleInputChange}>
                                                            <option value="Active">Active</option>
                                                            <option value="On service">On service</option>
                                                        </S.Select>
                                                    </InputWrapper>
                                                </FlexCol>
                                            </FlexRow>

                                            <FlexRow>
                                                <FlexCol flex={1.5}>
                                                    <InputWrapper>
                                                        <Label>Department</Label>
                                                        <SearchableDepartmentSelect
                                                            departments={departments}
                                                            selectedValue={formData.department}
                                                            onChange={val => setFormData({ ...formData, department: val })}
                                                        />
                                                    </InputWrapper>
                                                </FlexCol>
                                                <FlexCol flex={1.2}>
                                                    <InputWrapper>
                                                        <Label>Purchase Date</Label>
                                                        <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                                                    </InputWrapper>
                                                </FlexCol>
                                                <FlexCol flex={1.2}>
                                                    <InputWrapper>
                                                        <Label>Warranty Period</Label>
                                                        <Input name="warrenty_period" value={formData.warrenty_period} onChange={handleInputChange} placeholder="e.g. 1 Year, 6 Months" />
                                                    </InputWrapper>
                                                </FlexCol>
                                                <FlexCol flex={1.2}>
                                                    <InputWrapper>
                                                        <Label>Warranty End Date</Label>
                                                        <Input type="date" name="warrenty_end_date" value={formData.warrenty_end_date} onChange={handleInputChange} />
                                                    </InputWrapper>
                                                </FlexCol>
                                            </FlexRow>

                                            <FlexRow>
                                                <FlexCol flex={1}>
                                                    <InputWrapper>
                                                        <Label>Description</Label>
                                                        <Input name="description" value={formData.description} onChange={handleInputChange} />
                                                    </InputWrapper>
                                                </FlexCol>
                                            </FlexRow>

                                            <Divider style={{ margin: '15px 0' }} />

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Service History Logs</h4>
                                                <Button style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => {
                                                    const updated = [...list(formData.maintenance_details), { service_date: today, service_cost: 0, service_description: '' }];
                                                    setFormData({ ...formData, maintenance_details: updated });
                                                }}>
                                                    <Plus size={14} /> Add Service Log
                                                </Button>
                                            </div>

                                            {formData.maintenance_details && formData.maintenance_details.map((service, idx) => (
                                                <FormRow key={idx} style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                                                    <InputWrapper>
                                                        <Label>Date</Label>
                                                        <Input type="date" value={service.service_date} onChange={e => {
                                                            const updated = [...formData.maintenance_details];
                                                            updated[idx].service_date = e.target.value;
                                                            setFormData({ ...formData, maintenance_details: updated });
                                                        }} />
                                                    </InputWrapper>
                                                    <InputWrapper>
                                                        <Label>Cost</Label>
                                                        <Input type="number" value={service.service_cost} onChange={e => {
                                                            const updated = [...formData.maintenance_details];
                                                            updated[idx].service_cost = e.target.value;
                                                            setFormData({ ...formData, maintenance_details: updated });
                                                        }} />
                                                    </InputWrapper>
                                                    <InputWrapper style={{ gridColumn: 'span 2' }}>
                                                        <Label>Description</Label>
                                                        <Input value={service.service_description} onChange={e => {
                                                            const updated = [...formData.maintenance_details];
                                                            updated[idx].service_description = e.target.value;
                                                            setFormData({ ...formData, maintenance_details: updated });
                                                        }} />
                                                    </InputWrapper>
                                                    <Button onClick={() => {
                                                        const updated = formData.maintenance_details.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, maintenance_details: updated });
                                                    }} style={{ background: '#fee2e2', color: '#ef4444', alignSelf: 'flex-end' }}><Trash2 size={16} /></Button>
                                                </FormRow>
                                            ))}

                                            <ButtonContainer style={{ marginTop: '15px', justifyContent: 'flex-end' }}>
                                                <Button secondary onClick={handleCancelForm}>
                                                    <X size={16} /> Cancel
                                                </Button>
                                                <Button onClick={handleSave}>
                                                    <Save size={16} /> {isEditing ? 'Save Changes' : 'Save'}
                                                </Button>
                                            </ButtonContainer>
                                        </>
                                    )}
                                </FormGrid>
                            )}

                            {/* TABLE CONTROLS (3 FIELDS PER ROW) */}
                            <ControlsContainer style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '100%', alignItems: 'flex-end' }}>
                                    <InputWrapper>
                                        <Label>Filter Department</Label>
                                        <SearchableDepartmentSelect
                                            departments={departments}
                                            selectedValue={filters.machine_department}
                                            onChange={val => setFilters({ ...filters, machine_department: val })}
                                        />
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label>Active / Inactive Status</Label>
                                        <S.Select
                                            value={filters.machine_active_status}
                                            onChange={e => setFilters({ ...filters, machine_active_status: e.target.value })}
                                        >
                                            <option value="all">All Assets (Active & Deactive)</option>
                                            <option value="true">Active Assets Only</option>
                                            <option value="false">Deactive Assets Only</option>
                                        </S.Select>
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label>Search ID / Dept / Keyword</Label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Input
                                                placeholder="Search Barcode, Asset ID, Dept, Name..."
                                                value={filters.search_barcode}
                                                onChange={e => setFilters({ ...filters, search_barcode: e.target.value })}
                                                onKeyPress={(e) => e.key === 'Enter' && handleUniversalSearch()}
                                            />
                                            <Button onClick={handleUniversalSearch} style={{ padding: '8px 12px' }}><Search size={16} /></Button>
                                        </div>
                                    </InputWrapper>
                                </div>
                            </ControlsContainer>

                            {/* MACHINES DATA TABLE */}
                            <TableWrapper style={{ marginTop: '15px' }}>
                                {loading ? <div style={{ textAlign: 'center', padding: '20px' }}><Loader className="animate-spin" /></div> : (
                                    <Table>
                                        <thead>
                                            <Tr>
                                                <Th>Asset ID</Th>
                                                <Th>Asset Name</Th>
                                                <Th>Registered Date</Th>
                                                <Th>Department</Th>
                                                <Th>Assigned Incharge</Th>
                                                <Th>Status</Th>
                                                <Th>Last Service Date</Th>
                                                <Th style={{ textAlign: 'right' }}>Actions</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {filteredMachines.map(asset => {
                                                const logs = list(asset.maintenance_details);
                                                const computedLastService = logs.length > 0 ? logs[logs.length - 1].service_date : '-';
                                                const displayLastService = asset.last_service_date || computedLastService;
                                                const isActive = asset.is_active !== false;

                                                return (
                                                    <Tr key={asset.asset_id}>
                                                        <Td><strong>{asset.asset_id}</strong></Td>
                                                        <Td>{asset.asset_name}</Td>
                                                        <Td style={{ fontWeight: '600', color: '#0284c7' }}>
                                                            {asset.date || (asset.created_date ? asset.created_date.split('T')[0] : '-')}
                                                        </Td>
                                                        <Td>{getDepartmentName(asset.department)}</Td>
                                                        <Td>
                                                            {asset.incharge_name ? (
                                                                <span style={{ fontWeight: '500', color: '#047857' }}>
                                                                    <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                                                    {asset.incharge_name}
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <span style={{
                                                                color: !isActive ? '#ef4444' : (asset.status === 'Active' ? '#16a34a' : '#eab308'),
                                                                fontWeight: 600, fontSize: '0.85rem'
                                                            }}>
                                                                • {!isActive ? 'Deactive' : asset.status}
                                                            </span>
                                                            {!isActive && asset.deactivate_remarks && (
                                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', maxWidth: '200px', fontStyle: 'italic' }}>
                                                                    Remark: {asset.deactivate_remarks}
                                                                </div>
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <span style={{ fontWeight: displayLastService !== '-' ? '600' : 'normal', color: displayLastService !== '-' ? '#0284c7' : '#94a3b8' }}>
                                                                {displayLastService}
                                                            </span>
                                                        </Td>
                                                        <Td>
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                <Button
                                                                    style={{ background: '#e0f2fe', color: '#0284c7', borderColor: '#bae6fd', padding: '5px 8px', fontSize: '0.75rem' }}
                                                                    onClick={() => openAddServiceModal(asset.asset_id)}
                                                                    title="Add Service Entry"
                                                                >
                                                                    <Plus size={14} style={{ marginRight: 2 }} /> Service
                                                                </Button>

                                                                <Button
                                                                    secondary
                                                                    style={{
                                                                        padding: '6px',
                                                                        color: isActive ? '#10b981' : '#ef4444',
                                                                        borderColor: isActive ? '#10b981' : '#ef4444',
                                                                        background: isActive ? '#ecfdf5' : '#fef2f2'
                                                                    }}
                                                                    onClick={() => handleToggleActiveClick(asset)}
                                                                    title={isActive ? "Deactivate" : "Activate"}
                                                                >
                                                                    {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                                </Button>
                                                                <Button
                                                                    secondary
                                                                    onClick={() => {
                                                                        setSelectedViewAsset(asset);
                                                                        setShowViewModal(true);
                                                                    }}
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={16} />
                                                                </Button>
                                                                <Button success onClick={() => handleEditForm(asset.asset_id)}><Edit size={14} /></Button>
                                            <Button secondary onClick={() => printBarcode(asset)}><Printer size={14} /></Button>
                                                            </div>
                                                        </Td>
                                                    </Tr>
                                                );
                                            })}
                                            {filteredMachines.length === 0 && (
                                                <Tr>
                                                    <Td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                                                        No registered machines found matching current filters.
                                                    </Td>
                                                </Tr>
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </TableWrapper>
                        </>
                    )}

                    {/* ========================================= */}
                    {/* TAB 2: MAINTENANCE REQUESTS */}
                    {/* ========================================= */}
                    {activeTab === 'requests' && (
                        <>
                            <ControlsContainer style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '100%', alignItems: 'flex-end' }}>
                                    <InputWrapper>
                                        <Label>From Date</Label>
                                        <Input type="date" value={filters.from_date} onChange={e => setFilters({ ...filters, from_date: e.target.value })} />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label>To Date</Label>
                                        <Input type="date" value={filters.to_date} onChange={e => setFilters({ ...filters, to_date: e.target.value })} />
                                    </InputWrapper>
                                    <InputWrapper>
                                        <Label>Status Filter</Label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <S.Select value={filters.request_status} onChange={e => setFilters({ ...filters, request_status: e.target.value })} style={{ flex: 1 }}>
                                                <option value="">All Statuses</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Rejected">Rejected</option>
                                            </S.Select>
                                            <Button secondary onClick={fetchRequests} style={{ padding: '8px 12px' }}><Search size={16} /></Button>
                                        </div>
                                    </InputWrapper>
                                </div>
                            </ControlsContainer>

                            <TableWrapper style={{ marginTop: '15px' }}>
                                {requestsLoading ? <div style={{ textAlign: 'center', padding: '20px' }}><Loader className="animate-spin" /></div> : (
                                    <Table>
                                        <thead>
                                            <Tr>
                                                <Th>Request ID</Th>
                                                <Th>Asset ID & Name</Th>
                                                <Th>Issue Description</Th>
                                                <Th>Requested By</Th>
                                                <Th>Assigned Incharge</Th>
                                                <Th>Status</Th>
                                                <Th>Service Cost</Th>
                                                <Th style={{ textAlign: 'center' }}>Action</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {requests.map(req => (
                                                <Tr key={req.request_id}>
                                                    <Td><strong style={{ color: '#2563eb' }}>{req.request_id}</strong></Td>
                                                    <Td>
                                                        <div style={{ fontWeight: '600' }}>{req.asset_id}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.asset_name}</div>
                                                    </Td>
                                                    <Td style={{ maxWidth: '250px' }}>{req.description}</Td>
                                                    <Td>{req.requested_by}</Td>
                                                    <Td>{req.incharge_name || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Auto-Approved</span>}</Td>
                                                    <Td>
                                                        <StatusBadge $status={req.status}>
                                                            {req.status}
                                                        </StatusBadge>
                                                    </Td>
                                                    <Td>{req.service_cost ? `₹${req.service_cost}` : '-'}</Td>
                                                    <Td style={{ textAlign: 'center' }}>
                                                        {req.status === 'Approved' ? (
                                                            <Button
                                                                style={{ background: '#0284c7', color: 'white', padding: '5px 12px', fontSize: '0.78rem' }}
                                                                onClick={() => openAddServiceModal(req.asset_id, req)}
                                                            >
                                                                <CheckCircle2 size={14} style={{ marginRight: 4 }} />
                                                                Complete Service
                                                            </Button>
                                                        ) : req.status === 'Completed' ? (
                                                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '600' }}>
                                                                ✓ Serviced
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                                {req.status}
                                                            </span>
                                                        )}
                                                    </Td>
                                                </Tr>
                                            ))}
                                            {requests.length === 0 && (
                                                <Tr>
                                                    <Td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                                        No maintenance requests found.
                                                    </Td>
                                                </Tr>
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </TableWrapper>
                        </>
                    )}

                    {/* ========================================= */}
                    {/* TAB 3: SERVICE REPORTS */}
                    {/* ========================================= */}
                    {activeTab === 'reports' && (
                        <>
                            {/* SERVICE REPORTS SUMMARY CARDS */}
                            <SummaryGrid>
                                <SummaryCard $bg="#f0f9ff" $border="#bae6fd">
                                    <CardIconWrapper $iconBg="#e0f2fe" $iconColor="#0284c7">
                                        <Activity size={22} />
                                    </CardIconWrapper>
                                    <CardContent>
                                        <span className="val">{serviceReportTotals.totalServices}</span>
                                        <span className="lbl">Services Recorded</span>
                                    </CardContent>
                                </SummaryCard>

                                <SummaryCard $bg="#f0fdf4" $border="#bbf7d0">
                                    <CardIconWrapper $iconBg="#dcfce7" $iconColor="#16a34a">
                                        <DollarSign size={22} />
                                    </CardIconWrapper>
                                    <CardContent>
                                        <span className="val">₹{serviceReportTotals.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        <span className="lbl">Total Maintenance Expenses</span>
                                    </CardContent>
                                </SummaryCard>

                                <SummaryCard $bg="#fefce8" $border="#fef08a">
                                    <CardIconWrapper $iconBg="#fef9c3" $iconColor="#ca8a04">
                                        <Wrench size={22} />
                                    </CardIconWrapper>
                                    <CardContent>
                                        <span className="val">{serviceReportTotals.uniqueMachines}</span>
                                        <span className="lbl">Assets Listed</span>
                                    </CardContent>
                                </SummaryCard>
                            </SummaryGrid>

                            {/* REPORT CONTROLS & FILTERS (3 FIELDS PER ROW) */}
                            <ControlsContainer style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '100%' }}>
                                    <InputWrapper>
                                        <Label>From Date</Label>
                                        <Input
                                            type="date"
                                            value={filters.from_date}
                                            onChange={e => setFilters({ ...filters, from_date: e.target.value })}
                                        />
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label>To Date</Label>
                                        <Input
                                            type="date"
                                            value={filters.to_date}
                                            onChange={e => setFilters({ ...filters, to_date: e.target.value })}
                                        />
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label>Filter Department</Label>
                                        <SearchableDepartmentSelect
                                            departments={departments}
                                            selectedValue={filters.report_department}
                                            onChange={val => setFilters({ ...filters, report_department: val })}
                                        />
                                    </InputWrapper>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '100%' }}>
                                    <InputWrapper>
                                        <Label>Filter Asset</Label>
                                        <S.Select
                                            value={filters.report_asset_id}
                                            onChange={e => setFilters({ ...filters, report_asset_id: e.target.value })}
                                        >
                                            <option value="">-- All Assets --</option>
                                            {assets.map((a, idx) => (
                                                <option key={idx} value={a.asset_id}>
                                                    {a.asset_id} - {a.asset_name}
                                                </option>
                                            ))}
                                        </S.Select>
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label>Filter Incharge</Label>
                                        <S.Select
                                            value={filters.report_incharge}
                                            onChange={e => setFilters({ ...filters, report_incharge: e.target.value })}
                                        >
                                            <option value="">-- All Incharges --</option>
                                            {uniqueIncharges.map((inch, idx) => (
                                                <option key={idx} value={inch}>
                                                    {inch}
                                                </option>
                                            ))}
                                        </S.Select>
                                    </InputWrapper>

                                    <InputWrapper>
                                        <Label>Cost Filter</Label>
                                        <S.Select
                                            value={filters.report_cost}
                                            onChange={e => setFilters({ ...filters, report_cost: e.target.value })}
                                        >
                                            <option value="all">All Costs</option>
                                            <option value="zero">₹0 (Free Services)</option>
                                            <option value="above_zero">Higher than ₹0 (&gt; 0)</option>
                                        </S.Select>
                                    </InputWrapper>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', width: '100%', alignItems: 'flex-end' }}>
                                    <InputWrapper>
                                        <Label>Search Report</Label>
                                        <Input
                                            placeholder="Search Asset, Incharge, Remarks..."
                                            value={filters.report_search}
                                            onChange={e => setFilters({ ...filters, report_search: e.target.value })}
                                        />
                                    </InputWrapper>

                                    <Button secondary onClick={() => setFilters({ ...filters, report_search: '', report_department: '', report_asset_id: '', report_incharge: '', report_cost: 'all' })} style={{ height: '38px', justifyContent: 'center' }}>
                                        Reset Filters
                                    </Button>

                                    <Button
                                        style={{ background: '#16a34a', color: 'white', height: '38px', justifyContent: 'center' }}
                                        onClick={handleExportExcel}
                                    >
                                        <Download size={16} style={{ marginRight: 4 }} /> Export Excel
                                    </Button>
                                </div>
                            </ControlsContainer>

                            {/* SERVICE REPORTS ASSETS TABLE */}
                            <TableWrapper>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>
                                        <Loader className="animate-spin" />
                                    </div>
                                ) : (
                                    <Table>
                                        <thead>
                                            <Tr>
                                                <Th>Asset ID</Th>
                                                <Th>Asset Name</Th>
                                                <Th>Department</Th>
                                                <Th>Assigned Incharge</Th>
                                                <Th style={{ textAlign: 'center' }}>Total Services</Th>
                                                <Th style={{ textAlign: 'right' }}>Total Service Cost (₹)</Th>
                                                <Th>Last Service Date</Th>
                                                <Th style={{ textAlign: 'center' }}>View Services</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {filteredServiceAssets.length > 0 ? (
                                                filteredServiceAssets.map((asset, i) => {
                                                    const logs = list(asset.maintenance_details);
                                                    const totalServicesCount = logs.length;
                                                    const totalCostSum = logs.reduce((sum, l) => sum + (parseFloat(l.service_cost) || 0), 0);
                                                    const lastService = asset.last_service_date || (logs.length > 0 ? logs[logs.length - 1].service_date : '-');

                                                    return (
                                                        <Tr key={i}>
                                                            <Td style={{ fontWeight: '600', color: '#2563eb' }}>{asset.asset_id}</Td>
                                                            <Td style={{ fontWeight: '600' }}>{asset.asset_name}</Td>
                                                            <Td>{getDepartmentName(asset.department)}</Td>
                                                            <Td>
                                                                {asset.incharge_name ? (
                                                                    <span style={{ fontWeight: '500', color: '#047857' }}>
                                                                        <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                                                        {asset.incharge_name}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                                                                )}
                                                            </Td>
                                                            <Td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                                <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                                                    {totalServicesCount} Services
                                                                </span>
                                                            </Td>
                                                            <Td style={{ textAlign: 'right', fontWeight: '600', color: totalCostSum > 0 ? '#16a34a' : '#64748b' }}>
                                                                ₹{totalCostSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </Td>
                                                            <Td style={{ fontWeight: lastService !== '-' ? '600' : 'normal', color: lastService !== '-' ? '#0284c7' : '#94a3b8' }}>
                                                                {lastService}
                                                            </Td>
                                                            <Td style={{ textAlign: 'center' }}>
                                                                <Button
                                                                    style={{ background: '#e0f2fe', color: '#0284c7', borderColor: '#bae6fd', padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600 }}
                                                                    onClick={() => {
                                                                        setSelectedAssetServices(asset);
                                                                        setShowAssetServicesModal(true);
                                                                    }}
                                                                >
                                                                    <Eye size={14} style={{ marginRight: 4 }} /> View Services
                                                                </Button>
                                                            </Td>
                                                        </Tr>
                                                    );
                                                })
                                            ) : (
                                                <Tr>
                                                    <Td colSpan={8} style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>
                                                        No service reports found matching the selected filters.
                                                    </Td>
                                                </Tr>
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </TableWrapper>
                        </>
                    )}
                </FormContent>
            </Container>

            {/* UNIVERSAL ADD SERVICE MODAL */}
            {showAddServiceModal && (
                <ModalOverlay>
                    <S.ModalContainer style={{ maxWidth: '540px' }}>
                        <ModalHeader>
                            <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Wrench size={20} color="#0284c7" />
                                {addServiceData.linkedRequestId ? `Complete Service: ${addServiceData.linkedRequestId}` : 'Add Machine Service Entry'}
                            </ModalTitle>
                            <CloseButton onClick={() => setShowAddServiceModal(false)}><X size={18} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <InputWrapper style={{ marginBottom: '14px' }}>
                                <Label required>Select Machine / Asset</Label>
                                <S.Select
                                    value={addServiceData.asset_id}
                                    onChange={e => setAddServiceData({ ...addServiceData, asset_id: e.target.value })}
                                    disabled={!!addServiceData.linkedRequestId}
                                >
                                    <option value="">-- Choose Machine --</option>
                                    {assets.map((a, idx) => (
                                        <option key={idx} value={a.asset_id}>
                                            {a.asset_id} - {a.asset_name} ({getDepartmentName(a.department)})
                                        </option>
                                    ))}
                                </S.Select>
                            </InputWrapper>

                            <FlexRow>
                                <FlexCol flex={1}>
                                    <InputWrapper>
                                        <Label required>Service Date</Label>
                                        <Input
                                            type="date"
                                            value={addServiceData.service_date}
                                            onChange={e => setAddServiceData({ ...addServiceData, service_date: e.target.value })}
                                        />
                                    </InputWrapper>
                                </FlexCol>
                                <FlexCol flex={1}>
                                    <InputWrapper>
                                        <Label>Service Cost (₹)</Label>
                                        <Input
                                            type="number"
                                            value={addServiceData.service_cost}
                                            onChange={e => setAddServiceData({ ...addServiceData, service_cost: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </InputWrapper>
                                </FlexCol>
                            </FlexRow>

                            <InputWrapper style={{ marginBottom: '14px' }}>
                                <Label>Service Performed By / Technician</Label>
                                <Input
                                    value={addServiceData.service_by}
                                    onChange={e => setAddServiceData({ ...addServiceData, service_by: e.target.value })}
                                    placeholder="Enter technician / engineer name"
                                />
                            </InputWrapper>

                            <InputWrapper style={{ marginBottom: '14px' }}>
                                <Label required>Service Description / Maintenance Remarks</Label>
                                <Input
                                    as="textarea"
                                    rows={3}
                                    value={addServiceData.service_description}
                                    onChange={e => setAddServiceData({ ...addServiceData, service_description: e.target.value })}
                                    placeholder="Enter details of parts replaced, oiling, calibration, or maintenance done..."
                                />
                            </InputWrapper>
                        </ModalBody>
                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
                            <ButtonContainer style={{ width: "100%", justifyContent: "flex-end", marginTop: 0 }}>
                                <Button secondary onClick={() => setShowAddServiceModal(false)}>Cancel</Button>
                                <Button
                                    style={{ background: "#0284c7", color: "white" }}
                                    onClick={handleSaveAddServiceModal}
                                    disabled={addServiceLoading}
                                >
                                    {addServiceLoading ? <Loader size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Save Service Entry</>}
                                </Button>
                            </ButtonContainer>
                        </div>
                    </S.ModalContainer>
                </ModalOverlay>
            )}

            {/* DEACTIVATE REMARK MODAL */}
            {showDeactivateModal && (
                <ModalOverlay>
                    <S.ModalContainer>
                        <ModalHeader>
                            <ModalTitle>Deactivate Asset</ModalTitle>
                            <CloseButton onClick={() => setShowDeactivateModal(false)}><X size={18} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                                Please provide a remark for deactivating <strong>{assetToDeactivate?.asset_name}</strong>.
                            </p>
                            <InputWrapper>
                                <Label required>Remark</Label>
                                <Input
                                    as="textarea"
                                    rows={3}
                                    value={deactivateReason}
                                    onChange={(e) => setDeactivateReason(e.target.value)}
                                    placeholder="Enter deactivation reason..."
                                    autoFocus
                                />
                            </InputWrapper>
                        </ModalBody>
                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
                            <ButtonContainer style={{ width: "100%", justifyContent: "flex-end", marginTop: 0 }}>
                                <Button secondary onClick={() => setShowDeactivateModal(false)}>Cancel</Button>
                                <Button style={{ background: "#ef4444", color: "white" }} onClick={confirmDeactivate}>
                                    Deactivate
                                </Button>
                            </ButtonContainer>
                        </div>
                    </S.ModalContainer>
                </ModalOverlay>
            )}

            {/* VIEW MODAL */}
            {showViewModal && selectedViewAsset && (
                <ModalOverlay>
                    <S.ModalContainer style={{ maxWidth: '600px' }}>
                        <ModalHeader>
                            <ModalTitle>Asset Details: {selectedViewAsset.asset_name}</ModalTitle>
                            <CloseButton onClick={() => setShowViewModal(false)}><X size={18} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Barcode / ID</strong>
                                    <span style={{ fontSize: '15px' }}>{selectedViewAsset.barcode || selectedViewAsset.asset_id}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Department</strong>
                                    <span style={{ fontSize: '15px' }}>{getDepartmentName(selectedViewAsset.department)}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Assigned Incharge</strong>
                                    <span style={{ fontSize: '15px', color: '#047857', fontWeight: 600 }}>{selectedViewAsset.incharge_name || 'Unassigned'}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Last Service Date</strong>
                                    <span style={{ fontSize: '15px', color: '#0284c7', fontWeight: 600 }}>{selectedViewAsset.last_service_date || '-'}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Purchase Date</strong>
                                    <span style={{ fontSize: '15px' }}>{selectedViewAsset.date || '-'}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Warranty End Date</strong>
                                    <span style={{ fontSize: '15px' }}>{selectedViewAsset.warrenty_end_date || '-'}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#64748b', fontSize: '13px', display: 'block' }}>Status</strong>
                                    <span style={{
                                        fontSize: '15px',
                                        color: selectedViewAsset.is_active === false ? '#ef4444' : '#16a34a',
                                        fontWeight: 600
                                    }}>
                                        {selectedViewAsset.is_active === false ? 'Deactive' : (selectedViewAsset.status || 'Active')}
                                    </span>
                                </div>
                                {selectedViewAsset.is_active === false && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <strong style={{ color: '#ef4444', fontSize: '13px', display: 'block' }}>Deactivation Remark</strong>
                                        <span style={{ fontSize: '15px', fontStyle: 'italic' }}>{selectedViewAsset.deactivate_remarks || 'No remarks provided.'}</span>
                                    </div>
                                )}
                            </div>

                            <Divider style={{ margin: '15px 0' }} />

                            <div>
                                <strong style={{ color: '#64748b', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Description</strong>
                                <p style={{ fontSize: '14px', margin: 0 }}>{selectedViewAsset.description || 'No description provided.'}</p>
                            </div>

                            <Divider style={{ margin: '15px 0' }} />

                            <div>
                                <strong style={{ color: '#64748b', fontSize: '13px', display: 'block', marginBottom: '10px' }}>Service & Maintenance Log</strong>
                                {(selectedViewAsset.maintenance_details && list(selectedViewAsset.maintenance_details).length > 0) ? (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {list(selectedViewAsset.maintenance_details).map((log, i) => (
                                            <li key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <strong style={{ fontSize: '13px' }}>{log.service_date}</strong>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1' }}>Cost: ₹{log.service_cost}</span>
                                                </div>
                                                <p style={{ fontSize: '13px', margin: '0 0 4px 0', color: '#475569' }}>{log.service_description}</p>
                                                {log.service_by && (
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>By: {log.service_by}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No service logs recorded.</p>
                                )}
                            </div>

                        </ModalBody>
                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
                            <ButtonContainer style={{ width: "100%", justifyContent: "flex-end", marginTop: 0 }}>
                                <Button secondary onClick={() => setShowViewModal(false)}>Close</Button>
                            </ButtonContainer>
                        </div>
                    </S.ModalContainer>
                </ModalOverlay>
            )}

            {/* VIEW ASSET SERVICES MODAL FOR SERVICE REPORT */}
            {showAssetServicesModal && selectedAssetServices && (
                <ModalOverlay>
                    <S.ModalContainer style={{ maxWidth: '780px' }}>
                        <ModalHeader>
                            <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Wrench size={20} color="#0284c7" />
                                Service History: {selectedAssetServices.asset_id} - {selectedAssetServices.asset_name}
                            </ModalTitle>
                            <CloseButton onClick={() => setShowAssetServicesModal(false)}><X size={18} /></CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Department</span>
                                    <strong style={{ fontSize: '0.9rem' }}>{getDepartmentName(selectedAssetServices.department)}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Assigned Incharge</span>
                                    <strong style={{ fontSize: '0.9rem', color: '#047857' }}>{selectedAssetServices.incharge_name || 'Unassigned'}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Total Services Logged</span>
                                    <strong style={{ fontSize: '0.9rem', color: '#0284c7' }}>{list(selectedAssetServices.maintenance_details).length} Services</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Total Expense</span>
                                    <strong style={{ fontSize: '0.9rem', color: '#16a34a' }}>
                                        ₹{list(selectedAssetServices.maintenance_details).reduce((sum, l) => sum + (parseFloat(l.service_cost) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </strong>
                                </div>
                            </div>

                            <TableWrapper style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                <Table>
                                    <thead>
                                        <Tr>
                                            <Th style={{ width: '60px' }}>S.No</Th>
                                            <Th style={{ width: '110px' }}>Date</Th>
                                            <Th>Service Description / Remarks</Th>
                                            <Th style={{ textAlign: 'right', width: '120px' }}>Cost (₹)</Th>
                                            <Th style={{ width: '150px' }}>Technician / Service By</Th>
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {list(selectedAssetServices.maintenance_details).length > 0 ? (
                                            list(selectedAssetServices.maintenance_details).map((log, idx) => (
                                                <Tr key={idx}>
                                                    <Td style={{ fontWeight: '600' }}>{idx + 1}</Td>
                                                    <Td style={{ fontWeight: '600', color: '#0284c7' }}>{log.service_date || '-'}</Td>
                                                    <Td style={{ maxWidth: '280px' }}>{log.service_description || '-'}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: '600', color: (parseFloat(log.service_cost) || 0) > 0 ? '#16a34a' : '#64748b' }}>
                                                        ₹{(parseFloat(log.service_cost) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </Td>
                                                    <Td>{log.service_by || '-'}</Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={5} style={{ textAlign: 'center', padding: '25px', color: '#64748b', fontStyle: 'italic' }}>
                                                    No service records logged for this asset.
                                                </Td>
                                            </Tr>
                                        )}
                                    </tbody>
                                </Table>
                            </TableWrapper>
                        </ModalBody>
                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
                            <ButtonContainer style={{ width: "100%", justifyContent: "flex-end", marginTop: 0 }}>
                                <Button secondary onClick={() => setShowAssetServicesModal(false)}>Close</Button>
                            </ButtonContainer>
                        </div>
                    </S.ModalContainer>
                </ModalOverlay>
            )}
        </PageWrapper>
    );
};

export default Assetsmaintenance;