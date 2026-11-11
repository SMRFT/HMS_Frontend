import React, { useState, useEffect, useMemo } from 'react';
import apiRequest from '../../Auth/apiRequest';
import { getSelectedStoreDepartment, setSelectedStoreDepartment, useStoresDepartment } from '../Stores/storesDepartmentHelper';
import DepartmentSelectionModal, { DepartmentFilterControl } from '../Stores/DepartmentSelectionModal';
import * as XLSX from 'xlsx';
import TablePagination, { usePagination } from '../Stores/TablePagination';
import { printStoresReport } from '../Stores/printStoresReport';
import {
    Grid,
    Search,
    Printer,
    Download,
    RefreshCw,
    Building2,
    CheckCircle,
    Clock,
    Layers,
    FileSpreadsheet,
    MapPin,
    Package
} from 'lucide-react';
import {
    PageWrapper,
    Container,
    ControlsContainer,
    Input,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    colors
} from '../GlobalStyles';

const StoresRackClassificationReport = () => {
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    // Data states
    const [itemsList, setItemsList] = useState([]);
    const [racks, setRacks] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRack, setSelectedRack] = useState('');
    const [selectedShelf, setSelectedShelf] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ASSIGNED | UNASSIGNED
    const [filterDepartment, setFilterDepartment] = useState('');

    // Synchronize with active global department
    const activeGlobalDept = useStoresDepartment();
    useEffect(() => {
        if (activeGlobalDept && activeGlobalDept !== 'ALL') {
            setFilterDepartment(activeGlobalDept);
        }
    }, [activeGlobalDept]);

    useEffect(() => {
        fetchMasters();
    }, []);

    useEffect(() => {
        fetchItems();
    }, [filterDepartment]);

    const fetchMasters = async () => {
        try {
            const [racksRes, shelvesRes, deptRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/rack-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/shelf-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`)
            ]);
            if (racksRes && racksRes.success) setRacks(racksRes.data || []);
            if (shelvesRes && shelvesRes.success) setShelves(shelvesRes.data || []);
            if (deptRes && deptRes.success) setAllDepartments(deptRes.data || []);
        } catch (err) {
            console.error("Error fetching master options:", err);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            let query = [];
            if (filterDepartment && filterDepartment !== 'ALL') query.push(`department=${encodeURIComponent(filterDepartment)}`);
            const queryString = query.length > 0 ? `?${query.join('&')}` : '';

            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/stores-rack-classification/${queryString}`);
            if (res && res.success) {
                setItemsList(res.data.data || []);
                if (res.data.racks) setRacks(res.data.racks);
                if (res.data.shelves) setShelves(res.data.shelves);
            } else {
                setItemsList([]);
            }
        } catch (err) {
            console.error("Error fetching rack items:", err);
            setItemsList([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter Items
    const filteredItems = useMemo(() => {
        return itemsList.filter(item => {
            const matchesSearch = !searchTerm || (
                (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.item_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.barcode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.rack_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.shelf_no || '').toLowerCase().includes(searchTerm.toLowerCase())
            );

            const matchesRack = !selectedRack || item.rack_no === selectedRack;
            const matchesShelf = !selectedShelf || item.shelf_no === selectedShelf;

            let matchesStatus = true;
            if (statusFilter === 'ASSIGNED') matchesStatus = Boolean(item.rack_no);
            else if (statusFilter === 'UNASSIGNED') matchesStatus = !item.rack_no;

            return matchesSearch && matchesRack && matchesShelf && matchesStatus;
        });
    }, [itemsList, searchTerm, selectedRack, selectedShelf, statusFilter]);

    // KPI Metrics
    const totalCount = itemsList.length;
    const assignedCount = itemsList.filter(i => Boolean(i.rack_no)).length;
    const unassignedCount = totalCount - assignedCount;
    const uniqueLocations = new Set(itemsList.filter(i => i.rack_no).map(i => `${i.rack_no}-${i.shelf_no || ''}`)).size;

    // Pagination
    const pagination = usePagination(filteredItems.length, 25);
    const paginatedItems = useMemo(() => {
        return filteredItems.slice(pagination.startIndex, pagination.endIndex);
    }, [filteredItems, pagination.startIndex, pagination.endIndex]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedRack('');
        setSelectedShelf('');
        setStatusFilter('ALL');
        setFilterDepartment('');
        setSelectedStoreDepartment('');
        setTimeout(fetchItems, 50);
    };

    const handlePrint = () => {
        printStoresReport('stores-rack-classification-table-wrapper', {
            reportTitle: 'Barcode Entry & Rack Classification Report',
            department: filterDepartment || 'ALL DEPARTMENTS',
            summary: {
                "TOTAL CATALOG ITEMS": totalCount,
                "ASSIGNED TO RACKS": assignedCount,
                "UNASSIGNED (PENDING)": unassignedCount,
                "TOTAL PHYSICAL LOCATIONS": uniqueLocations
            }
        });
    };

    const handleExportExcel = () => {
        if (!filteredItems.length) return;
        const excelData = filteredItems.map((item, idx) => ({
            "Sl No": idx + 1,
            "Item ID": item.item_id || '-',
            "Item Name": item.name || '-',
            "Group / Category": item.category || item.group || '-',
            "Department": item.department || '-',
            "Rack Number": item.rack_no || 'Unassigned',
            "Bero / Shelf Number": item.shelf_no || 'Unassigned',
            "Barcode": item.barcode || item.item_id || '-',
            "Current Stock": item.stock || 0,
            "Allocation Status": item.rack_no ? 'Assigned' : 'Unassigned'
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rack Classification");
        XLSX.writeFile(wb, `Stores_Rack_Classification_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <PageWrapper style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <Container style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Grid size={24} color="#0284c7" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.textMain, margin: 0 }}>
                                Barcode Entry & Rack Classification Report
                            </h1>
                            <p style={{ fontSize: '0.82rem', color: colors.textMuted, margin: '2px 0 0' }}>
                                Warehouse spatial inventory mapping, storage racks, shelves/bero, and barcode allocations.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button
                            onClick={handleExportExcel}
                            style={{ background: '#ffffff', color: '#0284c7', border: '1px solid #0284c7', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: '600' }}
                        >
                            <Download size={16} /> Export Excel
                        </Button>
                        <Button
                            onClick={handlePrint}
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: '600' }}
                        >
                            <Printer size={16} /> Print Report
                        </Button>
                    </div>
                </div>

                {/* Summary Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div 
                        onClick={() => setStatusFilter('ALL')}
                        style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${statusFilter === 'ALL' ? '#0284c7' : colors.border}`, cursor: 'pointer' }}
                    >
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>TOTAL CATALOG ITEMS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.textMain, marginTop: '2px' }}>{totalCount}</div>
                    </div>
                    <div 
                        onClick={() => setStatusFilter('ASSIGNED')}
                        style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${statusFilter === 'ASSIGNED' ? '#059669' : colors.border}`, cursor: 'pointer' }}
                    >
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>ASSIGNED TO RACKS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>{assignedCount}</div>
                    </div>
                    <div 
                        onClick={() => setStatusFilter('UNASSIGNED')}
                        style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${statusFilter === 'UNASSIGNED' ? '#b91c1c' : colors.border}`, cursor: 'pointer' }}
                    >
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>UNASSIGNED (PENDING)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b91c1c', marginTop: '2px' }}>{unassignedCount}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: '700' }}>TOTAL PHYSICAL LOCATIONS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>{uniqueLocations}</div>
                    </div>
                </div>

                {/* Filter Controls Bar (Ordered Left to Right: Department -> Filter Rack -> Filter Bero -> Scan/Search Barcode) */}
                <ControlsContainer style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
                        {/* 1. Department */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>SWITCH DEPARTMENT</label>
                            <DepartmentFilterControl
                                departments={allDepartments}
                                onDepartmentChange={(dept) => {
                                    setFilterDepartment(dept || '');
                                    setSelectedStoreDepartment(dept || '');
                                }}
                            />
                        </div>

                        {/* 2. Filter Rack */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>FILTER RACK</label>
                            <select
                                value={selectedRack}
                                onChange={(e) => setSelectedRack(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '0.85rem', background: '#ffffff' }}
                            >
                                <option value="">All Racks</option>
                                {racks.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Filter Bero */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>FILTER BERO</label>
                            <select
                                value={selectedShelf}
                                onChange={(e) => setSelectedShelf(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '0.85rem', background: '#ffffff' }}
                            >
                                <option value="">All Bero</option>
                                {shelves.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Scan / Search Barcode or Item */}
                        <div style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.textMuted }}>SCAN / SEARCH BARCODE OR ITEM</label>
                            <Input
                                type="text"
                                placeholder="Scan Barcode, Item Name, Rack..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '7px 12px', borderRadius: '6px', border: `1px solid ${colors.border}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                                onClick={fetchItems}
                                style={{ background: '#0284c7', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: '600' }}
                            >
                                <Search size={15} /> Search
                            </Button>
                            <Button
                                onClick={handleClearFilters}
                                style={{ background: '#e2e8f0', color: colors.textMain, padding: '8px 12px', borderRadius: '6px', border: 'none' }}
                                title="Reset Filters"
                            >
                                <RefreshCw size={15} />
                            </Button>
                        </div>
                    </div>
                </ControlsContainer>

                {/* Table */}
                <div id="stores-rack-classification-table-wrapper">
                    <TableWrapper style={{ background: '#ffffff', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                        <Table>
                            <thead>
                                <Tr style={{ background: '#f8fafc' }}>
                                    <Th style={{ width: '45px' }}>#</Th>
                                    <Th>ITEM DETAILS</Th>
                                    <Th>GROUP / CATEGORY</Th>
                                    <Th style={{ textAlign: 'center' }}>RACK NO</Th>
                                    <Th style={{ textAlign: 'center' }}>BERO NO</Th>
                                    <Th style={{ textAlign: 'right' }}>CURRENT STOCK</Th>
                                    <Th style={{ textAlign: 'center' }}>STATUS</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <Tr><Td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Loading rack catalog...</Td></Tr>
                                ) : paginatedItems.length === 0 ? (
                                    <Tr><Td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>No items match your filter criteria.</Td></Tr>
                                ) : (
                                    paginatedItems.map((item, idx) => (
                                        <Tr key={item.item_id || idx}>
                                            <Td style={{ width: '45px' }}>{pagination.startIndex + idx + 1}</Td>
                                            <Td>
                                                <div style={{ fontWeight: '700', color: colors.textMain }}>{item.name}</div>
                                            </Td>
                                            <Td>
                                                <div style={{ fontWeight: '600', color: colors.textMain }}>{item.group_name || item.group || '-'}</div>
                                                {(item.category_name || item.category) && (item.category_name || item.category) !== (item.group_name || item.group) && (
                                                    <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{item.category_name || item.category}</div>
                                                )}
                                            </Td>
                                            <Td style={{ textAlign: 'center' }}>
                                                {item.rack_no ? (
                                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#e0f2fe', color: '#0284c7', fontWeight: '700', fontSize: '0.82rem' }}>
                                                        {item.rack_no}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>Unassigned</span>
                                                )}
                                            </Td>
                                            <Td style={{ textAlign: 'center' }}>
                                                {item.shelf_no ? (
                                                    <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#f1f5f9', color: '#334155', fontWeight: '700', fontSize: '0.82rem' }}>
                                                        {item.shelf_no}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>Unassigned</span>
                                                )}
                                            </Td>
                                            <Td style={{ textAlign: 'right', fontWeight: '800', color: (item.stock || 0) > 0 ? '#059669' : '#dc2626' }}>
                                                {item.stock !== undefined ? item.stock : 0}
                                            </Td>
                                            <Td style={{ textAlign: 'center' }}>
                                                {item.rack_no ? (
                                                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: '700' }}>
                                                        Assigned
                                                    </span>
                                                ) : (
                                                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: '700' }}>
                                                        Unassigned
                                                    </span>
                                                )}
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </div>

                {/* Pagination */}
                <div style={{ marginTop: '16px' }}>
                    <TablePagination {...pagination} />
                </div>
            </Container>
        </PageWrapper>
    );
};

export default StoresRackClassificationReport;

