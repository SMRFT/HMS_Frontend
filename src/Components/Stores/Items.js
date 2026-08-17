import React, { useState, useEffect } from 'react';
import ReactSelect from 'react-select';
import { LineChart, X } from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import { Plus, Search, Edit2, Trash2, FilterX } from 'lucide-react';
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
    { id: 'item', label: 'Item Master', endpoint: 'item-master' },
    { id: 'department', label: 'Department Master', endpoint: 'department-master' },
    { id: 'group', label: 'Group Master', endpoint: 'group-master' },
    { id: 'category', label: 'Category Master', endpoint: 'category-master' },
    { id: 'grouptype', label: 'Group Type Master', endpoint: 'group-type-master' }
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

    return (
        <PageWrapper>
            <Container>
                <TabContainer>
                    {tabs.map(tab => (
                        <Tab
                            key={tab.id}
                            active={activeTab.id === tab.id}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.label}
                        </Tab>
                    ))}
                </TabContainer>

                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ margin: 0, color: colors.primary, fontSize: '1.5rem', fontWeight: '700' }}>{activeTab.label}</h2>
                            <span style={{ background: colors.tabBg, color: colors.primary, padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                {filteredItems.length} Records
                            </span>
                        </div>
                        <Button success onClick={() => setShowForm(true)} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                            <Plus size={18} /> Add {activeTab.label.replace(' Master', '')}
                        </Button>
                    </div>

                    <ControlsContainer style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                        <SearchContainer style={{ flex: 1, gap: '16px' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                                <Input
                                    placeholder={`Search by name or ID...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '40px', height: '42px', borderRadius: '8px' }}
                                />
                            </div>

                            {activeTab.id === 'item' && (
                                <>
                                    <div style={{ minWidth: '200px' }}>
                                        <ReactSelect
                                            value={allDepartments.find(d => d.department_id === filterDepartment) ? { value: filterDepartment, label: allDepartments.find(d => d.department_id === filterDepartment).department_name } : null}
                                            onChange={(option) => setFilterDepartment(option ? option.value : '')}
                                            options={allDepartments.map(dept => ({ value: dept.department_id, label: dept.department_name }))}
                                            placeholder="All Departments"
                                            isClearable
                                            styles={{ control: base => ({ ...base, height: '42px', borderRadius: '8px', borderColor: colors.border }) }}
                                        />
                                    </div>

                                    <div style={{ minWidth: '200px' }}>
                                        <ReactSelect
                                            value={allCategories.find(c => c.category_id === filterCategory) ? { value: filterCategory, label: allCategories.find(c => c.category_id === filterCategory).category_name } : null}
                                            onChange={(option) => setFilterCategory(option ? option.value : '')}
                                            options={allCategories.map(cat => ({ value: cat.category_id, label: cat.category_name }))}
                                            placeholder="All Categories"
                                            isClearable
                                            styles={{ control: base => ({ ...base, height: '42px', borderRadius: '8px', borderColor: colors.border }) }}
                                        />
                                    </div>

                                    <div style={{ minWidth: '200px' }}>
                                        <ReactSelect
                                            value={allGroups.find(g => g.group_id === filterGroup) ? { value: filterGroup, label: allGroups.find(g => g.group_id === filterGroup).group_name } : null}
                                            onChange={(option) => setFilterGroup(option ? option.value : '')}
                                            options={allGroups.map(grp => ({ value: grp.group_id, label: grp.group_name }))}
                                            placeholder="All Groups"
                                            isClearable
                                            styles={{ control: base => ({ ...base, height: '42px', borderRadius: '8px', borderColor: colors.border }) }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: filterLowStock ? '#fee2e2' : 'transparent', borderRadius: '8px', transition: 'all 0.2s', border: filterLowStock ? `1px solid ${colors.danger}` : `1px solid transparent` }}>
                                        <input
                                            type="checkbox"
                                            id="lowStockCheckbox"
                                            checked={filterLowStock}
                                            onChange={(e) => setFilterLowStock(e.target.checked)}
                                            style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer', accentColor: colors.danger }}
                                        />
                                        <label htmlFor="lowStockCheckbox" style={{ color: filterLowStock ? colors.danger : colors.textMuted, fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>
                                            Low Stock
                                        </label>
                                    </div>
                                </>
                            )}

                            <Button secondary onClick={clearFilters} style={{ height: '42px', padding: '0 16px', background: '#f1f5f9', color: colors.textMain, border: `1px solid ${colors.border}` }}>
                                <FilterX size={18} /> Clear
                            </Button>
                        </SearchContainer>
                    </ControlsContainer>


                    {showForm && (
                        <ModalOverlay>
                            <ModalContainer style={{ maxWidth: '700px' }}>
                                <ModalHeader>
                                    <ModalTitle>{isEditing ? `Edit ${activeTab.label}` : `Add New ${activeTab.label}`}</ModalTitle>
                                    <CloseButton onClick={resetForm}><X size={20} /></CloseButton>
                                </ModalHeader>
                                <ModalBody>
                                    <form onSubmit={handleSubmit}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '10px' }}>
                                            {renderFormFields()}
                                        </div>
                                        <ButtonContainer style={{ marginTop: '30px', borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                                            <Button type="submit" style={{ padding: '10px 30px', fontSize: '0.95rem' }}>
                                                {isEditing ? 'Update Changes' : 'Save Record'}
                                            </Button>
                                            <Button secondary type="button" onClick={resetForm} style={{ padding: '10px 30px', fontSize: '0.95rem' }}>
                                                Cancel
                                            </Button>
                                        </ButtonContainer>
                                    </form>
                                </ModalBody>
                            </ModalContainer>
                        </ModalOverlay>
                    )}


                    {!showForm && (
                        <>
                            {loading ? <p>Loading data...</p> : (
                                <TableWrapper>
                                    <Table>
                                        <thead>
                                            <Tr>
                                                {/* <Th>ID</Th> */}
                                                <Th>Name</Th>
                                                {activeTab.id === 'item' && (
                                                    <>
                                                        <Th>HSN</Th>
                                                        <Th>Group</Th>
                                                        <Th>Category</Th>
                                                        <Th>Supplier</Th>
                                                        <Th>Manufacturer</Th>
                                                        <Th>Quantity</Th>
                                                        <Th>Reorder Level</Th>
                                                    </>
                                                )}
                                                {/* <Th>Created At</Th> */}
                                                <Th>Price History</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map(item => {
                                                const idField = getIdField();
                                                const nameField = getNameField();
                                                const availQty = Number(item.total_quantity || 0) - Number(item.approved_quantity || 0);
                                                const isLowStock = activeTab.id === 'item' && availQty <= Number(item.stockReorderLevel || 0);

                                                return (
                                                    <Tr key={item[idField]} style={isLowStock ? { backgroundColor: '#fff1f2' } : {}}>
                                                        <Td style={{ fontWeight: '500' }}>{item[nameField]}</Td>
                                                        {activeTab.id === 'item' && (
                                                            <>
                                                                <Td>{item.hsn || '-'}</Td>
                                                                <Td>{getGroupName(item.group)}</Td>
                                                                <Td>{getCategoryName(item.category)}</Td>
                                                                <Td>{getVendorName(item.supplier)}</Td>
                                                                <Td>{getVendorName(item.manufacturer)}</Td>
                                                                <Td style={{ fontWeight: '700', color: isLowStock ? colors.danger : colors.success }}>
                                                                    {availQty}
                                                                </Td>
                                                                <Td style={{ color: colors.textMuted }}>{item.stockReorderLevel}</Td>
                                                            </>
                                                        )}
                                                        <Td>
                                                            {activeTab.id === 'item' && (
                                                                <Button
                                                                    onClick={() => fetchPriceHistory(item, nameField, idField)}
                                                                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 10px', fontSize: '0.8rem' }}
                                                                    title="Price History"
                                                                >
                                                                    <LineChart size={16} style={{ marginRight: '4px' }} /> History
                                                                </Button>
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <Button
                                                                    onClick={() => handleEdit(item)}
                                                                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7', padding: '6px 10px' }}
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleDelete(item[idField])}
                                                                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '6px 10px' }}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </Td>
                                                    </Tr>
                                                );
                                            })}
                                            {filteredItems.length === 0 && (
                                                <Tr>
                                                    <Td colSpan={activeTab.id === 'item' ? "9" : "4"} style={{ textAlign: 'center', padding: '20px' }}>No records found</Td>
                                                </Tr>
                                            )}
                                        </tbody>
                                    </Table>
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

