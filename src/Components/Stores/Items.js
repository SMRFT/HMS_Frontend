import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactSelect from 'react-select';
import { 
    LineChart, X, Plus, Search, Edit2, Trash2, FilterX, Layers, 
    AlertCircle, CheckCircle, Package, Building2, Tag, 
    AlertTriangle, Box, ShieldCheck, Sparkles, ArrowUpDown, PackagePlus
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import TablePagination, { usePagination } from './TablePagination';
import { getSelectedStoreDepartment, setSelectedStoreDepartment, useStoresDepartment } from './storesDepartmentHelper';
import DepartmentSelectionModal, { DepartmentFilterControl } from './DepartmentSelectionModal';
import {
    PageWrapper,
    Container,
    SectionHeader,
    ControlsContainer,
    SearchContainer,
    Input,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    FormContent,
    FormRow,
    InputWrapper,
    Label,
    ButtonContainer,
    TabContainer,
    Tab,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors,
    Select as StyledSelect
} from '../GlobalStyles';

const tabs = [
    { id: 'item', label: 'Item Master', icon: Package, endpoint: 'item-master' },
    { id: 'department', label: 'Department Master', icon: Building2, endpoint: 'department-master' },
    { id: 'group', label: 'Group Master', icon: Layers, endpoint: 'group-master' },
    { id: 'category', label: 'Category Master', icon: Tag, endpoint: 'category-master' }
];

const filterSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '40px',
        height: '40px',
        borderRadius: '8px',
        borderColor: state.isFocused ? colors.primary : '#cbd5e1',
        boxShadow: state.isFocused ? `0 0 0 1px ${colors.primary}` : 'none',
        fontSize: '0.85rem',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        '&:hover': {
            borderColor: colors.primary
        }
    }),
    valueContainer: (base) => ({
        ...base,
        height: '40px',
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center'
    }),
    input: (base) => ({
        ...base,
        margin: '0px',
        fontSize: '0.85rem',
        color: '#1e293b'
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '40px'
    }),
    menu: (base) => ({
        ...base,
        zIndex: 99999,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        marginTop: '4px'
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 99999
    }),
    menuList: (base) => ({
        ...base,
        padding: '4px',
        maxHeight: '260px',
        backgroundColor: '#ffffff'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected 
            ? colors.primary 
            : state.isFocused 
            ? '#f0fdfa' 
            : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#1e293b',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: state.isSelected ? '600' : '500',
        padding: '8px 12px',
        borderRadius: '6px',
        margin: '2px 0',
        transition: 'background-color 0.15s ease'
    }),
    placeholder: (base) => ({
        ...base,
        color: '#64748b',
        fontSize: '0.85rem'
    }),
    singleValue: (base) => ({
        ...base,
        color: '#1e293b',
        fontSize: '0.85rem',
        fontWeight: '500'
    })
};

const formSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '38px',
        height: '38px',
        borderRadius: '6px',
        borderColor: state.isFocused ? colors.primary : colors.border,
        boxShadow: state.isFocused ? `0 0 0 1px ${colors.primary}` : 'none',
        fontSize: '0.85rem',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        '&:hover': {
            borderColor: colors.primary
        }
    }),
    valueContainer: (base) => ({
        ...base,
        height: '38px',
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center'
    }),
    input: (base) => ({
        ...base,
        margin: '0px',
        fontSize: '0.85rem'
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '38px'
    }),
    menu: (base) => ({
        ...base,
        zIndex: 99999,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        marginTop: '4px'
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 99999
    }),
    menuList: (base) => ({
        ...base,
        padding: '4px',
        maxHeight: '220px',
        backgroundColor: '#ffffff'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected 
            ? colors.primary 
            : state.isFocused 
            ? '#f0fdfa' 
            : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#1e293b',
        cursor: 'pointer',
        fontSize: '0.85rem',
        padding: '8px 12px',
        borderRadius: '6px',
        margin: '2px 0'
    }),
    placeholder: (base) => ({
        ...base,
        color: '#94a3b8',
        fontSize: '0.85rem'
    }),
    singleValue: (base) => ({
        ...base,
        color: '#1e293b',
        fontSize: '0.85rem'
    })
};

const Items = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState(getSelectedStoreDepartment());
    useStoresDepartment((newDept) => setFilterDepartment(newDept || ''));
    const [filterCategory, setFilterCategory] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [filterLowStock, setFilterLowStock] = useState(false);
    const departmentFilterRef = useRef(null);

    // F10 Shortcut to focus Department filter
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10') {
                e.preventDefault();
                if (activeTab.id !== 'item') {
                    setActiveTab(tabs[0]);
                }
                setTimeout(() => {
                    departmentFilterRef.current?.focus();
                }, 50);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTab]);

    // Price History states
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [priceData, setPriceData] = useState(null);
    const [selectedItemName, setSelectedItemName] = useState('');
    const [selectedItemForPrice, setSelectedItemForPrice] = useState(null);
    const [loadingPrices, setLoadingPrices] = useState(false);

    // Opening Stock Action Modal states
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedItemForStock, setSelectedItemForStock] = useState(null);
    const [stockAdjustmentMode, setStockAdjustmentMode] = useState('ADD'); // 'ADD' or 'SET'
    const [newStockValue, setNewStockValue] = useState('');
    const [stockRemark, setStockRemark] = useState('');
    const [savingStock, setSavingStock] = useState(false);

    // Master list states for mappings
    const [allDepartments, setAllDepartments] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [allVendors, setAllVendors] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);

    // Sorted department options for filters and forms
    const departmentOptions = useMemo(() => {
        const sorted = [...allDepartments].sort((a, b) => 
            String(a.department_name || a.name || '').localeCompare(String(b.department_name || b.name || ''))
        );
        return sorted.map(dept => ({ 
            value: dept.department_id || dept.department_code || dept.id || dept.department_name, 
            label: dept.department_name || dept.department_code || dept.department_id 
        }));
    }, [allDepartments]);

    // Sorted group options for filters and forms
    const groupOptions = useMemo(() => {
        const sorted = [...allGroups].sort((a, b) => 
            String(a.group_name || a.groupName || '').localeCompare(String(b.group_name || b.groupName || ''))
        );
        return sorted.map(grp => ({ 
            value: grp.group_id, 
            label: grp.group_name || grp.groupName || grp.group_id 
        }));
    }, [allGroups]);

    // Dynamic base URL detection
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    useEffect(() => {
        fetchItems();
        resetForm();
        fetchMasters();
    }, [activeTab]);

    const fetchMasters = async () => {
        try {
            const [deptRes, groupRes, catRes, storeVendorRes, generalVendorRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/category-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/vendors/`)
            ]);
            if (deptRes.success) setAllDepartments(deptRes.data);
            if (groupRes.success) setAllGroups(groupRes.data);
            if (catRes.success) setAllCategories(catRes.data);

            const combinedVendors = [];
            const addVendors = (list) => {
                if (Array.isArray(list)) {
                    list.forEach(v => {
                        const id = v.vendor_id || v.id;
                        if (id && !combinedVendors.some(existing => (existing.vendor_id || existing.id) === id)) {
                            combinedVendors.push(v);
                        }
                    });
                }
            };

            if (storeVendorRes?.success) {
                const list = Array.isArray(storeVendorRes.data)
                    ? storeVendorRes.data
                    : Array.isArray(storeVendorRes.data?.data)
                    ? storeVendorRes.data.data
                    : [];
                addVendors(list);
            }
            if (generalVendorRes?.success) {
                const list = Array.isArray(generalVendorRes.data)
                    ? generalVendorRes.data
                    : Array.isArray(generalVendorRes.data?.data)
                    ? generalVendorRes.data.data
                    : [];
                addVendors(list);
            }

            setAllVendors(combinedVendors);

            const isSupplierType = (type) => {
                if (!type) return true;
                const t = String(type).toUpperCase();
                return t === "SUPPLIER" || t === "BOTH";
            };
            const isManufacturerType = (type) => {
                if (!type) return true;
                const t = String(type).toUpperCase();
                return t === "MANUFACTURER" || t === "BOTH";
            };

            setSuppliers(combinedVendors.filter(v => isSupplierType(v.vendor_type)));
            setManufacturers(combinedVendors.filter(v => isManufacturerType(v.vendor_type)));
        } catch (error) {
            console.error("Error fetching masters:", error);
        }
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/${activeTab.endpoint}/`);
            if (response.success) {
                setItems(response.data);
            } else {
                console.error("Error fetching items:", response.error);
            }
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });
    };

    const getIdField = () => {
        switch (activeTab.id) {
            case 'item': return 'item_id';
            case 'department': return 'department_id';
            case 'group': return 'group_id';
            case 'category': return 'category_id';
            default: return 'id';
        }
    };

    const getNameField = () => {
        switch (activeTab.id) {
            case 'item': return 'itemName';
            case 'department': return 'department_name';
            case 'group': return 'group_name';
            case 'category': return 'category_name';
            default: return 'name';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            const API_URL = `${getBaseUrl.replace(/\/$/, '')}/${activeTab.endpoint}/`;
            const idField = getIdField();

            const payload = { ...formData };
            if (activeTab.id === 'item') {
                if (payload.group_code) payload.group = payload.group_code;
                if (payload.category_code) payload.category = payload.category_code;
                if (payload.department_code) payload.department = payload.department_code;
            } else if (activeTab.id === 'category') {
                payload.category_name = payload.category_name || payload.categoryName || '';
                payload.categoryName = payload.category_name || payload.categoryName || '';
            }

            if (isEditing) {
                response = await apiRequest(`${API_URL}${formData[idField]}/`, 'PATCH', payload);
            } else {
                response = await apiRequest(API_URL, 'POST', payload);
            }

            if (response.success) {
                fetchItems();
                fetchMasters();
                resetForm();
            } else {
                console.error("Error saving record:", response.error);
                alert("Error saving record: " + response.error);
            }
        } catch (error) {
            console.error("Error saving record:", error);
            alert("Error saving record");
        }
    };

    const handleEdit = (item) => {
        const data = { ...item };
        if (activeTab.id === 'item') {
            data.group = item.group_code || item.group || '';
            data.group_code = item.group_code || item.group || '';
            data.category = item.category_code || item.category || '';
            data.category_code = item.category_code || item.category || '';
            data.department = item.department_code || item.department || '';
            data.department_code = item.department_code || item.department || '';
            data.opening_stock = item.opening_stock ?? 0;
            data.remark = item.remark || '';
        } else if (activeTab.id === 'category') {
            data.category_name = item.category_name || item.categoryName || '';
            data.categoryName = item.category_name || item.categoryName || '';
        }
        setFormData(data);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Are you sure you want to delete this ${activeTab.label}?`)) {
            try {
                const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/${activeTab.endpoint}/${id}/`, 'DELETE');
                if (response.success) {
                    fetchItems();
                } else {
                    console.error("Error deleting record:", response.error);
                    alert("Error deleting record: " + response.error);
                }
            } catch (error) {
                console.error("Error deleting record:", error);
                alert("Error deleting record");
            }
        }
    };

    const fetchPriceHistory = async (item, nameField, idField) => {
        const targetItem = item || selectedItemForPrice;
        if (!targetItem) return;
        const itemId = targetItem[idField || getIdField()];
        setSelectedItemName(targetItem[nameField || getNameField()]);
        setSelectedItemForPrice(targetItem);
        setLoadingPrices(true);
        setShowPriceModal(true);

        try {
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/price-history/${itemId}/`);
            if (response.success) {
                setPriceData(response.data);
            } else {
                setPriceData({ error: response.error });
            }
        } catch (error) {
            setPriceData({ error: 'Failed to fetch price history' });
        } finally {
            setLoadingPrices(false);
        }
    };

    // Opening Stock Action Handlers
    const handleOpenStockModal = (item) => {
        setSelectedItemForStock(item);
        setStockAdjustmentMode('ADD');
        setNewStockValue('');
        setStockRemark('');
        setShowStockModal(true);
    };

    const handleCloseStockModal = () => {
        setShowStockModal(false);
        setSelectedItemForStock(null);
        setNewStockValue('');
        setStockRemark('');
        setSavingStock(false);
    };

    const handleSaveOpeningStock = async (e) => {
        if (e) e.preventDefault();
        if (!selectedItemForStock) return;

        const val = parseFloat(newStockValue);
        if (isNaN(val) || val < 0) {
            alert("Please enter a valid non-negative number for stock quantity.");
            return;
        }

        if (!stockRemark.trim()) {
            alert("Please provide an audit remark / reason for the opening stock entry.");
            return;
        }

        const currentOpeningStock = parseFloat(selectedItemForStock.opening_stock || 0);
        const finalOpeningStock = stockAdjustmentMode === 'ADD' 
            ? currentOpeningStock + val 
            : val;

        try {
            setSavingStock(true);
            const itemId = selectedItemForStock.item_id;
            const payload = {
                opening_stock: finalOpeningStock,
                remark: stockRemark.trim(),
                sync_total_quantity: true
            };

            const response = await apiRequest(
                `${getBaseUrl.replace(/\/$/, '')}/item-master/${itemId}/`,
                'PATCH',
                payload
            );

            if (response.success) {
                fetchItems();
                handleCloseStockModal();
            } else {
                alert("Error updating opening stock: " + (response.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error updating opening stock:", err);
            alert("Failed to update opening stock.");
        } finally {
            setSavingStock(false);
        }
    };

    const resetForm = () => {
        const activeDept = getSelectedStoreDepartment();
        setFormData(activeDept ? { department: activeDept } : {});
        setIsEditing(false);
        setShowForm(false);
    };

    // Filter logic (currently for items and category mapping) - memoized to prevent expensive recalculations and re-renders
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const idField = getIdField();
            const nameField = getNameField();

            const matchesSearch = item[nameField]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item[idField]?.toLowerCase().includes(searchTerm.toLowerCase());

            if (activeTab.id === 'category') {
                if (!filterGroup) return matchesSearch;
                const fg = String(filterGroup).toLowerCase().trim();
                const itGrp = String(item.group || '').toLowerCase().trim();
                const itGrpName = String(item.group_name || '').toLowerCase().trim();
                return matchesSearch && (itGrp === fg || itGrpName === fg);
            }

            if (activeTab.id !== 'item') return matchesSearch;

            // Extra filters only for items
            let matchesDept = true;
            if (filterDepartment) {
                const fDept = String(filterDepartment).toLowerCase().trim();
                const itDept = String(item.department || '').toLowerCase().trim();
                const itCode = String(item.department_code || '').toLowerCase().trim();
                const itName = String(item.department_name || '').toLowerCase().trim();

                if (itDept === fDept || itCode === fDept || itName === fDept) {
                    matchesDept = true;
                } else {
                    const selectedDept = allDepartments.find(d => 
                        String(d.department_id || '').toLowerCase().trim() === fDept ||
                        String(d.department_code || '').toLowerCase().trim() === fDept ||
                        String(d.id || '').toLowerCase().trim() === fDept ||
                        String(d.department_name || '').toLowerCase().trim() === fDept
                    );

                    if (selectedDept) {
                        const selId = String(selectedDept.department_id || selectedDept.department_code || selectedDept.id || '').toLowerCase().trim();
                        const selName = String(selectedDept.department_name || '').toLowerCase().trim();
                        matchesDept = (selId && (itDept === selId || itCode === selId || itName === selId)) ||
                                      (selName && (itDept === selName || itCode === selName || itName === selName));
                    } else {
                        matchesDept = false;
                    }
                }
            }
            
            let matchesCat = true;
            if (filterCategory) {
                const fc = String(filterCategory).toLowerCase().trim();
                const itCat = String(item.category || '').toLowerCase().trim();
                const itCatCode = String(item.category_code || '').toLowerCase().trim();
                const itCatName = String(item.category_name || '').toLowerCase().trim();
                matchesCat = (itCat === fc || itCatCode === fc || itCatName === fc);
            }

            let matchesGroup = true;
            if (filterGroup) {
                const fg = String(filterGroup).toLowerCase().trim();
                const itGrp = String(item.group || '').toLowerCase().trim();
                const itGrpCode = String(item.group_code || '').toLowerCase().trim();
                const itGrpName = String(item.group_name || '').toLowerCase().trim();
                matchesGroup = (itGrp === fg || itGrpCode === fg || itGrpName === fg);
            }

            // Low Stock Filter
            let matchesLowStock = true;
            if (filterLowStock && activeTab.id === 'item') {
                const availQty = Number(item.total_quantity || 0) - Number(item.approved_quantity || 0);
                matchesLowStock = availQty <= Number(item.stockReorderLevel || 0);
            }

            return matchesSearch && matchesDept && matchesCat && matchesGroup && matchesLowStock;
        }).sort((a, b) => {
            const nameField = getNameField();
            const nameA = String(a[nameField] || '').toLowerCase();
            const nameB = String(b[nameField] || '').toLowerCase();
            return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        });
    }, [items, activeTab.id, searchTerm, filterDepartment, filterCategory, filterGroup, filterLowStock, allDepartments]);

    const {
        currentPage,
        pageSize,
        totalPages,
        pageData,
        goTo,
        handlePageSizeChange,
        startIdx,
        totalItems
    } = usePagination(filteredItems, 15);

    const lowStockCount = items.filter(item => {
        const avail = Number(item.total_quantity || 0) - Number(item.approved_quantity || 0);
        return avail <= Number(item.stockReorderLevel || 0);
    }).length;

    const clearFilters = () => {
        setSearchTerm('');
        setFilterDepartment('');
        setSelectedStoreDepartment('');
        setFilterCategory('');
        setFilterGroup('');
        setFilterLowStock(false);
    };

    const getDepartmentName = (id) => {
        if (!id || id === '-') return '-';
        const strId = String(id).toLowerCase().trim();
        const dept = allDepartments.find(d => 
            String(d.department_id || '').toLowerCase().trim() === strId ||
            String(d.department_code || '').toLowerCase().trim() === strId ||
            String(d.id || '').toLowerCase().trim() === strId ||
            String(d.department_name || '').toLowerCase().trim() === strId
        );
        return dept ? (dept.department_name || dept.name || id) : id;
    };

    const getGroupName = (id) => {
        if (!id || id === '-') return '-';
        const strId = String(id).toLowerCase().trim();
        const group = allGroups.find(g => 
            String(g.group_id || '').toLowerCase().trim() === strId ||
            String(g.group_name || '').toLowerCase().trim() === strId ||
            String(g.groupName || '').toLowerCase().trim() === strId
        );
        return group ? (group.group_name || group.groupName || id) : id;
    };

    const getCategoryName = (id) => {
        if (!id || id === '-') return '-';
        const strId = String(id).toLowerCase().trim();
        const cat = allCategories.find(c => 
            String(c.category_id || '').toLowerCase().trim() === strId ||
            String(c.category_name || '').toLowerCase().trim() === strId ||
            String(c.categoryName || '').toLowerCase().trim() === strId
        );
        return cat ? (cat.category_name || cat.categoryName || id) : id;
    };

    const categoryFilterOptions = useMemo(() => {
        if (filterGroup) {
            return allCategories
                .filter(c => c.group === filterGroup)
                .sort((a, b) => String(a.category_name || a.categoryName || '').localeCompare(String(b.category_name || b.categoryName || '')))
                .map(cat => ({ value: cat.category_id, label: cat.category_name || cat.categoryName || cat.category_id }));
        }
        return allCategories
            .slice()
            .sort((a, b) => String(a.category_name || a.categoryName || '').localeCompare(String(b.category_name || b.categoryName || '')))
            .map(cat => ({
                value: cat.category_id,
                label: cat.group ? `${cat.category_name || cat.categoryName || cat.category_id} [${getGroupName(cat.group)}]` : (cat.category_name || cat.categoryName || cat.category_id)
            }));
    }, [allCategories, filterGroup, allGroups]);


    const getVendorName = (vendorId) => {
        if (!vendorId) return '-';
        const v = allVendors.find(vend => 
            String(vend.vendor_id || vend.id) === String(vendorId) ||
            String(vend.name).toLowerCase() === String(vendorId).toLowerCase()
        );
        return v ? v.name : vendorId;
    };

    const renderFormFields = () => {
        const idField = getIdField();
        const nameField = getNameField();

        if (activeTab.id === 'item') {
            return (
                <>
                    {/* <InputWrapper>
                        <Label required>Item ID (Auto-Generated)</Label>
                        <Input name="item_id" value={formData.item_id || ''} onChange={handleInputChange} placeholder="Auto Generated" disabled />
                    </InputWrapper> */}
                    <InputWrapper>
                        <Label required>Item Name</Label>
                        <Input name="itemName" value={formData.itemName || ''} onChange={handleInputChange} placeholder="Item Name" required />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Department</Label>
                        <ReactSelect
                            name="department"
                            value={(() => {
                                const val = formData.department;
                                if (!val) return null;
                                const fVal = String(val).toLowerCase().trim();
                                const found = allDepartments.find(d => 
                                    String(d.department_id || '').toLowerCase().trim() === fVal || 
                                    String(d.department_code || '').toLowerCase().trim() === fVal || 
                                    String(d.id || '').toLowerCase().trim() === fVal ||
                                    String(d.department_name || '').toLowerCase().trim() === fVal
                                );
                                return found 
                                    ? { value: found.department_id || found.department_code || found.id, label: found.department_name } 
                                    : { value: val, label: val };
                            })()}
                            onChange={(option) => {
                                handleSelectChange('department', option);
                                if (option) {
                                    setSelectedStoreDepartment(option.value || option.label, option.label);
                                }
                            }}
                            options={departmentOptions}
                            placeholder="Select Department"
                            isClearable
                            styles={formSelectStyles}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label required>Group</Label>
                        <ReactSelect
                            name="group"
                            value={(() => {
                                const gVal = formData.group_code || formData.group;
                                if (!gVal) return null;
                                const str = String(gVal).toLowerCase().trim();
                                const gObj = allGroups.find(g => 
                                    String(g.group_id || '').toLowerCase().trim() === str || 
                                    String(g.group_name || '').toLowerCase().trim() === str || 
                                    String(g.groupName || '').toLowerCase().trim() === str
                                );
                                return gObj ? { value: gObj.group_id, label: gObj.group_name || gObj.groupName } : { value: gVal, label: getGroupName(gVal) };
                            })()}
                            onChange={(option) => {
                                if (option) {
                                    const selectedGroupId = option.value;
                                    setFormData(prev => {
                                        const next = { ...prev, group_code: selectedGroupId, group: selectedGroupId };
                                        // Auto-clear category if current category does not belong to this group
                                        const currCatId = prev.category_code || prev.category;
                                        if (currCatId) {
                                            const cObj = allCategories.find(c => 
                                                c.category_id === currCatId || 
                                                c.category_name === currCatId || 
                                                c.categoryName === currCatId
                                            );
                                            if (cObj && cObj.group && cObj.group !== selectedGroupId) {
                                                next.category = '';
                                                next.category_code = '';
                                            }
                                        }
                                        return next;
                                    });
                                } else {
                                    setFormData(prev => ({
                                        ...prev,
                                        group: '',
                                        group_code: '',
                                        category: '',
                                        category_code: ''
                                    }));
                                }
                            }}
                            options={groupOptions}
                            placeholder="Select Group"
                            isClearable
                            required
                            styles={formSelectStyles}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label required>Category</Label>
                        <ReactSelect
                            name="category"
                            value={(() => {
                                const cVal = formData.category_code || formData.category;
                                if (!cVal) return null;
                                const str = String(cVal).toLowerCase().trim();
                                const cObj = allCategories.find(c => 
                                    String(c.category_id || '').toLowerCase().trim() === str || 
                                    String(c.category_name || '').toLowerCase().trim() === str || 
                                    String(c.categoryName || '').toLowerCase().trim() === str
                                );
                                return cObj ? { value: cObj.category_id, label: cObj.category_name || cObj.categoryName } : { value: cVal, label: getCategoryName(cVal) };
                            })()}
                            onChange={(option) => {
                                if (option) {
                                    const selectedCatId = option.value;
                                    const cObj = allCategories.find(c => c.category_id === selectedCatId);
                                    setFormData(prev => {
                                        const next = { ...prev, category_code: selectedCatId, category: selectedCatId };
                                        // Auto-select mapped group from category
                                        if (cObj?.group) {
                                            next.group = cObj.group;
                                            next.group_code = cObj.group;
                                        }
                                        return next;
                                    });
                                } else {
                                    setFormData(prev => ({ ...prev, category: '', category_code: '' }));
                                }
                            }}
                            options={(() => {
                                const currentGrp = formData.group_code || formData.group;
                                if (currentGrp) {
                                    const filtered = allCategories.filter(c => c.group === currentGrp);
                                    return filtered
                                        .slice()
                                        .sort((a, b) => String(a.category_name || a.categoryName || '').localeCompare(String(b.category_name || b.categoryName || '')))
                                        .map(c => ({ value: c.category_id, label: c.category_name || c.categoryName || c.category_id }));
                                }
                                return allCategories
                                    .slice()
                                    .sort((a, b) => String(a.category_name || a.categoryName || '').localeCompare(String(b.category_name || b.categoryName || '')))
                                    .map(c => ({
                                        value: c.category_id,
                                        label: c.group ? `${c.category_name || c.categoryName || c.category_id} [${getGroupName(c.group)}]` : (c.category_name || c.categoryName || c.category_id)
                                    }));
                            })()}
                            placeholder={formData.group || formData.group_code ? "Select Category for Group" : "Select Category (Auto-sets Group)"}
                            isClearable
                            required
                            styles={formSelectStyles}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Supplier</Label>
                        <ReactSelect
                            name="supplier"
                            value={suppliers.find(s => s.vendor_id === formData.supplier) ? { value: formData.supplier, label: suppliers.find(s => s.vendor_id === formData.supplier).name } : (formData.supplier ? { value: formData.supplier, label: formData.supplier } : null)}
                            onChange={(option) => handleSelectChange('supplier', option)}
                            options={[...suppliers].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })).map(s => ({ value: s.vendor_id, label: s.name }))}
                            placeholder="Select Supplier"
                            isClearable
                            styles={formSelectStyles}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Manufacturer</Label>
                        <ReactSelect
                            name="manufacturer"
                            value={manufacturers.find(m => m.vendor_id === formData.manufacturer) ? { value: formData.manufacturer, label: manufacturers.find(m => m.vendor_id === formData.manufacturer).name } : (formData.manufacturer ? { value: formData.manufacturer, label: formData.manufacturer } : null)}
                            onChange={(option) => handleSelectChange('manufacturer', option)}
                            options={[...manufacturers].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })).map(m => ({ value: m.vendor_id, label: m.name }))}
                            placeholder="Select Manufacturer"
                            isClearable
                            styles={formSelectStyles}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>HSN</Label>
                        <Input name="hsn" value={formData.hsn || ''} onChange={handleInputChange} placeholder="HSN" />
                    </InputWrapper>
                    <InputWrapper>
                        <Label required>Stock Reorder Level</Label>
                        <Input name="stockReorderLevel" value={formData.stockReorderLevel || ''} onChange={handleInputChange} placeholder="Stock Reorder Level" required />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>VED Category (Manual)</Label>
                        <StyledSelect
                            name="ved_category"
                            value={formData.ved_category || 'D'}
                            onChange={handleInputChange}
                            style={{ height: '38px' }}
                        >
                            <option value="V">V - Vital</option>
                            <option value="E">E - Essential</option>
                            <option value="D">D - Desirable</option>
                        </StyledSelect>
                    </InputWrapper>
                    <InputWrapper>
                        <Label>ABC Category (Manual)</Label>
                        <StyledSelect
                            name="abc_category"
                            value={formData.abc_category || 'C'}
                            onChange={handleInputChange}
                            style={{ height: '38px' }}
                        >
                            <option value="A">A - High Value</option>
                            <option value="B">B - Medium Value</option>
                            <option value="C">C - Low Value</option>
                        </StyledSelect>
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Unit Price (₹)</Label>
                        <Input name="unit_price" value={formData.unit_price ?? ''} onChange={handleInputChange} placeholder="0.00" />
                    </InputWrapper>
                    <InputWrapper style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                        <input
                            type="checkbox"
                            id="is_VM"
                            name="is_VM"
                            checked={!!formData.is_VM}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_VM: e.target.checked }))}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <Label htmlFor="is_VM" style={{ margin: 0, cursor: 'pointer', fontWeight: '600' }}>
                            Vending Machine Item
                        </Label>
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Total Quantity</Label>
                        <Input name="total_quantity" value={formData.total_quantity || 0} onChange={handleInputChange} placeholder="Total Quantity" disabled />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Approved Quantity</Label>
                        <Input name="approved_quantity" value={formData.approved_quantity || 0} onChange={handleInputChange} placeholder="Approved Quantity" disabled />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>
                            Opening Stock {isEditing && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>(Non-editable - use Opening Stock action)</span>}
                        </Label>
                        <Input 
                            type="number" 
                            step="any"
                            min="0"
                            name="opening_stock" 
                            value={formData.opening_stock ?? ''} 
                            onChange={handleInputChange} 
                            placeholder="0.00" 
                            disabled={isEditing}
                            style={isEditing ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b', fontWeight: '700' } : {}}
                        />
                    </InputWrapper>
                    {!isEditing && (
                        <InputWrapper>
                            <Label>Opening Stock Remark</Label>
                            <Input 
                                name="remark" 
                                value={formData.remark ?? ''} 
                                onChange={handleInputChange} 
                                placeholder="Audit remark for initial opening stock" 
                            />
                        </InputWrapper>
                    )}
                </>
            );
        }

        if (activeTab.id === 'category') {
            return (
                <>
                    <InputWrapper>
                        <Label required>Category ID (Auto-Generated)</Label>
                        <Input name="category_id" value={formData.category_id || ''} onChange={handleInputChange} placeholder="Auto Generated" disabled />
                    </InputWrapper>
                    <InputWrapper>
                        <Label required>Category Name</Label>
                        <Input 
                            name="category_name" 
                            value={formData.category_name || formData.categoryName || ''} 
                            onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value, categoryName: e.target.value }))} 
                            placeholder="Category Name" 
                            required 
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label required>Mapped Group</Label>
                        <ReactSelect
                            name="group"
                            value={(() => {
                                const gVal = formData.group;
                                if (!gVal) return null;
                                const str = String(gVal).toLowerCase().trim();
                                const gObj = allGroups.find(g => 
                                    String(g.group_id || '').toLowerCase().trim() === str || 
                                    String(g.group_name || '').toLowerCase().trim() === str || 
                                    String(g.groupName || '').toLowerCase().trim() === str
                                );
                                return gObj ? { value: gObj.group_id, label: gObj.group_name || gObj.groupName } : { value: gVal, label: getGroupName(gVal) };
                            })()}
                            onChange={(option) => setFormData(prev => ({ ...prev, group: option ? option.value : '' }))}
                            options={groupOptions}
                            placeholder="Select Group to Map Category"
                            isClearable
                            required
                            styles={formSelectStyles}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        />
                    </InputWrapper>
                </>
            );
        }

        // Generic Name field for Department, Group
        return (
            <>
                <InputWrapper>
                    <Label required>{activeTab.label} ID (Auto-Generated)</Label>
                    <Input name={idField} value={formData[idField] || ''} onChange={handleInputChange} placeholder="Auto Generated" disabled />
                </InputWrapper>
                <InputWrapper>
                    <Label required>{activeTab.label} Name</Label>
                    <Input name={nameField} value={formData[nameField] || ''} onChange={handleInputChange} placeholder={`${activeTab.label} Name`} required />
                </InputWrapper>
            </>
        );
    }

    const totalLowStock = items.filter(it => (Number(it.total_quantity || 0) - Number(it.approved_quantity || 0)) <= Number(it.stockReorderLevel || 0)).length;
    const totalInventoryUnits = items.reduce((acc, it) => acc + Math.max(0, Number(it.total_quantity || 0) - Number(it.approved_quantity || 0)), 0);
    const totalVmItems = items.filter(it => it.is_VM).length;

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                
                {/* Modern Segmented Navigation Tabs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px 20px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab.id === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    border: isActive ? `1px solid ${colors.primary}` : '1px solid transparent',
                                    background: isActive ? '#ffffff' : 'transparent',
                                    color: isActive ? colors.primary : '#64748b',
                                    fontWeight: isActive ? '700' : '600',
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isActive ? '0 2px 8px rgba(13, 148, 136, 0.12)' : 'none'
                                }}
                            >
                                {Icon && <Icon size={17} color={isActive ? colors.primary : '#64748b'} />}
                                <span>{tab.label}</span>
                                {isActive && (
                                    <span style={{
                                        fontSize: '0.72rem',
                                        padding: '2px 7px',
                                        borderRadius: '12px',
                                        background: '#ccfbf1',
                                        color: '#0f766e',
                                        fontWeight: '800'
                                    }}>
                                        {filteredItems.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Header + Add Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.45rem', fontWeight: '800' }}>
                                    {activeTab.label}
                                </h2>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                                    {filteredItems.length} records
                                </span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.85rem' }}>
                                Manage and configure central {activeTab.label.toLowerCase()} catalog specifications.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {activeTab.id === 'item' && (
                                <Button 
                                    type="button"
                                    onClick={() => navigate('/StoresOpeningStockReport')}
                                    style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        padding: '10px 18px', 
                                        fontSize: '0.88rem', 
                                        borderRadius: '10px', 
                                        fontWeight: '700',
                                        background: '#0284c7',
                                        color: '#ffffff',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ShieldCheck size={18} /> Opening Stock Report
                                </Button>
                            )}
                            <Button 
                                success 
                                onClick={() => {
                                    if (activeTab.id === 'item' && !isEditing) {
                                        const activeDept = getSelectedStoreDepartment();
                                        if (activeDept) {
                                            setFormData(prev => ({ ...prev, department: activeDept }));
                                        }
                                    }
                                    setShowForm(true);
                                }} 
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '10px 20px', 
                                    fontSize: '0.9rem', 
                                    borderRadius: '10px', 
                                    fontWeight: '700',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)' 
                                }}
                            >
                                <Plus size={18} /> Add {activeTab.label.replace(' Master', '')}
                            </Button>
                        </div>
                    </div>

                    {/* Master KPI Metric Cards */}
                    {activeTab.id === 'item' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                            <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Items</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.primary, marginTop: '2px' }}>{items.length}</div>
                                </div>
                                <Package size={28} color={colors.primary} style={{ opacity: 0.35 }} />
                            </div>
                            <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: totalLowStock > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: totalLowStock > 0 ? '#dc2626' : '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock Alert</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: totalLowStock > 0 ? '#dc2626' : '#059669', marginTop: '2px' }}>{totalLowStock}</div>
                                </div>
                                <AlertTriangle size={28} color={totalLowStock > 0 ? '#dc2626' : '#059669'} style={{ opacity: 0.35 }} />
                            </div>
                            <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Stock Units</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>{totalInventoryUnits}</div>
                                </div>
                                <Box size={28} color="#0284c7" style={{ opacity: 0.35 }} />
                            </div>
                            <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vending Machine Items</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>{totalVmItems}</div>
                                </div>
                                <Sparkles size={28} color="#7c3aed" style={{ opacity: 0.35 }} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                            <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Registered {activeTab.label.replace(' Master', '')}s</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.primary, marginTop: '2px' }}>{items.length}</div>
                                </div>
                                <ShieldCheck size={28} color={colors.primary} style={{ opacity: 0.35 }} />
                            </div>
                            <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filtered Results</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>{filteredItems.length}</div>
                                </div>
                                <FilterX size={28} color="#0284c7" style={{ opacity: 0.35 }} />
                            </div>
                        </div>
                    )}

                    {/* Filter Controls Bar */}
                    <ControlsContainer style={{ position: 'relative', zIndex: 20, background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', marginBottom: '20px' }}>
                        <SearchContainer style={{ flex: 1, gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                                <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <Input
                                    placeholder={`Search by name, ID or code...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '40px', height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.88rem' }}
                                />
                            </div>

                            {activeTab.id === 'item' && (
                                <>
                                    <DepartmentFilterControl
                                        departments={allDepartments}
                                        onDepartmentChange={(dept) => {
                                            setFilterDepartment(dept || '');
                                        }}
                                    />

                                    <div style={{ minWidth: '190px' }}>
                                        <ReactSelect
                                            value={groupOptions.find(g => g.value === filterGroup) || (filterGroup ? { value: filterGroup, label: getGroupName(filterGroup) } : null)}
                                            onChange={(option) => {
                                                const newGroup = option ? option.value : '';
                                                setFilterGroup(newGroup);
                                                if (newGroup && filterCategory) {
                                                    const catObj = allCategories.find(c => c.category_id === filterCategory);
                                                    if (catObj && catObj.group && catObj.group !== newGroup) {
                                                        setFilterCategory('');
                                                    }
                                                }
                                            }}
                                            options={groupOptions}
                                            placeholder="All Groups"
                                            isClearable
                                            styles={filterSelectStyles}
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                        />
                                    </div>

                                    <div style={{ minWidth: '210px' }}>
                                        <ReactSelect
                                            value={allCategories.find(c => c.category_id === filterCategory) ? { value: filterCategory, label: allCategories.find(c => c.category_id === filterCategory).category_name || allCategories.find(c => c.category_id === filterCategory).categoryName } : (filterCategory ? { value: filterCategory, label: getCategoryName(filterCategory) } : null)}
                                            onChange={(option) => {
                                                const newCat = option ? option.value : '';
                                                setFilterCategory(newCat);
                                                if (newCat && !filterGroup) {
                                                    const catObj = allCategories.find(c => c.category_id === newCat);
                                                    if (catObj && catObj.group) {
                                                        setFilterGroup(catObj.group);
                                                    }
                                                }
                                            }}
                                            options={categoryFilterOptions}
                                            placeholder="All Categories"
                                            isClearable
                                            styles={filterSelectStyles}
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setFilterLowStock(!filterLowStock)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            height: '40px',
                                            padding: '0 14px',
                                            background: filterLowStock ? '#fee2e2' : '#f8fafc',
                                            borderRadius: '8px',
                                            border: filterLowStock ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                            color: filterLowStock ? '#dc2626' : '#475569',
                                            fontWeight: '700',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <AlertTriangle size={15} color={filterLowStock ? '#dc2626' : '#94a3b8'} />
                                        <span>Low Stock</span>
                                    </button>
                                </>
                            )}

                            <Button 
                                secondary 
                                onClick={clearFilters} 
                                style={{ height: '40px', padding: '0 14px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                            >
                                <FilterX size={16} /> Clear
                            </Button>
                        </SearchContainer>
                    </ControlsContainer>

                    {/* Modal Form */}
                    {showForm && (
                        <ModalOverlay>
                            <ModalContainer style={{ maxWidth: '750px', borderRadius: '16px', overflow: 'hidden' }}>
                                <ModalHeader style={{ background: colors.primary, color: '#ffffff', padding: '16px 24px' }}>
                                    <ModalTitle style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
                                        <Plus size={20} /> {isEditing ? `Edit ${activeTab.label}` : `Add New ${activeTab.label}`}
                                    </ModalTitle>
                                    <CloseButton onClick={resetForm} style={{ color: '#ffffff' }}><X size={20} /></CloseButton>
                                </ModalHeader>
                                <ModalBody style={{ padding: '24px' }}>
                                    <form onSubmit={handleSubmit}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                                            {renderFormFields()}
                                        </div>
                                        <ButtonContainer style={{ marginTop: '28px', borderTop: '1px solid #e2e8f0', paddingTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                            <Button secondary type="button" onClick={resetForm} style={{ padding: '10px 24px', fontSize: '0.9rem', borderRadius: '8px' }}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" style={{ padding: '10px 28px', fontSize: '0.9rem', borderRadius: '8px', fontWeight: '700', background: colors.primary }}>
                                                {isEditing ? 'Update Changes' : 'Save Record'}
                                            </Button>
                                        </ButtonContainer>
                                    </form>
                                </ModalBody>
                            </ModalContainer>
                        </ModalOverlay>
                    )}

                    {/* Modern Master Tables */}
                    {!showForm && (
                        <>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                    <div style={{ display: 'inline-block', width: '36px', height: '36px', border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    <p style={{ marginTop: '12px', fontWeight: '600', fontSize: '0.95rem' }}>Loading {activeTab.label} data...</p>
                                </div>
                            ) : (
                                <TableWrapper style={{ position: 'relative', zIndex: 1, background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                                    <Table>
                                        <thead>
                                            <Tr style={{ background: '#f8fafc' }}>
                                                <Th style={{ width: '60px', textAlign: 'center' }}>#</Th>
                                                <Th>Name & Identity</Th>
                                                {activeTab.id === 'item' ? (
                                                    <>
                                                        <Th>Group & Category</Th>
                                                        <Th>HSN</Th>
                                                        <Th style={{ textAlign: 'right' }}>Stock Level</Th>
                                                        <Th style={{ textAlign: 'center' }}>Price History</Th>
                                                        <Th style={{ textAlign: 'center', width: '130px' }}>Actions</Th>
                                                        <Th style={{ textAlign: 'center' }}>VED / ABC</Th>
                                                        <Th style={{ textAlign: 'right' }}>Unit Rate</Th>
                                                        <Th>Supplier / Maker</Th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Th>Master Code / ID</Th>
                                                        {activeTab.id === 'category' && <Th>Mapped Group</Th>}
                                                        <Th style={{ textAlign: 'center' }}>Status</Th>
                                                        <Th style={{ textAlign: 'center', width: '120px' }}>Actions</Th>
                                                    </>
                                                )}
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {pageData.map((item, idx) => {
                                                const idField = getIdField();
                                                const nameField = getNameField();
                                                const availQty = Number(item.total_quantity || 0) - Number(item.approved_quantity || 0);
                                                const reorderLvl = Number(item.stockReorderLevel || 0);
                                                const isLowStock = activeTab.id === 'item' && availQty <= reorderLvl;

                                                return (
                                                    <Tr key={item[idField]} style={isLowStock ? { backgroundColor: '#fff5f5' } : {}}>
                                                        <Td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600' }}>
                                                            {startIdx + idx + 1}
                                                        </Td>
                                                        <Td>
                                                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {item[nameField] || item['categoryName'] || item['groupName']}
                                                                {activeTab.id !== 'item' && item.is_VM && (
                                                                    <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0', fontWeight: '800' }}>
                                                                        VM
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {activeTab.id !== 'item' && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '3px' }}>
                                                                    <span style={{ fontSize: '0.74rem', color: colors.primary, fontWeight: '600', fontFamily: 'monospace' }}>
                                                                        ID: {item[idField]}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </Td>

                                                        {activeTab.id === 'item' ? (
                                                            <>
                                                                <Td>
                                                                    <div style={{ fontWeight: '600', color: '#334155' }}>
                                                                        {item.group_name && item.group_name !== '-' && item.group_name !== item.group
                                                                            ? item.group_name
                                                                            : getGroupName(item.group_code || item.group)}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                        {item.category_name && item.category_name !== '-' && item.category_name !== item.category
                                                                            ? item.category_name
                                                                            : getCategoryName(item.category_code || item.category)}
                                                                    </div>
                                                                </Td>
                                                                <Td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.hsn || '-'}</Td>
<Td style={{ textAlign: 'right' }}>
                                                                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: isLowStock ? '#dc2626' : '#16a34a' }}>
                                                                        {availQty} units
                                                                    </div>
                                                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                                        Reorder @ {reorderLvl}
                                                                    </div>
                                                                    {item.opening_stock !== undefined && item.opening_stock !== null && (
                                                                        <div 
                                                                            onClick={() => handleOpenStockModal(item)}
                                                                            title="Click to manage opening stock"
                                                                            style={{ 
                                                                                fontSize: '0.70rem', 
                                                                                color: '#0369a1', 
                                                                                marginTop: '3px', 
                                                                                fontWeight: '700',
                                                                                cursor: 'pointer',
                                                                                background: '#e0f2fe',
                                                                                border: '1px solid #bae6fd',
                                                                                borderRadius: '4px',
                                                                                padding: '1px 6px',
                                                                                display: 'inline-block',
                                                                                transition: 'all 0.15s ease'
                                                                            }}
                                                                        >
                                                                            Open: {Number(item.opening_stock || 0).toFixed(2)} ✎
                                                                        </div>
                                                                    )}
                                                                </Td>
<Td style={{ textAlign: 'center' }}>
                                                                    <Button
                                                                        onClick={() => fetchPriceHistory(item, nameField, idField)}
                                                                        style={{ 
                                                                            background: '#eff6ff', 
                                                                            color: '#2563eb', 
                                                                            border: '1px solid #bfdbfe', 
                                                                            padding: '5px 10px', 
                                                                            fontSize: '0.78rem',
                                                                            borderRadius: '6px',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            fontWeight: '600'
                                                                        }}
                                                                        title="Price History Trends"
                                                                    >
                                                                        <LineChart size={14} /> Trends
                                                                    </Button>
                                                                </Td>
<Td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                                                                {activeTab.id === 'item' && (
                                                                    <button
                                                                        onClick={() => handleOpenStockModal(item)}
                                                                        style={{ 
                                                                            background: '#f0f9ff', 
                                                                            color: '#0284c7', 
                                                                            border: '1px solid #bae6fd', 
                                                                            padding: '6px 8px',
                                                                            borderRadius: '6px',
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                        title="Manage Opening Stock (Add / Update)"
                                                                    >
                                                                        <PackagePlus size={15} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    style={{ 
                                                                        background: '#f0fdf4', 
                                                                        color: '#16a34a', 
                                                                        border: '1px solid #bbf7d0', 
                                                                        padding: '6px 8px',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    title="Edit Record"
                                                                >
                                                                    <Edit2 size={15} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item[idField])}
                                                                    style={{ 
                                                                        background: '#fef2f2', 
                                                                        color: '#dc2626', 
                                                                        border: '1px solid #fecaca', 
                                                                        padding: '6px 8px',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    title="Delete Record"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </Td>
<Td style={{ textAlign: 'center' }}>
                                                                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                                                                        <span style={{
                                                                            padding: '2px 7px',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: '800',
                                                                            background: item.ved_category === 'V' ? '#fee2e2' : item.ved_category === 'E' ? '#eff6ff' : '#f1f5f9',
                                                                            color: item.ved_category === 'V' ? '#dc2626' : item.ved_category === 'E' ? '#2563eb' : '#475569',
                                                                            border: `1px solid ${item.ved_category === 'V' ? '#fca5a5' : item.ved_category === 'E' ? '#bfdbfe' : '#cbd5e1'}`
                                                                        }}>
                                                                            VED: {item.ved_category || 'D'}
                                                                        </span>
                                                                        <span style={{
                                                                            padding: '2px 7px',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: '800',
                                                                            background: item.abc_category === 'A' ? '#f5f3ff' : item.abc_category === 'B' ? '#ecfdf5' : '#f8fafc',
                                                                            color: item.abc_category === 'A' ? '#7c3aed' : item.abc_category === 'B' ? '#059669' : '#64748b',
                                                                            border: `1px solid ${item.abc_category === 'A' ? '#ddd6fe' : item.abc_category === 'B' ? '#a7f3d0' : '#e2e8f0'}`
                                                                        }}>
                                                                            ABC: {item.abc_category || 'C'}
                                                                        </span>
                                                                    </div>
                                                                </Td>
<Td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                                                                    ₹{parseFloat(item.unit_price || 0).toFixed(2)}
                                                                </Td>
                                                                <Td style={{ fontSize: '0.82rem' }}>
                                                                    <div style={{ color: '#1e293b' }}>{getVendorName(item.supplier)}</div>
                                                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{getVendorName(item.manufacturer)}</div>
                                                                </Td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Td style={{ fontFamily: 'monospace', fontWeight: '700', color: colors.primary }}>
                                                                    {item[idField]}
                                                                </Td>
                                                                {activeTab.id === 'category' && (
                                                                    <Td>
                                                                        <span style={{ 
                                                                            fontSize: '0.8rem', 
                                                                            fontWeight: '700', 
                                                                            color: '#0f766e', 
                                                                            background: '#f0fdfa', 
                                                                            padding: '3px 10px', 
                                                                            borderRadius: '6px', 
                                                                            border: '1px solid #ccfbf1' 
                                                                        }}>
                                                                            {item.group_name && item.group_name !== '-' ? item.group_name : getGroupName(item.group)}
                                                                        </span>
                                                                    </Td>
                                                                )}
                                                                <Td style={{ textAlign: 'center' }}>
                                                                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: '#dcfce7', color: '#15803d' }}>
                                                                        Active
                                                                    </span>
                                                                </Td>
                                                                <Td style={{ textAlign: 'center' }}>
                                                                    <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
                                                                        <button
                                                                            onClick={() => handleEdit(item)}
                                                                            style={{ 
                                                                                background: '#f0fdf4', 
                                                                                color: '#16a34a', 
                                                                                border: '1px solid #bbf7d0', 
                                                                                padding: '6px 8px',
                                                                                borderRadius: '6px',
                                                                                cursor: 'pointer',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}
                                                                            title="Edit Record"
                                                                        >
                                                                            <Edit2 size={15} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(item[idField])}
                                                                            style={{ 
                                                                                background: '#fef2f2', 
                                                                                color: '#dc2626', 
                                                                                border: '1px solid #fecaca', 
                                                                                padding: '6px 8px',
                                                                                borderRadius: '6px',
                                                                                cursor: 'pointer',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}
                                                                            title="Delete Record"
                                                                        >
                                                                            <Trash2 size={15} />
                                                                        </button>
                                                                    </div>
                                                                </Td>
                                                            </>
                                                        )}
                                                    </Tr>
                                                );
                                            })}
                                            {filteredItems.length === 0 && (
                                                <Tr>
                                                    <Td colSpan={activeTab.id === 'item' ? "10" : "5"} style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                                                        <Package size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                                        <div>No {activeTab.label.toLowerCase()} records match the filter criteria.</div>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </tbody>
                                    </Table>
                                    <TablePagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        pageSize={pageSize}
                                        totalItems={totalItems}
                                        startIdx={startIdx}
                                        goTo={goTo}
                                        onPageSizeChange={handlePageSizeChange}
                                        itemName={activeTab.label.replace(' Master', '').toLowerCase()}
                                        themeColor={colors.primary}
                                    />
                                </TableWrapper>
                            )}
                        </>
                    )}
                </div>
            </Container>

            {/* Price History Modal */}
            {showPriceModal && (
                <ModalOverlay>
                    <ModalContainer style={{ maxWidth: '700px' }}>
                        <ModalHeader>
                            <ModalTitle>Price History - {selectedItemName}</ModalTitle>
                            <CloseButton onClick={() => setShowPriceModal(false)}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            {loadingPrices ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>Loading price history...</div>
                            ) : priceData?.error ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: colors.danger }}>{priceData.error}</div>
                            ) : priceData?.history?.length > 0 ? (
                                <div>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                        <div style={{ flex: 1, background: colors.success + '20', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: colors.success, fontWeight: 'bold', marginBottom: '5px' }}>Lowest Price</div>
                                            <div style={{ fontSize: '1.4rem', color: colors.textMain, fontWeight: 'bold' }}>₹{priceData.lowest}</div>
                                        </div>
                                        <div style={{ flex: 1, background: colors.primary + '20', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: colors.primary, fontWeight: 'bold', marginBottom: '5px' }}>Average Price</div>
                                            <div style={{ fontSize: '1.4rem', color: colors.textMain, fontWeight: 'bold' }}>₹{priceData.average}</div>
                                        </div>
                                        <div style={{ flex: 1, background: colors.danger + '20', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: colors.danger, fontWeight: 'bold', marginBottom: '5px' }}>Highest Price</div>
                                            <div style={{ fontSize: '1.4rem', color: colors.textMain, fontWeight: 'bold' }}>₹{priceData.highest}</div>
                                        </div>
                                    </div>
                                    <h4 style={{ margin: '0 0 10px 0', color: colors.textMain }}>Purchase History</h4>
                                    <TableWrapper>
                                        <Table>
                                            <thead>
                                                <Tr>
                                                    <Th>Date</Th>
                                                    <Th>GRN Number</Th>
                                                    <Th>Vendor</Th>
                                                    <Th style={{ textAlign: 'right' }}>Qty</Th>
                                                    <Th style={{ textAlign: 'right' }}>Unit Rate</Th>
                                                </Tr>
                                            </thead>
                                            <tbody>
                                                {priceData.history.map((record, idx) => (
                                                    <Tr key={idx}>
                                                        <Td>{record.date || '-'}</Td>
                                                        <Td style={{ fontWeight: '500' }}>{record.grn_number}</Td>
                                                        <Td>{getVendorName(record.vendor_id)}</Td>
                                                        <Td style={{ textAlign: 'right' }}>{record.quantity || 0}</Td>
                                                        <Td style={{ textAlign: 'right', fontWeight: 'bold', color: colors.primary }}>₹{record.rate}</Td>
                                                    </Tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </TableWrapper>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                                    No purchase history found for this item.
                                </div>
                            )}
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}

            {/* Dedicated Opening Stock Action Modal */}
            {showStockModal && selectedItemForStock && (
                <ModalOverlay>
                    <ModalContainer style={{ maxWidth: '620px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' }}>
                        <ModalHeader style={{ background: '#0284c7', color: '#ffffff', padding: '16px 22px' }}>
                            <ModalTitle style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                                <PackagePlus size={20} /> Manage Opening Stock
                            </ModalTitle>
                            <CloseButton onClick={handleCloseStockModal} style={{ color: '#ffffff' }}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>
                        <ModalBody style={{ padding: '24px' }}>
                            {/* Item Identification Card */}
                            <div style={{ 
                                background: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '10px', 
                                padding: '14px 16px', 
                                marginBottom: '20px' 
                            }}>
                                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                                    {selectedItemForStock.itemName}
                                </div>
                                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                                    <span><strong>Item ID:</strong> <code style={{ color: colors.primary, fontWeight: '700' }}>{selectedItemForStock.item_id}</code></span>
                                    <span><strong>Department:</strong> {selectedItemForStock.department_name || selectedItemForStock.department || '-'}</span>
                                    <span><strong>Group:</strong> {selectedItemForStock.group_name || selectedItemForStock.group || '-'}</span>
                                </div>
                            </div>

                            <form onSubmit={handleSaveOpeningStock}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    {/* Field 1: So far added (NON-EDITABLE) */}
                                    <InputWrapper style={{ marginBottom: 0 }}>
                                        <Label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Opening Stock Added So Far</span>
                                            <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                                                NON-EDITABLE
                                            </span>
                                        </Label>
                                        <Input 
                                            value={`${Number(selectedItemForStock.opening_stock || 0).toFixed(2)} units`} 
                                            disabled 
                                            style={{ 
                                                backgroundColor: '#f1f5f9', 
                                                color: '#334155', 
                                                fontWeight: '800', 
                                                cursor: 'not-allowed',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '1rem'
                                            }} 
                                        />
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                            Locked baseline stock from Item Master for audit consistency.
                                        </div>
                                    </InputWrapper>

                                    {/* Adjustment Mode Selector */}
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '8px', 
                                        background: '#f1f5f9', 
                                        padding: '5px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #e2e8f0' 
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => setStockAdjustmentMode('ADD')}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                fontWeight: '700',
                                                fontSize: '0.84rem',
                                                cursor: 'pointer',
                                                background: stockAdjustmentMode === 'ADD' ? '#0284c7' : 'transparent',
                                                color: stockAdjustmentMode === 'ADD' ? '#ffffff' : '#64748b',
                                                boxShadow: stockAdjustmentMode === 'ADD' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            + Add Additional Stock
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStockAdjustmentMode('SET')}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                fontWeight: '700',
                                                fontSize: '0.84rem',
                                                cursor: 'pointer',
                                                background: stockAdjustmentMode === 'SET' ? '#0284c7' : 'transparent',
                                                color: stockAdjustmentMode === 'SET' ? '#ffffff' : '#64748b',
                                                boxShadow: stockAdjustmentMode === 'SET' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            Set New Total Stock
                                        </button>
                                    </div>

                                    {/* Field 2: Get New Stock */}
                                    <InputWrapper style={{ marginBottom: 0 }}>
                                        <Label required>
                                            {stockAdjustmentMode === 'ADD' ? 'Additional Stock to Add' : 'New Opening Stock Total'}
                                        </Label>
                                        <Input 
                                            type="number"
                                            step="any"
                                            min="0"
                                            placeholder="Enter stock quantity..."
                                            value={newStockValue}
                                            onChange={(e) => setNewStockValue(e.target.value)}
                                            required
                                            autoFocus
                                            style={{ height: '42px', fontSize: '0.95rem', fontWeight: '600' }}
                                        />
                                    </InputWrapper>

                                    {/* Dynamic preview pill */}
                                    {newStockValue !== '' && !isNaN(parseFloat(newStockValue)) && (
                                        <div style={{ 
                                            background: '#f0fdf4', 
                                            border: '1px solid #bbf7d0', 
                                            padding: '10px 14px', 
                                            borderRadius: '8px', 
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ color: '#166534', fontWeight: '600' }}>
                                                Resulting Opening Stock:
                                            </span>
                                            <span style={{ color: '#15803d', fontWeight: '800', fontSize: '1rem' }}>
                                                {stockAdjustmentMode === 'ADD'
                                                    ? (parseFloat(selectedItemForStock.opening_stock || 0) + parseFloat(newStockValue || 0)).toFixed(2)
                                                    : parseFloat(newStockValue || 0).toFixed(2)
                                                } units
                                                <span style={{ fontSize: '0.78rem', color: '#16a34a', marginLeft: '6px' }}>
                                                    ({stockAdjustmentMode === 'ADD' 
                                                        ? `+${parseFloat(newStockValue || 0).toFixed(2)}`
                                                        : `${(parseFloat(newStockValue || 0) - parseFloat(selectedItemForStock.opening_stock || 0)).toFixed(2)}`
                                                    })
                                                </span>
                                            </span>
                                        </div>
                                    )}

                                    {/* Field 3: Get Remark */}
                                    <InputWrapper style={{ marginBottom: 0 }}>
                                        <Label required>Audit Remark / Reason</Label>
                                        <Input 
                                            type="text"
                                            placeholder="e.g. Physical inventory balance count, stock adjustment, initial setup..."
                                            value={stockRemark}
                                            onChange={(e) => setStockRemark(e.target.value)}
                                            required
                                            style={{ height: '42px', fontSize: '0.88rem' }}
                                        />
                                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                                            Permanently stored in the Opening Stock Audit Report log.
                                        </div>
                                    </InputWrapper>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                    <Button 
                                        secondary 
                                        type="button" 
                                        onClick={handleCloseStockModal} 
                                        disabled={savingStock}
                                        style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '0.88rem' }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={savingStock || !newStockValue || !stockRemark.trim()}
                                        style={{ 
                                            background: '#0284c7', 
                                            padding: '9px 24px', 
                                            borderRadius: '8px', 
                                            fontWeight: '700', 
                                            fontSize: '0.88rem',
                                            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                                        }}
                                    >
                                        {savingStock ? 'Saving Audit Record...' : 'Save Opening Stock'}
                                    </Button>
                                </div>
                            </form>
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}
        </PageWrapper>
    );
};

export default Items;


