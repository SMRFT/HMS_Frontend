import React, { useState, useEffect } from 'react';
import ReactSelect from 'react-select';
import { 
    LineChart, X, Plus, Search, Edit2, Trash2, FilterX, Layers, 
    AlertCircle, CheckCircle, Package, Building2, Tag, LayoutGrid, 
    AlertTriangle, Box, ShieldCheck, Sparkles, ArrowUpDown
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import TablePagination, { usePagination } from './TablePagination';
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
    { id: 'category', label: 'Category Master', icon: Tag, endpoint: 'category-master' },
    { id: 'grouptype', label: 'Group Type Master', icon: LayoutGrid, endpoint: 'group-type-master' }
];

const Items = () => {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [filterLowStock, setFilterLowStock] = useState(false);

    // Price History states
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [priceData, setPriceData] = useState(null);
    const [selectedItemName, setSelectedItemName] = useState('');
    const [selectedItemForPrice, setSelectedItemForPrice] = useState(null);
    const [priceFromDate, setPriceFromDate] = useState('');
    const [priceToDate, setPriceToDate] = useState('');
    const [loadingPrices, setLoadingPrices] = useState(false);

    // Master list states for mappings
    const [allDepartments, setAllDepartments] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [allGroupTypes, setAllGroupTypes] = useState([]);
    const [allVendors, setAllVendors] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);

    // Dynamic base URL detection
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    useEffect(() => {
        fetchItems();
        resetForm();
        fetchMasters();
    }, [activeTab]);

    const fetchMasters = async () => {
        try {
            const [deptRes, groupRes, catRes, typeRes, storeVendorRes, generalVendorRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/category-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-type-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/vendors/`)
            ]);
            if (deptRes.success) setAllDepartments(deptRes.data);
            if (groupRes.success) setAllGroups(groupRes.data);
            if (catRes.success) setAllCategories(catRes.data);
            if (typeRes.success) setAllGroupTypes(typeRes.data);

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
            case 'grouptype': return 'group_type_id';
            default: return 'id';
        }
    };

    const getNameField = () => {
        switch (activeTab.id) {
            case 'item': return 'itemName';
            case 'department': return 'department_name';
            case 'group': return 'group_name';
            case 'category': return 'category_name';
            case 'grouptype': return 'group_type_name';
            default: return 'name';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            const API_URL = `${getBaseUrl.replace(/\/$/, '')}/${activeTab.endpoint}/`;
            const idField = getIdField();

            if (isEditing) {
                response = await apiRequest(`${API_URL}${formData[idField]}/`, 'PATCH', formData);
            } else {
                response = await apiRequest(API_URL, 'POST', formData);
            }

            if (response.success) {
                fetchItems();
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
        setFormData(item);
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

    const fetchPriceHistory = async (item, nameField, idField, overrideFromDate, overrideToDate) => {
        const targetItem = item || selectedItemForPrice;
        if (!targetItem) return;
        const itemId = targetItem[idField || getIdField()];
        setSelectedItemName(targetItem[nameField || getNameField()]);
        setSelectedItemForPrice(targetItem);
        setLoadingPrices(true);
        setShowPriceModal(true);

        const fromD = overrideFromDate !== undefined ? overrideFromDate : priceFromDate;
        const toD = overrideToDate !== undefined ? overrideToDate : priceToDate;

        try {
            let query = '';
            const params = [];
            if (fromD) params.push(`from_date=${fromD}`);
            if (toD) params.push(`to_date=${toD}`);
            if (params.length > 0) query = `?${params.join('&')}`;

            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/price-history/${itemId}/${query}`);
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

    const resetForm = () => {
        setFormData({});
        setIsEditing(false);
        setShowForm(false);
    };

    // Filter logic (currently just for Item Master, simplify for others)
    const filteredItems = items.filter(item => {
        const idField = getIdField();
        const nameField = getNameField();

        const matchesSearch = item[nameField]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item[idField]?.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab.id !== 'item') return matchesSearch;

        // Extra filters only for items
        const matchesDept = filterDepartment ? item.department === filterDepartment : true;
        const matchesCat = filterCategory ? item.category === filterCategory : true;
        const matchesGroup = filterGroup ? item.group === filterGroup : true;

        // Low Stock Filter
        let matchesLowStock = true;
        if (filterLowStock && activeTab.id === 'item') {
            const availQty = Number(item.total_quantity || 0) - Number(item.approved_quantity || 0);
            matchesLowStock = availQty <= Number(item.stockReorderLevel || 0);
        }

        return matchesSearch && matchesDept && matchesCat && matchesGroup && matchesLowStock;
    });

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
        setFilterCategory('');
        setFilterGroup('');
        setFilterLowStock(false);
    };

    const getDepartmentName = (id) => {
        const dept = allDepartments.find(d => d.department_id === id);
        return dept ? dept.department_name : id;
    };

    const getGroupName = (id) => {
        const group = allGroups.find(g => g.group_id === id);
        return group ? group.group_name : id;
    };

    const getCategoryName = (id) => {
        const cat = allCategories.find(c => c.category_id === id);
        return cat ? cat.category_name : id;
    };

    const getGroupTypeName = (id) => {
        const type = allGroupTypes.find(g => g.group_type_id === id);
        return type ? type.group_type_name : id;
    };

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
                            value={allDepartments.find(d => d.department_id === formData.department) ? { value: formData.department, label: allDepartments.find(d => d.department_id === formData.department).department_name } : null}
                            onChange={(option) => handleSelectChange('department', option)}
                            options={allDepartments.map(d => ({ value: d.department_id, label: d.department_name }))}
                            placeholder="Select Department"
                            isClearable
                            styles={{ container: base => ({ ...base, width: '100%' }) }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label required>Category</Label>
                        <ReactSelect
                            name="category"
                            value={allCategories.find(c => c.category_id === formData.category) ? { value: formData.category, label: allCategories.find(c => c.category_id === formData.category).category_name } : null}
                            onChange={(option) => handleSelectChange('category', option)}
                            options={allCategories.map(c => ({ value: c.category_id, label: c.category_name }))}
                            placeholder="Select Category"
                            isClearable
                            required
                            styles={{ container: base => ({ ...base, width: '100%' }) }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label required>Group</Label>
                        <ReactSelect
                            name="group"
                            value={allGroups.find(g => g.group_id === formData.group) ? { value: formData.group, label: allGroups.find(g => g.group_id === formData.group).group_name } : null}
                            onChange={(option) => handleSelectChange('group', option)}
                            options={allGroups.map(g => ({ value: g.group_id, label: g.group_name }))}
                            placeholder="Select Group"
                            isClearable
                            required
                            styles={{ container: base => ({ ...base, width: '100%' }) }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label required>Group Type</Label>
                        <ReactSelect
                            name="group_type"
                            value={allGroupTypes.find(gt => gt.group_type_id === formData.group_type) ? { value: formData.group_type, label: allGroupTypes.find(gt => gt.group_type_id === formData.group_type).group_type_name } : null}
                            onChange={(option) => handleSelectChange('group_type', option)}
                            options={allGroupTypes.map(gt => ({ value: gt.group_type_id, label: gt.group_type_name }))}
                            placeholder="Select Group Type"
                            isClearable
                            required
                            styles={{ container: base => ({ ...base, width: '100%' }) }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Supplier</Label>
                        <ReactSelect
                            name="supplier"
                            value={suppliers.find(s => s.vendor_id === formData.supplier) ? { value: formData.supplier, label: suppliers.find(s => s.vendor_id === formData.supplier).name } : (formData.supplier ? { value: formData.supplier, label: formData.supplier } : null)}
                            onChange={(option) => handleSelectChange('supplier', option)}
                            options={suppliers.map(s => ({ value: s.vendor_id, label: s.name }))}
                            placeholder="Select Supplier"
                            isClearable
                            styles={{ container: base => ({ ...base, width: '100%' }) }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Manufacturer</Label>
                        <ReactSelect
                            name="manufacturer"
                            value={manufacturers.find(m => m.vendor_id === formData.manufacturer) ? { value: formData.manufacturer, label: manufacturers.find(m => m.vendor_id === formData.manufacturer).name } : (formData.manufacturer ? { value: formData.manufacturer, label: formData.manufacturer } : null)}
                            onChange={(option) => handleSelectChange('manufacturer', option)}
                            options={manufacturers.map(m => ({ value: m.vendor_id, label: m.name }))}
                            placeholder="Select Manufacturer"
                            isClearable
                            styles={{ container: base => ({ ...base, width: '100%' }) }}
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
                        <Input name="unit_price" type="number" step="0.01" value={formData.unit_price ?? ''} onChange={handleInputChange} placeholder="0.00" />
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
                        <Input name="total_quantity" type="number" value={formData.total_quantity || 0} onChange={handleInputChange} placeholder="Total Quantity" disabled />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>Approved Quantity</Label>
                        <Input name="approved_quantity" type="number" value={formData.approved_quantity || 0} onChange={handleInputChange} placeholder="Approved Quantity" disabled />
                    </InputWrapper>
                </>
            );
        }

        // Generic Name field for Department, Group, Category, GroupType
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
                        <Button 
                            success 
                            onClick={() => setShowForm(true)} 
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
                    <ControlsContainer style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', marginBottom: '20px' }}>
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
                                    <div style={{ minWidth: '190px' }}>
                                        <ReactSelect
                                            value={allDepartments.find(d => d.department_id === filterDepartment) ? { value: filterDepartment, label: allDepartments.find(d => d.department_id === filterDepartment).department_name } : null}
                                            onChange={(option) => setFilterDepartment(option ? option.value : '')}
                                            options={allDepartments.map(dept => ({ value: dept.department_id, label: dept.department_name }))}
                                            placeholder="All Departments"
                                            isClearable
                                            styles={{ control: base => ({ ...base, minHeight: '40px', height: '40px', borderRadius: '8px', borderColor: '#cbd5e1', fontSize: '0.85rem' }) }}
                                        />
                                    </div>

                                    <div style={{ minWidth: '190px' }}>
                                        <ReactSelect
                                            value={allCategories.find(c => c.category_id === filterCategory) ? { value: filterCategory, label: allCategories.find(c => c.category_id === filterCategory).category_name } : null}
                                            onChange={(option) => setFilterCategory(option ? option.value : '')}
                                            options={allCategories.map(cat => ({ value: cat.category_id, label: cat.category_name }))}
                                            placeholder="All Categories"
                                            isClearable
                                            styles={{ control: base => ({ ...base, minHeight: '40px', height: '40px', borderRadius: '8px', borderColor: '#cbd5e1', fontSize: '0.85rem' }) }}
                                        />
                                    </div>

                                    <div style={{ minWidth: '190px' }}>
                                        <ReactSelect
                                            value={allGroups.find(g => g.group_id === filterGroup) ? { value: filterGroup, label: allGroups.find(g => g.group_id === filterGroup).group_name } : null}
                                            onChange={(option) => setFilterGroup(option ? option.value : '')}
                                            options={allGroups.map(grp => ({ value: grp.group_id, label: grp.group_name }))}
                                            placeholder="All Groups"
                                            isClearable
                                            styles={{ control: base => ({ ...base, minHeight: '40px', height: '40px', borderRadius: '8px', borderColor: '#cbd5e1', fontSize: '0.85rem' }) }}
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
                                <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                    <Table>
                                        <thead>
                                            <Tr style={{ background: '#f8fafc' }}>
                                                <Th style={{ width: '60px', textAlign: 'center' }}>#</Th>
                                                <Th>Name & Identity</Th>
                                                {activeTab.id === 'item' ? (
                                                    <>
                                                        <Th>Group & Category</Th>
                                                        <Th>HSN</Th>
                                                        <Th style={{ textAlign: 'center' }}>VED / ABC</Th>
                                                        <Th style={{ textAlign: 'right' }}>Stock Level</Th>
                                                        <Th style={{ textAlign: 'right' }}>Unit Rate</Th>
                                                        <Th>Supplier / Maker</Th>
                                                        <Th style={{ textAlign: 'center' }}>Price History</Th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Th>Master Code / ID</Th>
                                                        <Th style={{ textAlign: 'center' }}>Status</Th>
                                                    </>
                                                )}
                                                <Th style={{ textAlign: 'center', width: '120px' }}>Actions</Th>
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
                                                                {item[nameField]}
                                                                {item.is_VM && (
                                                                    <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0', fontWeight: '800' }}>
                                                                        VM
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '0.74rem', color: colors.primary, marginTop: '2px', fontWeight: '600', fontFamily: 'monospace' }}>
                                                                ID: {item[idField]}
                                                            </div>
                                                        </Td>

                                                        {activeTab.id === 'item' ? (
                                                            <>
                                                                <Td>
                                                                    <div style={{ fontWeight: '600', color: '#334155' }}>{getGroupName(item.group)}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{getCategoryName(item.category)}</div>
                                                                </Td>
                                                                <Td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.hsn || '-'}</Td>
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
                                                                <Td style={{ textAlign: 'right' }}>
                                                                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: isLowStock ? '#dc2626' : '#16a34a' }}>
                                                                        {availQty} units
                                                                    </div>
                                                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                                        Reorder @ {reorderLvl}
                                                                    </div>
                                                                </Td>
                                                                <Td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                                                                    ₹{parseFloat(item.unit_price || 0).toFixed(2)}
                                                                </Td>
                                                                <Td style={{ fontSize: '0.82rem' }}>
                                                                    <div style={{ color: '#1e293b' }}>{getVendorName(item.supplier)}</div>
                                                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{getVendorName(item.manufacturer)}</div>
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
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Td style={{ fontFamily: 'monospace', fontWeight: '700', color: colors.primary }}>
                                                                    {item[idField]}
                                                                </Td>
                                                                <Td style={{ textAlign: 'center' }}>
                                                                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: '#dcfce7', color: '#15803d' }}>
                                                                        Active
                                                                    </span>
                                                                </Td>
                                                            </>
                                                        )}

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
                            {/* Date Filter Bar */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', background: colors.tabBg, padding: '12px 16px', borderRadius: '8px' }}>
                                <InputWrapper style={{ marginBottom: 0, flex: 1 }}>
                                    <Label style={{ fontSize: '0.8rem' }}>From Date</Label>
                                    <Input type="date" value={priceFromDate} onChange={(e) => setPriceFromDate(e.target.value)} style={{ height: '36px' }} />
                                </InputWrapper>
                                <InputWrapper style={{ marginBottom: 0, flex: 1 }}>
                                    <Label style={{ fontSize: '0.8rem' }}>To Date</Label>
                                    <Input type="date" value={priceToDate} onChange={(e) => setPriceToDate(e.target.value)} style={{ height: '36px' }} />
                                </InputWrapper>
                                <Button onClick={() => fetchPriceHistory(selectedItemForPrice)} style={{ height: '36px', padding: '0 16px', fontSize: '0.85rem' }}>
                                    Apply Filter
                                </Button>
                                <Button secondary onClick={() => { setPriceFromDate(''); setPriceToDate(''); fetchPriceHistory(selectedItemForPrice, null, null); }} style={{ height: '36px', padding: '0 12px', fontSize: '0.85rem' }}>
                                    Clear
                                </Button>
                            </div>
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
        </PageWrapper>
    );
};

export default Items;

