import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { Search, Download, Printer, RefreshCw, FilterX, AlertTriangle, ShieldCheck, DollarSign, Layers, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

// Print Specific Styles
const PrintGlobalStyles = createGlobalStyle`
    @media print {
        @page {
            size: A4 landscape;
            margin: 10mm;
        }

        body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* Hide UI components not needed on paper */
        .no-print, header, nav, .sidebar {
            display: none !important;
        }

        /* Expand Containers */
        #printable-report-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
        }

        #printable-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .printable-card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin-bottom: 12px !important;
        }

        /* Full Table Unroll for Print */
        .printable-table-wrapper {
            max-height: none !important;
            overflow: visible !important;
            border: 1px solid #000000 !important;
            border-radius: 0 !important;
        }

        .printable-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 9pt !important;
        }

        .printable-table th {
            position: static !important;
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            border: 1px solid #000000 !important;
            padding: 6px 8px !important;
            font-weight: bold !important;
            text-align: left !important;
        }

        .printable-table td {
            border: 1px solid #000000 !important;
            padding: 5px 8px !important;
            color: #000000 !important;
            background-color: transparent !important;
        }

        .printable-table tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
        }
    }
`;

const PageWrapper = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    font-family: 'Inter', 'Segoe UI', sans-serif;
    padding-bottom: 40px;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Header = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: #ffffff;
    padding: 24px 40px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`;

const HeaderTitleGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #ffffff;
`;

const Subtitle = styled.p`
    margin: 4px 0 0 0;
    font-size: 0.85rem;
    color: #94a3b8;
`;

const Container = styled.div`
    max-width: 1400px;
    margin: -20px auto 0 auto;
    padding: 0 24px;
`;

const Card = styled.div`
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 24px;
`;

const KpiGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
`;

const KpiCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid ${props => props.borderColor || '#e2e8f0'};
    padding: 16px 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    }
`;

const KpiLabel = styled.div`
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    color: ${props => props.color || '#64748b'};
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const KpiValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.color || '#0f172a'};
    margin: 8px 0 4px 0;
`;

const KpiSubtext = styled.div`
    font-size: 0.78rem;
    color: #64748b;
`;

const MatrixContainer = styled(Card)`
    background: #ffffff;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const MatrixGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const MatrixCell = styled.div`
    border-radius: 10px;
    padding: 14px;
    cursor: pointer;
    border: 2px solid ${props => props.isSelected ? '#2563eb' : props.borderColor || '#e2e8f0'};
    background: ${props => props.isSelected ? '#eff6ff' : props.bgColor || '#f8fafc'};
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
    }
`;

const MatrixCellCode = styled.span`
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 800;
    color: #ffffff;
    background: ${props => props.badgeColor || '#475569'};
    margin-bottom: 6px;
`;

const MatrixCellTitle = styled.div`
    font-size: 0.85rem;
    font-weight: 700;
    color: #1e293b;
`;

const MatrixCellStrategy = styled.div`
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 4px;
`;

const MatrixCellStats = styled.div`
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 1px dashed rgba(0, 0, 0, 0.1);
    padding-top: 8px;
`;

const MatrixStatCount = styled.span`
    font-size: 1.1rem;
    font-weight: 800;
    color: #0f172a;
`;

const MatrixStatValue = styled.span`
    font-size: 0.8rem;
    font-weight: 600;
    color: #2563eb;
`;

const ControlsBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const SearchInputWrapper = styled.div`
    position: relative;
    flex: 1;
    min-width: 250px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 9px 12px 9px 36px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.88rem;
    outline: none;
    box-sizing: border-box;

    &:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
`;

const Select = styled.select`
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.85rem;
    outline: none;
    background: #ffffff;
    cursor: pointer;

    &:focus {
        border-color: #2563eb;
    }
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    border-radius: 8px;
    border: 1px solid ${props => props.borderColor || 'transparent'};
    background: ${props => props.bgColor || '#2563eb'};
    color: ${props => props.textColor || '#ffffff'};
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        opacity: 0.9;
    }
`;

// Scrollable Table Container with sticky header
const TableWrapper = styled.div`
    overflow-x: auto;
    overflow-y: auto;
    max-height: 520px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    &::-webkit-scrollbar-track {
        background: #f1f5f9;
    }
    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    text-align: left;
`;

const Th = styled.th`
    background: #f1f5f9;
    color: #334155;
    font-weight: 700;
    padding: 12px 14px;
    border-bottom: 2px solid #cbd5e1;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const Td = styled.td`
    padding: 12px 14px;
    border-bottom: 1px solid #e2e8f0;
    color: #1e293b;
    white-space: nowrap;
`;

const Tr = styled.tr`
    &:hover {
        background-color: #f8fafc;
    }
`;

const Badge = styled.span`
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
    color: ${props => props.color || '#1e293b'};
    background: ${props => props.bg || '#f1f5f9'};
    border: 1px solid ${props => props.borderColor || 'transparent'};
`;

// Pagination Controls Styled Components
const PaginationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
`;

const PaginationInfo = styled.div`
    font-size: 0.85rem;
    color: #64748b;
`;

const PaginationGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

const PageButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border-radius: 6px;
    border: 1px solid ${props => props.active ? '#2563eb' : '#cbd5e1'};
    background: ${props => props.active ? '#2563eb' : '#ffffff'};
    color: ${props => props.active ? '#ffffff' : '#334155'};
    font-size: 0.85rem;
    font-weight: ${props => props.active ? '700' : '500'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? '0.5' : '1'};
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        border-color: #2563eb;
        color: ${props => props.active ? '#ffffff' : '#2563eb'};
        background: ${props => props.active ? '#1d4ed8' : '#eff6ff'};
    }
`;

// Header for Print Paper view
const PrintOnlyHeader = styled.div`
    display: none;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #000000;

    @media print {
        display: block !important;
    }
`;

const StoresAbcVedReport = () => {
    const [loading, setLoading] = useState(false);
    const [rawItems, setRawItems] = useState([]);
    const [search, setSearch] = useState('');
    const [abcFilter, setAbcFilter] = useState('ALL');
    const [vedFilter, setVedFilter] = useState('ALL');
    const [selectedMatrixCell, setSelectedMatrixCell] = useState(null);
    const [lowStockOnly, setLowStockOnly] = useState(false);

    // Print State
    const [isPrinting, setIsPrinting] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchItemsData = async () => {
        setLoading(true);
        try {
            const url = `${Hmsbaseurl.replace(/\/$/, '')}/item-master/`;
            const response = await apiRequest(url, 'GET');
            if (response.success && Array.isArray(response.data)) {
                setRawItems(response.data);
            } else {
                toast.error(response.error || 'Failed to fetch store item master records');
            }
        } catch (error) {
            toast.error('Error fetching inventory items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItemsData();
    }, []);

    // Dynamic ABC Calculation Engine & Cumulative Value Ranking
    const processedItems = useMemo(() => {
        if (!rawItems || rawItems.length === 0) return [];

        // 1. Calculate stock value for each item
        const itemsWithValue = rawItems.map(item => {
            const qty = Number(item.total_quantity || 0) - Number(item.approved_quantity || 0);
            const availQty = qty > 0 ? qty : 0;
            const unitPrice = Number(item.unit_price || 0);
            const stockValue = availQty * unitPrice;
            const ved = (item.ved_category || 'D').toUpperCase();

            return {
                ...item,
                availQty,
                unitPrice,
                stockValue,
                ved_category: ved
            };
        });

        // 2. Sort descending by stock value
        itemsWithValue.sort((a, b) => b.stockValue - a.stockValue);

        // 3. Compute total spend/value
        const totalValue = itemsWithValue.reduce((sum, item) => sum + item.stockValue, 0);

        // 4. Compute cumulative percentages and assign ABC Categories
        let cumulativeValue = 0;
        return itemsWithValue.map(item => {
            cumulativeValue += item.stockValue;
            const cumulativePct = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 100;

            let abc = 'C';
            if (cumulativePct <= 70) {
                abc = 'A';
            } else if (cumulativePct <= 90) {
                abc = 'B';
            } else {
                abc = 'C';
            }

            const matrixCode = `${abc}${item.ved_category}`; // e.g. AV, AE, BD, CD

            return {
                ...item,
                abc_category: abc,
                cumulativePct,
                matrixCode
            };
        });
    }, [rawItems]);

    // KPI Metrics Summaries
    const kpiSummary = useMemo(() => {
        const totalVal = processedItems.reduce((sum, item) => sum + item.stockValue, 0);
        const countA = processedItems.filter(i => i.abc_category === 'A');
        const countB = processedItems.filter(i => i.abc_category === 'B');
        const countC = processedItems.filter(i => i.abc_category === 'C');

        const valA = countA.reduce((sum, i) => sum + i.stockValue, 0);
        const valB = countB.reduce((sum, i) => sum + i.stockValue, 0);
        const valC = countC.reduce((sum, i) => sum + i.stockValue, 0);

        const countV = processedItems.filter(i => i.ved_category === 'V');
        const countE = processedItems.filter(i => i.ved_category === 'E');
        const countD = processedItems.filter(i => i.ved_category === 'D');

        const vitalLowStock = countV.filter(i => i.availQty <= Number(i.stockReorderLevel || 0));

        return {
            totalItems: processedItems.length,
            totalVal,
            countA: countA.length,
            valA,
            pctA: totalVal > 0 ? ((valA / totalVal) * 100).toFixed(1) : '0',
            countB: countB.length,
            valB,
            pctB: totalVal > 0 ? ((valB / totalVal) * 100).toFixed(1) : '0',
            countC: countC.length,
            valC,
            pctC: totalVal > 0 ? ((valC / totalVal) * 100).toFixed(1) : '0',
            countV: countV.length,
            countE: countE.length,
            countD: countD.length,
            vitalLowStockCount: vitalLowStock.length
        };
    }, [processedItems]);

    // 3x3 ABC-VED Matrix Data Definitions
    const matrixDefs = [
        { code: 'AV', name: 'Class A - Vital', strategy: 'Tightest Control, Minimum Safety Stock', badgeColor: '#dc2626', bgColor: '#fef2f2', borderColor: '#fca5a5' },
        { code: 'AE', name: 'Class A - Essential', strategy: 'Strict Cost Control, Moderate Stock', badgeColor: '#ea580c', bgColor: '#fff7ed', borderColor: '#fdba74' },
        { code: 'AD', name: 'Class A - Desirable', strategy: 'Strict Capital Control, Zero Buffer', badgeColor: '#d97706', bgColor: '#fffbeb', borderColor: '#fcd34d' },
        { code: 'BV', name: 'Class B - Vital', strategy: 'High Priority, Adequate Buffer', badgeColor: '#e11d48', bgColor: '#fff1f2', borderColor: '#fda4af' },
        { code: 'BE', name: 'Class B - Essential', strategy: 'Standard Control, Normal Reorder', badgeColor: '#0284c7', bgColor: '#f0f9ff', borderColor: '#7dd3fc' },
        { code: 'BD', name: 'Class B - Desirable', strategy: 'Standard Inventory Control', badgeColor: '#4f46e5', bgColor: '#eef2ff', borderColor: '#c7d2fe' },
        { code: 'CV', name: 'Class C - Vital', strategy: 'High Safety Stock, Large Buffer', badgeColor: '#9333ea', bgColor: '#faf5ff', borderColor: '#f0abfc' },
        { code: 'CE', name: 'Class C - Essential', strategy: 'Periodic Review, Bulk Ordering', badgeColor: '#0d9488', bgColor: '#f0fdf4', borderColor: '#99f6e4' },
        { code: 'CD', name: 'Class C - Desirable', strategy: 'Minimum Control, Bulk Stocking', badgeColor: '#16a34a', bgColor: '#f0fdf4', borderColor: '#86efac' }
    ];

    const matrixCalculated = useMemo(() => {
        return matrixDefs.map(def => {
            const matchingItems = processedItems.filter(item => item.matrixCode === def.code);
            const count = matchingItems.length;
            const value = matchingItems.reduce((sum, item) => sum + item.stockValue, 0);
            return {
                ...def,
                count,
                value
            };
        });
    }, [processedItems]);

    // Filtered items list for the table view
    const filteredItems = useMemo(() => {
        return processedItems.filter(item => {
            if (search) {
                const q = search.toLowerCase();
                const matchesName = (item.itemName || '').toLowerCase().includes(q);
                const matchesId = (item.item_id || '').toLowerCase().includes(q);
                const matchesHsn = (item.hsn || '').toLowerCase().includes(q);
                if (!matchesName && !matchesId && !matchesHsn) return false;
            }

            if (abcFilter !== 'ALL' && item.abc_category !== abcFilter) return false;
            if (vedFilter !== 'ALL' && item.ved_category !== vedFilter) return false;
            if (selectedMatrixCell && item.matrixCode !== selectedMatrixCell) return false;
            if (lowStockOnly) {
                const isLow = item.availQty <= Number(item.stockReorderLevel || 0);
                if (!isLow) return false;
            }

            return true;
        });
    }, [processedItems, search, abcFilter, vedFilter, selectedMatrixCell, lowStockOnly]);

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, abcFilter, vedFilter, selectedMatrixCell, lowStockOnly, itemsPerPage]);

    // Paginated Items Slice (If printing, render ALL filtered items)
    const totalPages = useMemo(() => {
        if (itemsPerPage === 'ALL') return 1;
        return Math.max(1, Math.ceil(filteredItems.length / Number(itemsPerPage)));
    }, [filteredItems, itemsPerPage]);

    const displayedItems = useMemo(() => {
        if (isPrinting || itemsPerPage === 'ALL') return filteredItems;
        const startIdx = (currentPage - 1) * Number(itemsPerPage);
        return filteredItems.slice(startIdx, startIdx + Number(itemsPerPage));
    }, [filteredItems, currentPage, itemsPerPage, isPrinting]);

    const handleClearFilters = () => {
        setSearch('');
        setAbcFilter('ALL');
        setVedFilter('ALL');
        setSelectedMatrixCell(null);
        setLowStockOnly(false);
    };

    const handleExportExcel = () => {
        if (filteredItems.length === 0) {
            toast.warning('No inventory records available to export');
            return;
        }

        const dataToExport = filteredItems.map((item, idx) => ({
            'S.No': idx + 1,
            'Item ID': item.item_id || '-',
            'Item Name': item.itemName || '-',
            'Category': item.category || '-',
            'Group': item.group || '-',
            'HSN': item.hsn || '-',
            'Unit Price (₹)': item.unitPrice,
            'Available Stock': item.availQty,
            'Stock Reorder Level': Number(item.stockReorderLevel || 0),
            'Total Stock Value (₹)': item.stockValue,
            'Cumulative Value (%)': item.cumulativePct.toFixed(2),
            'ABC Classification': `Class ${item.abc_category}`,
            'VED Criticality': item.ved_category === 'V' ? 'Vital' : item.ved_category === 'E' ? 'Essential' : 'Desirable',
            'Matrix Category': item.matrixCode
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ABC_VED_Analysis');
        XLSX.writeFile(workbook, `Stores_ABC_VED_Inventory_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
        toast.success('Excel report downloaded successfully!');
    };

    // Full Table Print Handler
    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 300);
    };

    // Calculate pagination page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <PageWrapper id="printable-report-wrapper">
            <PrintGlobalStyles />

            {/* Screen Header (Hidden on Paper Print) */}
            <Header className="no-print">
                <HeaderTitleGroup>
                    <Layers size={32} color="#38bdf8" />
                    <div>
                        <Title>ABC & VED Inventory Analysis Report</Title>
                        <Subtitle>Always Better Control (Financial Value) & Vital/Essential/Desirable (Criticality Matrix)</Subtitle>
                    </div>
                </HeaderTitleGroup>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <ActionButton bgColor="#334155" borderColor="#475569" onClick={fetchItemsData}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
                    </ActionButton>
                    <ActionButton bgColor="#059669" onClick={handleExportExcel}>
                        <Download size={16} /> Export Excel
                    </ActionButton>
                    <ActionButton bgColor="#4f46e5" onClick={handlePrint}>
                        <Printer size={16} /> Print Full Table
                    </ActionButton>
                </div>
            </Header>

            <Container id="printable-container">
                {/* Print Only Header */}
                <PrintOnlyHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#000' }}>HMS Store Inventory Analysis Report</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#333' }}>
                                ABC (Financial Consumption Value) & VED (Operational Criticality) Matrix Analysis
                            </p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#444' }}>
                            <div>Date Generated: <strong>{dayjs().format('DD/MM/YYYY HH:mm')}</strong></div>
                            <div>Total Items: <strong>{filteredItems.length}</strong></div>
                            <div>Total Value: <strong>₹{filteredItems.reduce((s, i) => s + i.stockValue, 0).toLocaleString('en-IN')}</strong></div>
                        </div>
                    </div>
                    {(abcFilter !== 'ALL' || vedFilter !== 'ALL' || selectedMatrixCell || lowStockOnly || search) && (
                        <div style={{ marginTop: '8px', fontSize: '0.78rem', background: '#f1f5f9', padding: '6px 10px', borderRadius: '4px' }}>
                            <strong>Active Filters:</strong> {abcFilter !== 'ALL' && `[ABC: Class ${abcFilter}] `} {vedFilter !== 'ALL' && `[VED: ${vedFilter}] `} {selectedMatrixCell && `[Matrix: ${selectedMatrixCell}] `} {lowStockOnly && `[Low Stock Only] `} {search && `[Search: "${search}"]`}
                        </div>
                    )}
                </PrintOnlyHeader>

                {/* KPI Summary Cards (Hidden on Print) */}
                <KpiGrid className="no-print" style={{ marginTop: '24px' }}>
                    <KpiCard borderColor="#cbd5e1">
                        <KpiLabel color="#475569"><DollarSign size={16} /> Total Stock Value</KpiLabel>
                        <KpiValue color="#0f172a">₹{kpiSummary.totalVal.toLocaleString('en-IN')}</KpiValue>
                        <KpiSubtext>{kpiSummary.totalItems} Total Store Items</KpiSubtext>
                    </KpiCard>

                    <KpiCard borderColor="#fca5a5">
                        <KpiLabel color="#dc2626">Class A Items (High Value)</KpiLabel>
                        <KpiValue color="#dc2626">₹{kpiSummary.valA.toLocaleString('en-IN')}</KpiValue>
                        <KpiSubtext>{kpiSummary.countA} Items ({kpiSummary.pctA}% of total spend)</KpiSubtext>
                    </KpiCard>

                    <KpiCard borderColor="#fdba74">
                        <KpiLabel color="#ea580c">Class B Items (Medium Value)</KpiLabel>
                        <KpiValue color="#ea580c">₹{kpiSummary.valB.toLocaleString('en-IN')}</KpiValue>
                        <KpiSubtext>{kpiSummary.countB} Items ({kpiSummary.pctB}% of total spend)</KpiSubtext>
                    </KpiCard>

                    <KpiCard borderColor="#86efac">
                        <KpiLabel color="#16a34a">Class C Items (Low Value)</KpiLabel>
                        <KpiValue color="#16a34a">₹{kpiSummary.valC.toLocaleString('en-IN')}</KpiValue>
                        <KpiSubtext>{kpiSummary.countC} Items ({kpiSummary.pctC}% of total spend)</KpiSubtext>
                    </KpiCard>

                    <KpiCard borderColor="#f43f5e">
                        <KpiLabel color="#e11d48"><AlertTriangle size={16} /> Vital Items Risk Alert</KpiLabel>
                        <KpiValue color="#e11d48">{kpiSummary.vitalLowStockCount} Items Low</KpiValue>
                        <KpiSubtext>{kpiSummary.countV} Total Vital (V) items in store</KpiSubtext>
                    </KpiCard>
                </KpiGrid>

                {/* 3x3 ABC-VED Matrix Dashboard (Hidden on Print) */}
                <MatrixContainer className="no-print">
                    <SectionHeader>
                        <SectionTitle>
                            <ShieldCheck size={20} color="#2563eb" /> ABC - VED 3x3 Control Matrix
                        </SectionTitle>
                        {selectedMatrixCell && (
                            <Badge color="#2563eb" bg="#eff6ff" borderColor="#bfdbfe" style={{ cursor: 'pointer' }} onClick={() => setSelectedMatrixCell(null)}>
                                Active Matrix Filter: <strong>{selectedMatrixCell}</strong> (Click to reset)
                            </Badge>
                        )}
                    </SectionHeader>

                    <MatrixGrid>
                        {matrixCalculated.map(cell => (
                            <MatrixCell
                                key={cell.code}
                                isSelected={selectedMatrixCell === cell.code}
                                bgColor={cell.bgColor}
                                borderColor={cell.borderColor}
                                onClick={() => setSelectedMatrixCell(selectedMatrixCell === cell.code ? null : cell.code)}
                            >
                                <MatrixCellCode badgeColor={cell.badgeColor}>{cell.code}</MatrixCellCode>
                                <MatrixCellTitle>{cell.name}</MatrixCellTitle>
                                <MatrixCellStrategy>{cell.strategy}</MatrixCellStrategy>
                                <MatrixCellStats>
                                    <MatrixStatCount>{cell.count} Items</MatrixStatCount>
                                    <MatrixStatValue>₹{cell.value.toLocaleString('en-IN')}</MatrixStatValue>
                                </MatrixCellStats>
                            </MatrixCell>
                        ))}
                    </MatrixGrid>
                </MatrixContainer>

                {/* Controls and Data Table */}
                <Card className="printable-card">
                    <ControlsBar className="no-print">
                        <SearchInputWrapper>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                            <SearchInput
                                type="text"
                                placeholder="Search by item name, ID, HSN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </SearchInputWrapper>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <Select value={abcFilter} onChange={(e) => setAbcFilter(e.target.value)}>
                                <option value="ALL">All ABC Classes</option>
                                <option value="A">Class A (Top 70% Spend)</option>
                                <option value="B">Class B (Next 20% Spend)</option>
                                <option value="C">Class C (Low Spend)</option>
                            </Select>

                            <Select value={vedFilter} onChange={(e) => setVedFilter(e.target.value)}>
                                <option value="ALL">All VED Criticalities</option>
                                <option value="V">V - Vital (Operation Stops)</option>
                                <option value="E">E - Essential (Quality Degraded)</option>
                                <option value="D">D - Desirable (Minor Impact)</option>
                            </Select>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: lowStockOnly ? '#dc2626' : '#64748b', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={lowStockOnly}
                                    onChange={(e) => setLowStockOnly(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                                />
                                Low Stock Only
                            </label>

                            <ActionButton bgColor="#f1f5f9" textColor="#334155" borderColor="#cbd5e1" onClick={handleClearFilters}>
                                <FilterX size={16} /> Clear Filters
                            </ActionButton>
                        </div>
                    </ControlsBar>

                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Inventory Data...</div>
                    ) : (
                        <>
                            {/* Inline Scrollable Table Container */}
                            <TableWrapper className="printable-table-wrapper">
                                <Table className="printable-table">
                                    <thead>
                                        <Tr>
                                            <Th>S.No</Th>
                                            <Th>Item Code</Th>
                                            <Th>Item Name</Th>
                                            <Th>Category / Group</Th>
                                            <Th>Unit Price (₹)</Th>
                                            <Th>Available Qty</Th>
                                            <Th>Total Stock Value (₹)</Th>
                                            <Th>Cumulative %</Th>
                                            <Th>ABC Class</Th>
                                            <Th>VED Class</Th>
                                            <Th>Matrix Cell</Th>
                                            <Th>Reorder Level</Th>
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {displayedItems.length === 0 ? (
                                            <Tr>
                                                <Td colSpan={12} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                                    No inventory items match the selected criteria.
                                                </Td>
                                            </Tr>
                                        ) : (
                                            displayedItems.map((item, idx) => {
                                                const isLow = item.availQty <= Number(item.stockReorderLevel || 0);
                                                const abcBadgeBg = item.abc_category === 'A' ? '#fef2f2' : item.abc_category === 'B' ? '#fff7ed' : '#f0fdf4';
                                                const abcBadgeColor = item.abc_category === 'A' ? '#dc2626' : item.abc_category === 'B' ? '#ea580c' : '#16a34a';

                                                const vedBadgeBg = item.ved_category === 'V' ? '#fff1f2' : item.ved_category === 'E' ? '#f0f9ff' : '#f8fafc';
                                                const vedBadgeColor = item.ved_category === 'V' ? '#e11d48' : item.ved_category === 'E' ? '#0284c7' : '#64748b';

                                                const rowIndex = (isPrinting || itemsPerPage === 'ALL')
                                                    ? idx + 1
                                                    : ((currentPage - 1) * Number(itemsPerPage)) + idx + 1;

                                                return (
                                                    <Tr key={item.item_id || item._id} style={isLow ? { backgroundColor: '#fff1f2' } : {}}>
                                                        <Td style={{ fontWeight: '500', color: '#64748b' }}>{rowIndex}</Td>
                                                        <Td style={{ fontWeight: '600', color: '#475569' }}>{item.item_id}</Td>
                                                        <Td style={{ fontWeight: '700' }}>{item.itemName}</Td>
                                                        <Td style={{ color: '#64748b' }}>{item.category || item.group || '-'}</Td>
                                                        <Td style={{ fontWeight: '600' }}>₹{item.unitPrice.toLocaleString('en-IN')}</Td>
                                                        <Td style={{ fontWeight: '800', color: isLow ? '#dc2626' : '#059669' }}>
                                                            {item.availQty}
                                                        </Td>
                                                        <Td style={{ fontWeight: '700', color: '#2563eb' }}>₹{item.stockValue.toLocaleString('en-IN')}</Td>
                                                        <Td style={{ color: '#64748b' }}>{item.cumulativePct.toFixed(1)}%</Td>
                                                        <Td>
                                                            <Badge bg={abcBadgeBg} color={abcBadgeColor} borderColor={`${abcBadgeColor}40`}>
                                                                Class {item.abc_category}
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <Badge bg={vedBadgeBg} color={vedBadgeColor} borderColor={`${vedBadgeColor}40`}>
                                                                {item.ved_category === 'V' ? 'V - Vital' : item.ved_category === 'E' ? 'E - Essential' : 'D - Desirable'}
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <span style={{ fontWeight: '800', color: '#1e293b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                                                                {item.matrixCode}
                                                            </span>
                                                        </Td>
                                                        <Td style={{ color: '#64748b' }}>
                                                            {item.stockReorderLevel} {isLow && <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.75rem' }}>(REORDER)</span>}
                                                        </Td>
                                                    </Tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </TableWrapper>

                            {/* Pagination Controls Footer (Hidden on Print) */}
                            <PaginationContainer className="no-print">
                                <PaginationInfo>
                                    {filteredItems.length === 0 ? (
                                        'Showing 0 items'
                                    ) : itemsPerPage === 'ALL' ? (
                                        `Showing all ${filteredItems.length} items`
                                    ) : (
                                        `Showing ${((currentPage - 1) * Number(itemsPerPage)) + 1} to ${Math.min(currentPage * Number(itemsPerPage), filteredItems.length)} of ${filteredItems.length} items`
                                    )}
                                </PaginationInfo>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                        <span>Rows per page:</span>
                                        <Select
                                            value={itemsPerPage}
                                            onChange={(e) => setItemsPerPage(e.target.value)}
                                            style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                            <option value="ALL">All</option>
                                        </Select>
                                    </div>

                                    {itemsPerPage !== 'ALL' && totalPages > 1 && (
                                        <PaginationGroup>
                                            <PageButton
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                                title="First Page"
                                            >
                                                <ChevronsLeft size={16} />
                                            </PageButton>
                                            <PageButton
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                title="Previous Page"
                                            >
                                                <ChevronLeft size={16} />
                                            </PageButton>

                                            {getPageNumbers().map(pageNum => (
                                                <PageButton
                                                    key={pageNum}
                                                    active={pageNum === currentPage}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </PageButton>
                                            ))}

                                            <PageButton
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                title="Next Page"
                                            >
                                                <ChevronRight size={16} />
                                            </PageButton>
                                            <PageButton
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}
                                                title="Last Page"
                                            >
                                                <ChevronsRight size={16} />
                                            </PageButton>
                                        </PaginationGroup>
                                    )}
                                </div>
                            </PaginationContainer>
                        </>
                    )}
                </Card>
            </Container>
        </PageWrapper>
    );
};

export default StoresAbcVedReport;
