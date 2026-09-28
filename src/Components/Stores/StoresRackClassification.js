import React, { useState, useEffect } from 'react';
import apiRequest from '../../Auth/apiRequest';
import * as XLSX from 'xlsx';
import ReactSelect from 'react-select';
import { 
    Grid, Barcode, Search, RefreshCw, Download, 
    Save, Edit, CheckCircle, Package, Layers, X, Plus, Trash2, Tag, Box
} from 'lucide-react';
import {
    PageWrapper,
    Container,
    ControlsContainer,
    Input,
    Select,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors
} from '../GlobalStyles';

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '38px',
        height: '38px',
        borderRadius: '8px',
        borderColor: state.isFocused ? '#0284c7' : '#c0dbff',
        boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
        fontSize: '0.85rem',
        backgroundColor: '#ffffff',
        '&:hover': {
            borderColor: '#0284c7'
        }
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: '38px',
        padding: '0 8px'
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px',
        fontSize: '0.85rem'
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '38px'
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        fontSize: '0.85rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#0284c7'
            : state.isFocused
            ? '#e0f2fe'
            : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#1e293b',
        cursor: 'pointer',
        fontSize: '0.85rem',
        padding: '8px 12px'
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#94a3b8',
        fontSize: '0.85rem'
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#1e293b',
        fontSize: '0.85rem'
    })
};

const StoresRackClassification = () => {
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [itemsList, setItemsList] = useState([]);
    const [racks, setRacks] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [rackMasters, setRackMasters] = useState([]);
    const [shelfMasters, setShelfMasters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRack, setSelectedRack] = useState('');
    const [selectedShelf, setSelectedShelf] = useState('');

    // Quick editing state
    const [editingItem, setEditingItem] = useState(null);
    const [editRack, setEditRack] = useState('');
    const [editShelf, setEditShelf] = useState('');
    const [editBin, setEditBin] = useState('');
    const [editBarcode, setEditBarcode] = useState('');

    // Master Management Modal state
    const [showMasterModal, setShowMasterModal] = useState(false);
    const [masterTab, setMasterTab] = useState('racks'); // 'racks' or 'shelves'
    const [newRackName, setNewRackName] = useState('');
    const [newRackDesc, setNewRackDesc] = useState('');
    const [newShelfName, setNewShelfName] = useState('');
    const [newShelfRackId, setNewShelfRackId] = useState('');
    const [newShelfDesc, setNewShelfDesc] = useState('');
    const [masterLoading, setMasterLoading] = useState(false);

    useEffect(() => {
        fetchItems();
        fetchMasters();
    }, [selectedRack, selectedShelf]);

    const fetchMasters = async () => {
        try {
            const [racksRes, shelvesRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/rack-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/shelf-master/`)
            ]);
            if (racksRes && racksRes.success) {
                setRackMasters(racksRes.data || []);
            }
            if (shelvesRes && shelvesRes.success) {
                setShelfMasters(shelvesRes.data || []);
            }
        } catch (err) {
            console.error("Error fetching rack/shelf masters:", err);
        }
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            let query = [];
            if (selectedRack) query.push(`rack_no=${encodeURIComponent(selectedRack)}`);
            if (selectedShelf) query.push(`shelf_no=${encodeURIComponent(selectedShelf)}`);
            if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);

            const queryString = query.length > 0 ? `?${query.join('&')}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-rack-classification/${queryString}`);
            if (res && res.success) {
                setItemsList(res.data.data || []);
                setRacks(res.data.racks || []);
                setShelves(res.data.shelves || []);
                if (res.data.rack_masters) setRackMasters(res.data.rack_masters);
                if (res.data.shelf_masters) setShelfMasters(res.data.shelf_masters);
            } else {
                setItemsList([]);
            }
        } catch (err) {
            console.error("Error fetching items for rack classification:", err);
            setItemsList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setEditRack(item.rack_no || '');
        setEditShelf(item.shelf_no || '');
        setEditBin(item.bin_no || '');
        setEditBarcode(item.barcode || item.item_id || '');
    };

    const handleSaveRackDetails = async (e) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            setLoading(true);
            const payload = {
                item_id: editingItem.item_id,
                rack_no: editRack,
                shelf_no: editShelf,
                bin_no: editBin,
                barcode: editBarcode
            };

            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-rack-classification/`, 'POST', payload);
            if (res && res.success) {
                setItemsList(prev => prev.map(item => {
                    if (item.item_id === editingItem.item_id) {
                        return {
                            ...item,
                            rack_no: editRack,
                            shelf_no: editShelf,
                            bin_no: editBin,
                            barcode: editBarcode
                        };
                    }
                    return item;
                }));
                setEditingItem(null);
                fetchItems();
            } else {
                alert(res.error || "Failed to update item location.");
            }
        } catch (err) {
            console.error("Error updating location:", err);
            alert("Error updating location.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRack = async (e) => {
        e.preventDefault();
        if (!newRackName.trim()) return;
        try {
            setMasterLoading(true);
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/rack-master/`, 'POST', {
                rack_name: newRackName.trim(),
                description: newRackDesc.trim()
            });
            if (res && res.success) {
                setNewRackName('');
                setNewRackDesc('');
                await fetchMasters();
                await fetchItems();
            } else {
                alert(res.error || "Failed to create Rack");
            }
        } catch (err) {
            console.error("Error creating rack:", err);
            alert("Failed to create rack.");
        } finally {
            setMasterLoading(false);
        }
    };

    const handleDeleteRack = async (rackId) => {
        if (!window.confirm("Are you sure you want to delete this rack?")) return;
        try {
            setMasterLoading(true);
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/rack-master/${rackId}/`, 'DELETE');
            if (res && res.success) {
                await fetchMasters();
                await fetchItems();
            } else {
                alert(res.error || "Failed to delete rack");
            }
        } catch (err) {
            console.error("Error deleting rack:", err);
            alert("Failed to delete rack.");
        } finally {
            setMasterLoading(false);
        }
    };

    const handleCreateShelf = async (e) => {
        e.preventDefault();
        if (!newShelfName.trim()) return;
        try {
            setMasterLoading(true);
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/shelf-master/`, 'POST', {
                shelf_name: newShelfName.trim(),
                rack_id: newShelfRackId || '',
                description: newShelfDesc.trim()
            });
            if (res && res.success) {
                setNewShelfName('');
                setNewShelfRackId('');
                setNewShelfDesc('');
                await fetchMasters();
                await fetchItems();
            } else {
                alert(res.error || "Failed to create Shelf");
            }
        } catch (err) {
            console.error("Error creating shelf:", err);
            alert("Failed to create shelf.");
        } finally {
            setMasterLoading(false);
        }
    };

    const handleDeleteShelf = async (shelfId) => {
        if (!window.confirm("Are you sure you want to delete this shelf?")) return;
        try {
            setMasterLoading(true);
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/shelf-master/${shelfId}/`, 'DELETE');
            if (res && res.success) {
                await fetchMasters();
                await fetchItems();
            } else {
                alert(res.error || "Failed to delete shelf");
            }
        } catch (err) {
            console.error("Error deleting shelf:", err);
            alert("Failed to delete shelf.");
        } finally {
            setMasterLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!itemsList || itemsList.length === 0) return;
        const excelData = itemsList.map(item => ({
            'Item ID': item.item_id,
            'Item Name': item.itemName,
            'Department': item.department,
            'Group': item.group,
            'Category': item.category,
            'Rack No': item.rack_no || 'Unassigned',
            'Shelf No': item.shelf_no || 'Unassigned',
            'Bin No': item.bin_no || 'Unassigned',
            'Barcode': item.barcode || item.item_id,
            'Current Stock': item.total_quantity
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "RackClassification");
        XLSX.writeFile(wb, `Stores_Rack_Classification.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#0284c7', fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Grid size={28} color="#0284c7" /> Barcode Entry & Rack Classification
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>
                            Warehouse spatial management: Manage Racks, Shelves, Bins, and assign Barcodes to items.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button 
                            onClick={() => setShowMasterModal(true)}
                            style={{ background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(2,132,199,0.2)' }}
                        >
                            <Box size={16} /> Manage Racks & Shelves
                        </Button>
                        <Button 
                            onClick={exportToExcel}
                            style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Filter Rack</label>
                        <ReactSelect
                            options={[
                                { value: '', label: 'All Racks' },
                                ...racks.map(r => ({ value: r, label: `Rack ${r}` }))
                            ]}
                            value={[
                                { value: '', label: 'All Racks' },
                                ...racks.map(r => ({ value: r, label: `Rack ${r}` }))
                            ].find(opt => opt.value === selectedRack) || { value: '', label: 'All Racks' }}
                            onChange={opt => setSelectedRack(opt ? opt.value : '')}
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                            isSearchable
                            placeholder="Search Rack..."
                        />
                    </div>
                    <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Filter Shelf</label>
                        <ReactSelect
                            options={[
                                { value: '', label: 'All Shelves' },
                                ...shelves.map(s => ({ value: s, label: `Shelf ${s}` }))
                            ]}
                            value={[
                                { value: '', label: 'All Shelves' },
                                ...shelves.map(s => ({ value: s, label: `Shelf ${s}` }))
                            ].find(opt => opt.value === selectedShelf) || { value: '', label: 'All Shelves' }}
                            onChange={opt => setSelectedShelf(opt ? opt.value : '')}
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                            isSearchable
                            placeholder="Search Shelf..."
                        />
                    </div>
                    <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Scan / Search Barcode or Item</label>
                        <Input 
                            type="text" 
                            placeholder="Scan Barcode, Item Name, Rack..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                        <Button onClick={fetchItems} style={{ background: '#0284c7', color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                            <Search size={16} /> Search
                        </Button>
                        <Button onClick={() => { setSelectedRack(''); setSelectedShelf(''); setSearchTerm(''); }} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 14px', borderRadius: '8px', border: 'none' }}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>
                </ControlsContainer>

                {/* Table */}
                <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Item Details</Th>
                                <Th>Barcode / SKU</Th>
                                <Th>Group / Category</Th>
                                <Th style={{ textAlign: 'center' }}>Rack No</Th>
                                <Th style={{ textAlign: 'center' }}>Shelf No</Th>
                                <Th style={{ textAlign: 'center' }}>Bin No</Th>
                                <Th style={{ textAlign: 'right' }}>Current Stock</Th>
                                <Th style={{ textAlign: 'center' }}>Actions</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                                        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#0284c7' }} />
                                        <p style={{ marginTop: '8px', color: colors.textMuted }}>Loading rack catalog...</p>
                                    </Td>
                                </Tr>
                            ) : itemsList.length === 0 ? (
                                <Tr>
                                    <Td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                                        No items found matching the selected rack/shelf filter.
                                    </Td>
                                </Tr>
                            ) : (
                                itemsList.map((item, idx) => (
                                    <Tr key={item.item_id}>
                                        <Td>{idx + 1}</Td>
                                        <Td>
                                            <div style={{ fontWeight: '700', color: colors.textMain }}>{item.itemName}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>ID: {item.item_id}</div>
                                        </Td>
                                        <Td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontWeight: '700', color: colors.primary }}>
                                                <Barcode size={16} /> {item.barcode || item.item_id}
                                            </div>
                                        </Td>
                                        <Td>
                                            <div>{item.group || '-'}</div>
                                            <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{item.category || ''}</div>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', background: item.rack_no ? '#eff6ff' : '#f1f5f9', color: item.rack_no ? '#2563eb' : colors.textMuted }}>
                                                {item.rack_no || 'Unassigned'}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', background: item.shelf_no ? '#f5f3ff' : '#f1f5f9', color: item.shelf_no ? '#7c3aed' : colors.textMuted }}>
                                                {item.shelf_no || 'Unassigned'}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', background: item.bin_no ? '#ecfdf5' : '#f1f5f9', color: item.bin_no ? '#059669' : colors.textMuted }}>
                                                {item.bin_no || '-'}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: '800', color: item.total_quantity > 0 ? '#059669' : '#dc2626' }}>
                                            {item.total_quantity}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <Button
                                                onClick={() => handleOpenEdit(item)}
                                                style={{ padding: '6px 12px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #0284c7', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                            >
                                                <Edit size={14} /> Assign Location
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>

                {/* Edit Location Modal */}
                {editingItem && (
                    <ModalOverlay style={{ zIndex: 1050 }}>
                        <ModalContainer style={{ maxWidth: '550px', width: '90vw' }}>
                            <ModalHeader style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
                                <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7' }}>
                                    <Grid size={20} color="#0284c7" /> Assign Rack, Shelf & Barcode
                                </ModalTitle>
                                <CloseButton onClick={() => setEditingItem(null)}><X size={20} /></CloseButton>
                            </ModalHeader>

                            <ModalBody style={{ padding: '20px' }}>
                                <form onSubmit={handleSaveRackDetails}>
                                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
                                        <div style={{ fontSize: '0.8rem', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Item Details</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: colors.textMain, marginTop: '2px' }}>{editingItem.itemName}</div>
                                        <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginTop: '2px' }}>
                                            ID: <strong style={{ color: colors.primary }}>{editingItem.item_id}</strong> &nbsp;|&nbsp; 
                                            Stock: <strong style={{ color: editingItem.total_quantity > 0 ? '#059669' : '#dc2626' }}>{editingItem.total_quantity}</strong>
                                        </div>
                                    </div>

                                    <datalist id="existing-racks">
                                        {rackMasters.map((r, i) => (
                                            <option key={i} value={r.rack_name}>{r.rack_id ? `[${r.rack_id}] ${r.rack_name}` : r.rack_name}</option>
                                        ))}
                                        {racks.filter(r => !rackMasters.some(rm => rm.rack_name === r)).map((r, i) => (
                                            <option key={`extra-r-${i}`} value={r} />
                                        ))}
                                    </datalist>

                                    <datalist id="existing-shelves">
                                        {shelfMasters.map((s, i) => (
                                            <option key={i} value={s.shelf_name}>{s.shelf_id ? `[${s.shelf_id}] ${s.shelf_name}` : s.shelf_name}</option>
                                        ))}
                                        {shelves.filter(s => !shelfMasters.some(sm => sm.shelf_name === s)).map((s, i) => (
                                            <option key={`extra-s-${i}`} value={s} />
                                        ))}
                                    </datalist>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0, color: colors.textMain }}>
                                                    Rack Number <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowMasterModal(true); setMasterTab('racks'); }}
                                                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                                                >
                                                    + Add Rack
                                                </button>
                                            </div>
                                            <Input 
                                                type="text" 
                                                list="existing-racks"
                                                placeholder="e.g. Rack A, Rack B" 
                                                value={editRack} 
                                                onChange={e => setEditRack(e.target.value)} 
                                                style={{ width: '100%' }}
                                                required
                                            />
                                            <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>Pick registered rack or type new</span>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0, color: colors.textMain }}>
                                                    Shelf Number <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowMasterModal(true); setMasterTab('shelves'); }}
                                                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                                                >
                                                    + Add Shelf
                                                </button>
                                            </div>
                                            <Input 
                                                type="text" 
                                                list="existing-shelves"
                                                placeholder="e.g. Shelf 1, Shelf 2" 
                                                value={editShelf} 
                                                onChange={e => setEditShelf(e.target.value)} 
                                                style={{ width: '100%' }}
                                                required
                                            />
                                            <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>Pick registered shelf or type new</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '4px', color: colors.textMain }}>
                                                Bin / Compartment
                                            </label>
                                            <Input 
                                                type="text" 
                                                placeholder="e.g. BIN-01, B-02" 
                                                value={editBin} 
                                                onChange={e => setEditBin(e.target.value)} 
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0, color: colors.textMain }}>
                                                    Barcode / SKU
                                                </label>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const randomNum = Math.floor(1000000 + Math.random() * 9000000);
                                                        setEditBarcode(`890${randomNum}`);
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                                                >
                                                    + Auto Generate
                                                </button>
                                            </div>
                                            <Input 
                                                type="text" 
                                                placeholder="Scan or enter barcode" 
                                                value={editBarcode} 
                                                onChange={e => setEditBarcode(e.target.value)} 
                                                style={{ width: '100%', fontFamily: 'monospace' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: `1px solid ${colors.border}` }}>
                                        <Button type="button" onClick={() => setEditingItem(null)} style={{ background: '#e2e8f0', color: colors.textMain, padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading} style={{ background: '#0284c7', color: '#fff', padding: '9px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Save size={16} /> {loading ? 'Saving...' : 'Save Location & Barcode'}
                                        </Button>
                                    </div>
                                </form>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}

                {/* Master Racks & Shelves Modal */}
                {showMasterModal && (
                    <ModalOverlay style={{ zIndex: 1100 }}>
                        <ModalContainer style={{ maxWidth: '750px', width: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
                            <ModalHeader style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
                                <ModalTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7' }}>
                                    <Box size={22} color="#0284c7" /> Manage Racks & Shelves Master
                                </ModalTitle>
                                <CloseButton onClick={() => setShowMasterModal(false)}><X size={20} /></CloseButton>
                            </ModalHeader>

                            {/* Tab Switcher */}
                            <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, background: '#f8fafc', padding: '0 20px' }}>
                                <button
                                    onClick={() => setMasterTab('racks')}
                                    style={{
                                        padding: '12px 20px',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: masterTab === 'racks' ? '3px solid #0284c7' : '3px solid transparent',
                                        color: masterTab === 'racks' ? '#0284c7' : colors.textMuted,
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Layers size={16} /> Racks Master ({rackMasters.length})
                                </button>
                                <button
                                    onClick={() => setMasterTab('shelves')}
                                    style={{
                                        padding: '12px 20px',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: masterTab === 'shelves' ? '3px solid #0284c7' : '3px solid transparent',
                                        color: masterTab === 'shelves' ? '#0284c7' : colors.textMuted,
                                        fontWeight: '700',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Package size={16} /> Shelves Master ({shelfMasters.length})
                                </button>
                            </div>

                            <ModalBody style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                                {masterTab === 'racks' ? (
                                    <div>
                                        {/* Add Rack Form */}
                                        <form onSubmit={handleCreateRack} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: colors.textMain, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Plus size={16} color="#0284c7" /> Add New Rack
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Rack Name *</label>
                                                    <Input 
                                                        type="text" 
                                                        placeholder="e.g. Rack A, Rack F" 
                                                        value={newRackName} 
                                                        onChange={e => setNewRackName(e.target.value)} 
                                                        required 
                                                        style={{ width: '100%', background: '#fff' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Description / Location</label>
                                                    <Input 
                                                        type="text" 
                                                        placeholder="e.g. Aisle 1, Ground Floor" 
                                                        value={newRackDesc} 
                                                        onChange={e => setNewRackDesc(e.target.value)} 
                                                        style={{ width: '100%', background: '#fff' }}
                                                    />
                                                </div>
                                                <Button 
                                                    type="submit" 
                                                    disabled={masterLoading}
                                                    style={{ background: '#0284c7', color: '#fff', padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Save size={14} /> {masterLoading ? 'Saving...' : 'Add Rack'}
                                                </Button>
                                            </div>
                                        </form>

                                        {/* Racks List Table */}
                                        <TableWrapper style={{ border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                                            <Table>
                                                <thead>
                                                    <Tr>
                                                        <Th>Rack ID</Th>
                                                        <Th>Rack Name</Th>
                                                        <Th>Description</Th>
                                                        <Th style={{ textAlign: 'center' }}>Action</Th>
                                                    </Tr>
                                                </thead>
                                                <tbody>
                                                    {rackMasters.length === 0 ? (
                                                        <Tr>
                                                            <Td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>
                                                                No racks registered yet. Use the form above to add one.
                                                            </Td>
                                                        </Tr>
                                                    ) : (
                                                        rackMasters.map(r => (
                                                            <Tr key={r.rack_id}>
                                                                <Td style={{ fontWeight: '700', fontFamily: 'monospace', color: colors.primary }}>{r.rack_id}</Td>
                                                                <Td style={{ fontWeight: '700', color: colors.textMain }}>{r.rack_name}</Td>
                                                                <Td style={{ color: colors.textMuted }}>{r.description || '-'}</Td>
                                                                <Td style={{ textAlign: 'center' }}>
                                                                    <Button
                                                                        onClick={() => handleDeleteRack(r.rack_id)}
                                                                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </Button>
                                                                </Td>
                                                            </Tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </Table>
                                        </TableWrapper>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Add Shelf Form */}
                                        <form onSubmit={handleCreateShelf} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: colors.textMain, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Plus size={16} color="#0284c7" /> Add New Shelf
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Shelf Name *</label>
                                                    <Input 
                                                        type="text" 
                                                        placeholder="e.g. Shelf 1, Shelf 5" 
                                                        value={newShelfName} 
                                                        onChange={e => setNewShelfName(e.target.value)} 
                                                        required 
                                                        style={{ width: '100%', background: '#fff' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Belongs to Rack</label>
                                                    <Select
                                                        value={newShelfRackId}
                                                        onChange={e => setNewShelfRackId(e.target.value)}
                                                        style={{ width: '100%', background: '#fff' }}
                                                    >
                                                        <option value="">-- Any / Global Rack --</option>
                                                        {rackMasters.map(r => (
                                                            <option key={r.rack_id} value={r.rack_id}>[{r.rack_id}] {r.rack_name}</option>
                                                        ))}
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Description</label>
                                                    <Input 
                                                        type="text" 
                                                        placeholder="e.g. Top Layer" 
                                                        value={newShelfDesc} 
                                                        onChange={e => setNewShelfDesc(e.target.value)} 
                                                        style={{ width: '100%', background: '#fff' }}
                                                    />
                                                </div>
                                                <Button 
                                                    type="submit" 
                                                    disabled={masterLoading}
                                                    style={{ background: '#0284c7', color: '#fff', padding: '9px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Save size={14} /> {masterLoading ? 'Saving...' : 'Add Shelf'}
                                                </Button>
                                            </div>
                                        </form>

                                        {/* Shelves List Table */}
                                        <TableWrapper style={{ border: `1px solid ${colors.border}`, borderRadius: '8px' }}>
                                            <Table>
                                                <thead>
                                                    <Tr>
                                                        <Th>Shelf ID</Th>
                                                        <Th>Shelf Name</Th>
                                                        <Th>Rack ID / Rack Name</Th>
                                                        <Th>Description</Th>
                                                        <Th style={{ textAlign: 'center' }}>Action</Th>
                                                    </Tr>
                                                </thead>
                                                <tbody>
                                                    {shelfMasters.length === 0 ? (
                                                        <Tr>
                                                            <Td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: colors.textMuted }}>
                                                                No shelves registered yet. Use the form above to add one.
                                                            </Td>
                                                        </Tr>
                                                    ) : (
                                                        shelfMasters.map(s => {
                                                            const rackObj = rackMasters.find(r => r.rack_id === s.rack_id);
                                                            return (
                                                                <Tr key={s.shelf_id}>
                                                                    <Td style={{ fontWeight: '700', fontFamily: 'monospace', color: colors.primary }}>{s.shelf_id}</Td>
                                                                    <Td style={{ fontWeight: '700', color: colors.textMain }}>{s.shelf_name}</Td>
                                                                    <Td>
                                                                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', fontWeight: '600', fontSize: '0.8rem' }}>
                                                                            {rackObj ? `${rackObj.rack_name} (${s.rack_id})` : (s.rack_id || 'Global')}
                                                                        </span>
                                                                    </Td>
                                                                    <Td style={{ color: colors.textMuted }}>{s.description || '-'}</Td>
                                                                    <Td style={{ textAlign: 'center' }}>
                                                                        <Button
                                                                            onClick={() => handleDeleteShelf(s.shelf_id)}
                                                                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </Button>
                                                                    </Td>
                                                                </Tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </Table>
                                        </TableWrapper>
                                    </div>
                                )}
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                )}
            </Container>
        </PageWrapper>
    );
};

export default StoresRackClassification;
