import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Select from 'react-select';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
import { Building2 } from 'lucide-react';
import { getSelectedStoreDepartment, setSelectedStoreDepartment, useStoresDepartment } from './storesDepartmentHelper';
import DepartmentSelectionModal from './DepartmentSelectionModal';
import {
    PageWrapper,
    Container,
    Input,
    Button,
    Table,
    Th, Td, Tr,
    Label,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors,
    fadeIn
} from '../GlobalStyles';


const DateInput = styled(Input)`
    &[type="date"],
    &[type="month"] {
        cursor: pointer;
        &::-webkit-calendar-picker-indicator {
            cursor: pointer;
            filter: invert(47%) sepia(82%) saturate(445%) hue-rotate(130deg) brightness(95%) contrast(92%);
            &:hover { transform: scale(1.1); }
        }
    }
`;

const GlassHeader = styled.div`
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
    padding: 24px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        pointer-events: none;
    }
`;

const FormCard = styled.div`
    background: white;
    border-radius: 12px;
    border: 1px solid ${colors.border};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
`;

const SectionTitleCard = styled.div`
    padding: 12px 20px;
    background: ${props => props.$bg || '#f8fafc'};
    border-bottom: 1px solid ${colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: ${props => props.$color || colors.primary};
    }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(${props => props.$minWidth || '180px'}, 1fr));
    gap: 15px 20px;
    padding: 20px;
`;

const PurchaseInfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 12px;
    padding: 20px;
    align-items: flex-start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        & > div {
            grid-column: span 1 !important;
        }
    }
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
`;

const StatsCard = styled.div`
    background: white;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid ${colors.border};
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const NetPayableCard = styled.div`
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
    animation: ${fadeIn} 0.5s ease-out;

    .label { font-size: 0.8rem; opacity: 0.9; margin-bottom: 2px; font-weight: 500; }
    .value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.01em; }
`;

const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    padding-bottom: 8px;
    border-bottom: 1px dashed ${colors.border};
    
    &:last-child { border-bottom: none; }

    .label { color: ${colors.textMuted}; font-weight: 500; }
    .value { color: ${colors.textMain}; font-weight: 700; }
    .value.danger { color: ${colors.danger}; }
`;

const ActionFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding: 25px;
    background: white;
    border-top: 1px solid ${colors.border};
    border-radius: 0 0 12px 12px;
`;

const ModalContainerAnimated = styled(ModalContainer)`
    animation: ${fadeIn} 0.3s ease-out;
`;

const CurrencyInputWrapper = styled.div`
    display: flex;
    align-items: center;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: ${props => props.$readOnly ? '#f8fafc' : 'white'};
    overflow: hidden;
    height: 30px;
    box-sizing: border-box;
    transition: border-color 0.15s;
    &:focus-within {
        border-color: #0d9488;
        box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
    }
`;

const CurrencySymbol = styled.span`
    background: #e2e8f0;
    color: #475569;
    padding: 0 7px;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 700;
    border-right: 1px solid #cbd5e1;
    user-select: none;
`;

const SuffixSymbol = styled.span`
    background: #e2e8f0;
    color: #475569;
    padding: 0 7px;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 700;
    border-left: 1px solid #cbd5e1;
    user-select: none;
`;

const CurrencyField = styled.input`
    border: none;
    outline: none;
    padding: 3px 8px;
    width: 100%;
    font-size: 0.8rem;
    color: #0f172a;
    font-weight: 600;
    background: transparent;
    &[readonly] {
        color: #475569;
        cursor: default;
    }
`;

const MoneyInput = ({ value, onChange, name, readOnly, placeholder = "0.00", style, suffix, ...rest }) => {
    const handleNumericChange = (e) => {
        let val = e.target.value;
        // Strip accidental leading zero (e.g. typing 100 doesn't become 0100)
        if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
            val = val.replace(/^0+/, '');
            if (val === '') val = '0';
            e.target.value = val;
        }
        // Verify numeric (allow empty, digits, single decimal point)
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            if (onChange) onChange(e);
        }
    };

    // If zero or null/undefined, display empty string instead of 0
    const isZeroOrEmpty = value === undefined || value === null || value === '' || value === 0 || value === '0' || value === 0.0 || value === '0.00' || value === '0.0';
    const dispVal = isZeroOrEmpty ? '' : value;

    return (
        <CurrencyInputWrapper $readOnly={readOnly} style={style}>
            <CurrencySymbol>₹</CurrencySymbol>
            <CurrencyField
                type="text"
                inputMode="decimal"
                name={name}
                value={dispVal}
                onChange={handleNumericChange}
                readOnly={readOnly}
                placeholder={placeholder}
                tabIndex={readOnly ? -1 : 0}
                {...rest}
            />
            {suffix && <SuffixSymbol>{suffix}</SuffixSymbol>}
        </CurrencyInputWrapper>
    );
};

const CompactInput = styled(Input)`
    height: 30px !important;
    padding: 3px 8px !important;
    font-size: 0.8rem !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 4px !important;
    background: ${props => props.readOnly ? '#f8fafc' : 'white'} !important;
    box-sizing: border-box;

    &[type="date"],
    &[type="month"] {
        cursor: pointer;
        &::-webkit-calendar-picker-indicator {
            cursor: pointer;
            filter: invert(47%) sepia(82%) saturate(445%) hue-rotate(130deg) brightness(95%) contrast(92%);
            &:hover { transform: scale(1.1); }
        }
    }
`;

const CompactLabel = styled.label`
    font-size: 0.72rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 3px;
    display: block;
`;

export const getFullVendorAddress = (vendor) => {
    if (!vendor) return '';
    if (typeof vendor === 'string') return vendor;
    const parts = [
        vendor.address_line1 || vendor.addressLine1 || vendor.address,
        vendor.address_line2 || vendor.addressLine2,
        vendor.city,
        vendor.state,
        vendor.pincode
    ].filter(p => p && String(p).trim().length > 0);
    return parts.join(', ');
};

export const formatExpiryForMonthInput = (val) => {
    if (!val) return '';
    const s = String(val).trim();
    // YYYY-MM
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    // YYYY-MM-DD or ISO
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 7);
    // MM/YYYY or MM-YYYY
    const m = s.match(/^(\d{1,2})[/-](\d{4})$/);
    if (m) {
        return `${m[2]}-${String(m[1]).padStart(2, '0')}`;
    }
    const d = dayjs(s);
    if (d.isValid()) return d.format('YYYY-MM');
    return '';
};

export const formatExpiryDisplay = (val, expMonth, expYear) => {
    if (expMonth && expYear) return `${String(expMonth).padStart(2, '0')}/${expYear}`;
    if (!val) return '-';
    const s = String(val).trim();
    const m = s.match(/^(\d{4})-(\d{2})/);
    if (m) return `${m[2]}/${m[1]}`;
    const d = dayjs(s);
    if (d.isValid()) return d.format('MM/YYYY');
    return s;
};

export const parseExpiryInput = (input) => {
    if (!input || !String(input).trim()) return null;
    const s = String(input).trim();

    // 1. "MM/YYYY", "M/YYYY", "MM-YYYY"
    let m = s.match(/^(\d{1,2})[\s/-](\d{4})$/);
    if (m) {
        const month = parseInt(m[1], 10);
        const year = parseInt(m[2], 10);
        if (month >= 1 && month <= 12 && year >= 2000 && year <= 2199) {
            const mm = String(month).padStart(2, '0');
            const lastDay = new Date(year, month, 0).getDate();
            return {
                formatted: `${mm}/${year}`,
                expiry: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
                expMonth: mm,
                expYear: String(year)
            };
        }
    }

    // 2. "MM/YY" or "M/YY"
    m = s.match(/^(\d{1,2})[\s/-](\d{2})$/);
    if (m) {
        const month = parseInt(m[1], 10);
        let year = parseInt(m[2], 10) + 2000;
        if (month >= 1 && month <= 12) {
            const mm = String(month).padStart(2, '0');
            const lastDay = new Date(year, month, 0).getDate();
            return {
                formatted: `${mm}/${year}`,
                expiry: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
                expMonth: mm,
                expYear: String(year)
            };
        }
    }

    // 3. "YYYY-MM" or "YYYY/MM"
    m = s.match(/^(\d{4})[\s/-](\d{1,2})$/);
    if (m) {
        const year = parseInt(m[1], 10);
        const month = parseInt(m[2], 10);
        if (month >= 1 && month <= 12 && year >= 2000 && year <= 2199) {
            const mm = String(month).padStart(2, '0');
            const lastDay = new Date(year, month, 0).getDate();
            return {
                formatted: `${mm}/${year}`,
                expiry: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
                expMonth: mm,
                expYear: String(year)
            };
        }
    }

    // 4. "YYYY-MM-DD"
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
        const year = parseInt(m[1], 10);
        const month = parseInt(m[2], 10);
        if (month >= 1 && month <= 12) {
            const mm = String(month).padStart(2, '0');
            const lastDay = new Date(year, month, 0).getDate();
            return {
                formatted: `${mm}/${year}`,
                expiry: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
                expMonth: mm,
                expYear: String(year)
            };
        }
    }

    return null;
};

export const ExpiryInput = ({ value, onChange, disabled, style, placeholder, ...rest }) => {
    // Format incoming value to YYYY-MM required by HTML <input type="month">
    const monthVal = formatExpiryForMonthInput(value);

    const handleChange = (e) => {
        const val = e.target.value; // "YYYY-MM" or ""
        if (val && /^\d{4}-\d{2}$/.test(val)) {
            const [yearStr, monthStr] = val.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);
            const lastDay = new Date(year, month, 0).getDate();
            const formattedExpiry = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
            if (onChange) {
                onChange({
                    formatted: `${monthStr}/${yearStr}`,
                    expiry: formattedExpiry,
                    expMonth: monthStr,
                    expYear: yearStr
                });
            }
        } else {
            if (onChange) {
                onChange(null);
            }
        }
    };

    return (
        <CompactInput
            type="month"
            name="expiry"
            value={monthVal}
            onChange={handleChange}
            disabled={disabled}
            style={{ width: '100%', ...style }}
            {...rest}
        />
    );
};

const taxOptions = [
    { value: 0, label: 'EXEMPT (0%)' },
    { value: 5, label: 'RATE OF 5%' },
    { value: 12, label: 'RATE OF 12%' },
    { value: 18, label: 'RATE OF 18%' },
    { value: 28, label: 'RATE OF 28%' }
];

const ItemTableWrapper = styled.div`
    overflow-x: auto;
    background: white;
    
    table {
        min-width: 1000px;
        border-collapse: collapse;
        
        th {
            background: linear-gradient(90deg, ${colors.primaryDark} 0%, ${colors.primary} 100%) !important;
            color: white !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 12px 15px !important;
            font-size: 0.75rem !important;
            border: none !important;
            text-align: left;
        }
    }
`;

const CalendarGlobalStyles = createGlobalStyle`
    .ant-picker-dropdown {
        z-index: 10000 !important;
    }
    .ant-picker-clear {
        display: none !important;
    }
    .ant-picker-header {
        display: flex !important;
        align-items: center;
        background: #0d9488 !important;
        padding: 8px 12px !important;
        border-bottom: 1px solid rgba(255,255,255,0.2) !important;
    }
    .ant-picker-header button,
    .ant-picker-header-view,
    .ant-picker-header-view button {
        color: #ffffff !important;
        font-weight: 600 !important;
    }
    .ant-picker-header button:hover,
    .ant-picker-header-view button:hover {
        color: #ccfbf1 !important;
    }
    .ant-picker-header .ant-picker-action {
        color: white !important;
    }
    .ant-picker-content th {
        color: #1e3a8a !important;
        font-weight: 600 !important;
    }
    .ant-picker-year-panel, .ant-picker-month-panel {
        .ant-picker-header {
            background: #1e3a8a !important;
            color: white !important;
        }
    }
`;

const StoresGRNGeneration = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editGrn = location.state?.editGrn || null;
    const isVerified = editGrn?.is_approved || false;
    const [loading, setLoading] = useState(false);

    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);
    const [newVendorData, setNewVendorData] = useState({
        name: '',
        vendor_type: 'SUPPLIER',
        contact_person: '',
        phone: '',
        email: '',
        gstin: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: ''
    });

    const vendorOptions = useMemo(() => {
        return (vendors || [])
            .map(v => ({
                value: v.vendor_id,
                label: v.name || v.vendor_name || 'Unnamed Vendor',
                vendor: v
            }))
            .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
    }, [vendors]);
    const [departments, setDepartments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groupTypes, setGroupTypes] = useState([]);
    const [showDeptModal, setShowDeptModal] = useState(false);

    // F10 Shortcut to open Department modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10') {
                e.preventDefault();
                setShowDeptModal(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    useStoresDepartment((newDept) => {
        if (newDept && newDept !== formData.department) {
            setFormData(prev => ({ ...prev, department: newDept }));
            fetchItemsByDepartment(newDept);
        }
    });

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        purchase_category: '',
        department: getSelectedStoreDepartment(),
        vendor_id: '',
        supplier_address: '',
        contact_person: '',
        phone: '',
        invoice_no: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_mode: 'CHEQUE',
        credit_period: '',
        due_date: '',
        remarks: '',
        quotation_rate: 0,
        courier_transport_charge: 0,
        igst: 0,
        cess: 0,
        local_tax: 0,
        tax_paid_to_supplier: 0,
        central_sales_tax: 0,
        round_type: 'add', // NEW: tracks whether we are adding or subtracting
        round_amount: 0
    });

    const paymentModes = [
        { value: 'CHEQUE', label: 'CHEQUE' },
        { value: 'CASH', label: 'CASH' },
        { value: 'NEFT', label: 'NEFT' },
        { value: 'RTGS', label: 'RTGS' },
        { value: 'UPI', label: 'UPI' }
    ];

    const purchaseCategories = [
        { value: 'Cash', label: 'Cash' },
        { value: 'Credit', label: 'Credit' }
    ];



    const initialCurrentItemState = {
        item_id: '',
        name: '',
        hsn: '',
        department: '',
        batch: '',
        expMonth: '',
        expYear: '',
        expiry: '',
        packing: 1,
        no_of_unit: 1,
        quantity: 1,
        free: '',
        itemValue: '',
        packingPrice: '',
        unitPrice: '',
        tax: 5,
        purchaseTaxInclusive: true,
        purchaseDiscountPercent: '',
        purchaseDiscountAmt: '',
        deductDiscountForTax: false,
        purchaseCost: '',
        mrp: '',
        maxPackingMrp: '',
        sellingTax: 5,
        sellingTaxInclusive: true,
        sellingDiscountPercent: '',
        price: '',
        ipPrice: '',
        calcTaxOnFree: false,
        isReplacement: false,
        totalStock: 0,
        deptStock: 0,
        lastPurchaseFree: 0,
        lastPurchasePrice: 0,
        lastPurchaseCost: 0,
        lastMrp: 0,
        lastSellingPrice: 0
    };

    const [grnItems, setGrnItems] = useState([]);
    const [editingItemId, setEditingItemId] = useState(null);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showAddItemMasterModal, setShowAddItemMasterModal] = useState(false);
    const [showVendorListModal, setShowVendorListModal] = useState(false);
    const [vendorSearchQuery, setVendorSearchQuery] = useState('');
    const [itemSearchText, setItemSearchText] = useState('');
    const [hsnSearchActive, setHsnSearchActive] = useState(false);
    const [hsnSuggestions, setHsnSuggestions] = useState([]);
    const [isHsnSearching, setIsHsnSearching] = useState(false);
    const [savingHsn, setSavingHsn] = useState(false);

    const handleSaveHsnToItemMaster = async () => {
        if (!currentItem.item_id) {
            alert('Please select an item first.');
            return;
        }
        if (!currentItem.hsn || !currentItem.hsn.trim()) {
            alert('Please enter an HSN code before saving.');
            return;
        }
        const hsnVal = currentItem.hsn.trim();
        try {
            setSavingHsn(true);
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/${currentItem.item_id}/`, 'PATCH', {
                hsn: hsnVal
            });
            if (res?.success) {
                alert(`HSN code "${hsnVal}" saved to ${currentItem.name || 'item'} successfully!`);
                setItems(prev => prev.map(it => it.item_id === currentItem.item_id ? { ...it, hsn: hsnVal } : it));
            } else {
                alert('Failed to save HSN: ' + (res?.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error saving HSN to item master:', err);
            alert('Error saving HSN to item master');
        } finally {
            setSavingHsn(false);
        }
    };
    const hsnDropdownRef = useRef(null);

    const [newItemMasterData, setNewItemMasterData] = useState({
        itemName: '',
        department: getSelectedStoreDepartment(),
        category: '',
        group: '',
        group_type: '',
        hsn: '',
        stockReorderLevel: '',
        total_quantity: 0,
        approved_quantity: 0
    });

    const newItemModalGroupOptions = useMemo(() => {
        return [...groups].sort((a, b) => {
            const nameA = (a.group_name || a.groupName || a.name || '').toLowerCase();
            const nameB = (b.group_name || b.groupName || b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        }).map(g => ({
            value: g.group_id,
            label: g.group_name || g.groupName || g.name || g.group_id
        }));
    }, [groups]);

    const newItemModalCategoryOptions = useMemo(() => {
        return categories
            .filter(c => {
                if (!newItemMasterData.group) return true;
                const mappedGrp = c.group || c.group_id;
                return !mappedGrp || mappedGrp === newItemMasterData.group;
            })
            .sort((a, b) => {
                const nameA = (a.category_name || a.categoryName || a.name || '').toLowerCase();
                const nameB = (b.category_name || b.categoryName || b.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            })
            .map(c => ({
                value: c.category_id,
                label: c.category_name || c.categoryName || c.name || c.category_id
            }));
    }, [categories, newItemMasterData.group]);

    // Memoize the mapped items for current department
    const departmentItemsList = useMemo(() => {
        const filtered = items.filter(i => {
            if (!formData.department) return true;
            const targetDept = String(formData.department).toLowerCase().trim();
            const iDept = String(i.department || '').toLowerCase().trim();
            const iDeptCode = String(i.department_code || '').toLowerCase().trim();
            const iDeptName = String(i.department_name || '').toLowerCase().trim();
            if (iDept === targetDept || iDeptCode === targetDept || iDeptName === targetDept) return true;
            const deptObj = departments.find(d => 
                String(d.department_id || '').toLowerCase().trim() === targetDept ||
                String(d.id || '').toLowerCase().trim() === targetDept ||
                String(d.department_code || '').toLowerCase().trim() === targetDept ||
                String(d.department_name || '').toLowerCase().trim() === targetDept
            );
            if (deptObj) {
                const dId = String(deptObj.department_id || deptObj.id || deptObj.department_code || '').toLowerCase().trim();
                const dName = String(deptObj.department_name || '').toLowerCase().trim();
                return (dId && (iDept === dId || iDeptCode === dId || iDeptName === dId)) ||
                       (dName && (iDept === dName || iDeptCode === dName || iDeptName === dName));
            }
            return false;
        });

        return filtered.map(i => ({
            value: i.item_id,
            label: i.itemName,
            hsn: i.hsn || '',
            stock: i.total_quantity || 0,
            deptStock: i.approved_quantity || 0
        })).sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
    }, [items, formData.department, departments]);

    // Limit active visible search options to 100 to keep the DOM blazing fast with zero lag
    const itemSelectOptions = useMemo(() => {
        const q = (itemSearchText || '').trim().toLowerCase();
        if (!q) {
            return departmentItemsList.slice(0, 80);
        }

        // Search match ranking:
        // Score 0: exact match
        // Score 1: begins with query (e.g., 'PENCIL' for 'penc')
        // Score 2: any word begins with query (e.g., 'WHITE PENCIL LAB' for 'penc')
        // Score 3: contains query as substring (e.g., 'FUNCTION EXPENCES' for 'penc')
        // Score 4: hsn or item_id matches query
        const ranked = [];
        for (let idx = 0; idx < departmentItemsList.length; idx++) {
            const opt = departmentItemsList[idx];
            const name = (opt.label || '').toLowerCase();
            const hsn = (opt.hsn || '').toLowerCase();
            const val = (opt.value || '').toLowerCase();

            let score = 999;
            if (name === q) {
                score = 0;
            } else if (name.startsWith(q)) {
                score = 1;
            } else {
                const words = name.split(/\s+/);
                if (words.some(w => w.startsWith(q))) {
                    score = 2;
                } else if (name.includes(q)) {
                    score = 3;
                } else if (hsn.includes(q) || val.includes(q)) {
                    score = 4;
                }
            }

            if (score < 999) {
                ranked.push({ ...opt, _searchScore: score });
            }
        }

        ranked.sort((a, b) => {
            if (a._searchScore !== b._searchScore) {
                return a._searchScore - b._searchScore;
            }
            return (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' });
        });

        return ranked.slice(0, 100);
    }, [departmentItemsList, itemSearchText]);

    const departmentOptions = useMemo(() => {
        return (departments || [])
            .map(d => ({
                value: d.department_id || d.id || d.name,
                label: d.department_name || d.name
            }))
            .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
    }, [departments]);

    const [currentItem, setCurrentItem] = useState(initialCurrentItemState);

    useEffect(() => {
        fetchMasters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (editGrn) {
            // Retrieve raw round value from backend
            const rawRoundAmount = editGrn.round_amount?.$numberDecimal || editGrn.round_amount || 0;
            const parsedRoundAmount = parseFloat(rawRoundAmount);

            setFormData(prev => ({
                ...prev,
                date: editGrn.date || new Date().toISOString().split('T')[0],
                purchase_category: editGrn.purchase_category || '',
                department: editGrn.department || '',
                vendor_id: editGrn.vendor_id || '',
                invoice_no: editGrn.invoice_no || '',
                invoice_date: editGrn.invoice_date || new Date().toISOString().split('T')[0],
                payment_mode: editGrn.payment_mode || 'CHEQUE',
                credit_period: editGrn.credit_period || '',
                due_date: editGrn.due_date || '',
                remarks: editGrn.remarks || '',
                quotation_rate: editGrn.quotation_rate?.$numberDecimal || editGrn.quotation_rate || 0,
                courier_transport_charge: editGrn.courier_transport_charge?.$numberDecimal || editGrn.courier_transport_charge || 0,
                igst: editGrn.igst?.$numberDecimal || editGrn.igst || 0,
                cess: editGrn.cess?.$numberDecimal || editGrn.cess || 0,
                local_tax: editGrn.local_tax?.$numberDecimal || editGrn.local_tax || 0,
                tax_paid_to_supplier: editGrn.tax_paid_to_supplier?.$numberDecimal || editGrn.tax_paid_to_supplier || 0,
                central_sales_tax: editGrn.central_sales_tax?.$numberDecimal || editGrn.central_sales_tax || 0,

                // NEW: Set toggle type based on negative/positive, and store absolute amount
                round_type: parsedRoundAmount < 0 ? 'subtract' : 'add',
                round_amount: Math.abs(parsedRoundAmount)
            }));

            let itemsArray = editGrn.items;
            if (typeof itemsArray === 'string') {
                try {
                    itemsArray = JSON.parse(itemsArray);
                } catch (e) {
                    itemsArray = [];
                }
            }

            const normalizedItems = (itemsArray || []).map((item, index) => {
                let normId = item.id;
                if (normId && typeof normId === 'object') {
                    normId = normId.$numberLong || normId.$oid || Date.now() + index;
                } else if (!normId) {
                    normId = Date.now() + index;
                }
                const masterItem = items.find(it => it.item_id === item.item_id);
                return {
                    ...item,
                    id: normId,
                    hsn: item.hsn || item.hsn_code || masterItem?.hsn || ''
                };
            });

            setGrnItems(normalizedItems);
        }
    }, [editGrn]);

    // Ensure GRN items get HSN if items master finishes loading afterwards
    useEffect(() => {
        if (items.length > 0 && grnItems.length > 0) {
            let hasChanges = false;
            const updated = grnItems.map(item => {
                if (!item.hsn) {
                    const matched = items.find(i => i.item_id === item.item_id);
                    if (matched && matched.hsn) {
                        hasChanges = true;
                        return { ...item, hsn: matched.hsn };
                    }
                }
                return item;
            });
            if (hasChanges) {
                setGrnItems(updated);
            }
        }
    }, [items]);

    // Close HSN suggestion dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (hsnDropdownRef.current && !hsnDropdownRef.current.contains(e.target)) {
                setHsnSearchActive(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (editGrn && vendors.length > 0 && editGrn.vendor_id) {
            const vendor = vendors.find(v => v.vendor_id === editGrn.vendor_id);
            if (vendor) {
                setFormData(prev => ({
                    ...prev,
                    supplier_address: vendor.addressLine1 || vendor.address_line_1 || '',
                    contact_person: vendor.contactPerson || vendor.contact_person || '',
                    phone: vendor.phone || ''
                }));
            }
        }
    }, [editGrn, vendors]);

    const lastFetchedDeptRef = useRef(null);

    const fetchItemsByDepartment = async (deptId = '', force = false) => {
        const cleanDept = String(deptId || '').trim();
        if (!force && lastFetchedDeptRef.current === cleanDept) {
            return;
        }
        lastFetchedDeptRef.current = cleanDept;
        setLoadingItems(true);
        try {
            const query = cleanDept ? `?department=${encodeURIComponent(cleanDept)}` : '';
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/${query}`);
            if (res?.success && Array.isArray(res.data)) {
                setItems(res.data);
            }
        } catch (error) {
            console.error("Error fetching items for department:", error);
        } finally {
            setLoadingItems(false);
        }
    };

    // Whenever formData.department changes, get items based on department if not already fetched
    useEffect(() => {
        if (formData.department && formData.department !== lastFetchedDeptRef.current) {
            fetchItemsByDepartment(formData.department);
        }
    }, [formData.department]);

    const fetchMasters = async () => {
        try {
            // Determine active department immediately
            const activeDept = formData.department || getSelectedStoreDepartment() || '';
            const deptQuery = activeDept ? `?department=${encodeURIComponent(activeDept)}` : '';
            lastFetchedDeptRef.current = String(activeDept || '').trim();

            // Priority 1: High-priority immediate calls to render the GRN form without waiting
            setLoadingItems(true);
            const pItems = apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/${deptQuery}`)
                .then(itemsRes => {
                    if (itemsRes?.success && Array.isArray(itemsRes.data)) {
                        setItems(itemsRes.data);
                    }
                })
                .catch(err => console.error("Error fetching items:", err))
                .finally(() => setLoadingItems(false));

            const pVendors = apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`)
                .then(storeVendorsRes => {
                    if (storeVendorsRes?.success) {
                        const list = Array.isArray(storeVendorsRes.data)
                            ? storeVendorsRes.data
                            : Array.isArray(storeVendorsRes.data?.data)
                                ? storeVendorsRes.data.data
                                : [];
                        setVendors(list);
                    }
                })
                .catch(err => console.error("Error fetching vendors:", err));

            const pDepts = apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`)
                .then(deptsRes => {
                    if (deptsRes?.success && Array.isArray(deptsRes.data)) {
                        setDepartments(deptsRes.data);
                        if (activeDept && !formData.department) {
                            setFormData(prev => ({ ...prev, department: activeDept }));
                        }
                    }
                })
                .catch(err => console.error("Error fetching departments:", err));

            // Priority 2: Secondary masters loaded lazily only when modal is requested
            await Promise.all([pItems, pVendors, pDepts]);
        } catch (error) {
            console.error("Error in fetchMasters:", error);
        }
    };

    const hasLoadedSecondaryMasters = useRef(false);
    const loadSecondaryMasters = async () => {
        if (hasLoadedSecondaryMasters.current) return;
        hasLoadedSecondaryMasters.current = true;
        try {
            const [groupsRes, catsRes, groupTypesRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/category-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-type-master/`)
            ]);
            if (groupsRes?.success) setGroups(groupsRes.data);
            if (catsRes?.success) setCategories(catsRes.data);
            if (groupTypesRes?.success) setGroupTypes(groupTypesRes.data);
        } catch (err) {
            console.error("Error fetching secondary masters:", err);
            hasLoadedSecondaryMasters.current = false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSaveNewVendor = async () => {
        if (!newVendorData.name.trim()) {
            alert('Please enter Vendor Name');
            return;
        }
        try {
            setLoading(true);
            const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`, 'POST', newVendorData);
            if (res?.success && res.data) {
                const created = res.data;
                setVendors(prev => [created, ...prev]);
                const fullAddr = getFullVendorAddress(created);
                setFormData(prev => ({
                    ...prev,
                    vendor_id: created.vendor_id,
                    supplier_address: fullAddr,
                    contact_person: created.contact_person || '',
                    phone: created.phone || ''
                }));
                setShowAddVendorModal(false);
                setNewVendorData({
                    name: '',
                    vendor_type: 'SUPPLIER',
                    contact_person: '',
                    phone: '',
                    email: '',
                    gstin: '',
                    address_line1: '',
                    address_line2: '',
                    city: '',
                    state: '',
                    pincode: ''
                });
                alert('New Vendor added successfully!');
            } else {
                alert('Failed to save vendor: ' + (res?.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error saving vendor:', err);
            alert('Error saving vendor');
        } finally {
            setLoading(false);
        }
    };

    const handleClearVendor = (e) => {
        if (e) e.stopPropagation();
        setFormData(prev => ({
            ...prev,
            vendor_id: '',
            supplier_address: '',
            contact_person: '',
            phone: ''
        }));
    };

    const handleSelectVendorFromModal = (vendor) => {
        if (!vendor) return;
        setFormData(prev => ({
            ...prev,
            vendor_id: vendor.vendor_id,
            supplier_address: getFullVendorAddress(vendor),
            contact_person: vendor.contact_person || vendor.contactPerson || '',
            phone: vendor.phone || ''
        }));
        setShowVendorListModal(false);
        setVendorSearchQuery('');
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showVendorListModal) {
                setShowVendorListModal(false);
            }
        };
        if (showVendorListModal) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showVendorListModal]);

    const handleCurrentItemChange = (e) => {
        let { name, value, type, checked } = e.target;
        let val = type === 'checkbox' ? checked : value;

        const newCurrentItem = { ...currentItem, [name]: val };
        // Prevent leading zeros when typing (e.g. typing 100 doesn't become 0100)
        if (name !== 'expiry' && typeof val === 'string' && val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
            val = val.replace(/^0+/, '');
            newCurrentItem[name] = val;
        }

        if (name === 'expiry') {
            if (val) {
                const parts = val.split('-');
                if (parts.length >= 2) {
                    newCurrentItem.expYear = parts[0];
                    newCurrentItem.expMonth = parts[1];
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    if (!isNaN(year) && !isNaN(month)) {
                        const lastDay = new Date(year, month, 0).getDate();
                        newCurrentItem.expiry = `${parts[0]}-${parts[1]}-${String(lastDay).padStart(2, '0')}`;
                    }
                }
            } else {
                newCurrentItem.expYear = '';
                newCurrentItem.expMonth = '';
                newCurrentItem.expiry = '';
            }
        }

        if (name === 'packing' || name === 'no_of_unit') {
            const p = parseFloat(name === 'packing' ? val : newCurrentItem.packing) || 0;
            const n = parseFloat(name === 'no_of_unit' ? val : newCurrentItem.no_of_unit) || 0;
            newCurrentItem.quantity = p * n;
        }

        // Calculate MRP and Packing MRP based on Quantity
        const currQty = parseFloat(newCurrentItem.quantity) || 1;
        if (name === 'mrp') {
            const m = parseFloat(val) || 0;
            newCurrentItem.maxPackingMrp = currQty > 0 ? Number((m * currQty).toFixed(2)) : m;
        } else if (name === 'maxPackingMrp') {
            const mp = parseFloat(val) || 0;
            newCurrentItem.mrp = currQty > 0 ? Number((mp / currQty).toFixed(2)) : mp;
        } else if (name === 'quantity' || name === 'packing' || name === 'no_of_unit') {
            const q = parseFloat(newCurrentItem.quantity) || 0;
            const m = parseFloat(newCurrentItem.mrp) || 0;
            if (m > 0 && q > 0) {
                newCurrentItem.maxPackingMrp = Number((m * q).toFixed(2));
            }
        }

        if (name === 'itemValue' || name === 'purchaseDiscountPercent') {
            const iv = parseFloat(name === 'itemValue' ? val : newCurrentItem.itemValue) || 0;
            const pd = parseFloat(name === 'purchaseDiscountPercent' ? val : newCurrentItem.purchaseDiscountPercent) || 0;
            newCurrentItem.purchaseDiscountAmt = Number((iv * (pd / 100)).toFixed(2));
        } else if (name === 'purchaseDiscountAmt') {
            const iv = parseFloat(newCurrentItem.itemValue) || 0;
            const pda = parseFloat(val) || 0;
            newCurrentItem.purchaseDiscountPercent = iv > 0 ? Number(((pda / iv) * 100).toFixed(2)) : 0;
        }

        if (name === 'sellingDiscountPercent' || name === 'mrp' || name === 'maxPackingMrp') {
            const m = parseFloat(newCurrentItem.mrp) || 0;
            const sd = parseFloat(name === 'sellingDiscountPercent' ? val : newCurrentItem.sellingDiscountPercent) || 0;
            const sp = m > 0 ? Number((m * (1 - sd / 100)).toFixed(2)) : 0;
            newCurrentItem.price = sp;
            newCurrentItem.ipPrice = sp;
        }

        setCurrentItem(newCurrentItem);
    };

    const handleItemSelect = async (option) => {
        if (option) {
            let selectedItem = items.find(i => i.item_id === option.value);
            if (!selectedItem && option.value) {
                try {
                    const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/${option.value}/`);
                    if (res?.success && res.data) {
                        selectedItem = res.data;
                    }
                } catch (e) {
                    console.error("Error fetching item detail:", e);
                }
            }

            if (selectedItem) {
                let hsn = selectedItem.hsn || selectedItem.hsn_code || '';
                if (!hsn && selectedItem.item_id) {
                    try {
                        const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/${selectedItem.item_id}/`);
                        if (res?.success && res.data?.hsn) {
                            hsn = res.data.hsn;
                        }
                    } catch (e) {}
                }

                const stock = selectedItem.total_quantity || 0;
                const deptStock = selectedItem.approved_quantity || 0;
                const itemMrp = parseFloat(selectedItem.mrp) || 0;
                const itemRate = parseFloat(selectedItem.rate || selectedItem.unit_price) || 0;
                const taxBracket = selectedItem.tax !== undefined ? parseFloat(selectedItem.tax) : 5;

                setCurrentItem(prev => ({
                    ...prev,
                    item_id: selectedItem.item_id,
                    name: selectedItem.itemName,
                    hsn: hsn,
                    department: selectedItem.department || '',
                    totalStock: stock,
                    deptStock: deptStock,
                    mrp: itemMrp,
                    maxPackingMrp: itemMrp * (parseFloat(prev.quantity) || 1),
                    itemValue: itemRate,
                    unitPrice: (parseFloat(prev.quantity) || 1) > 0 ? itemRate / (parseFloat(prev.quantity) || 1) : itemRate,
                    tax: taxBracket,
                    sellingTax: taxBracket,
                    lastMrp: itemMrp,
                    lastPurchasePrice: itemRate,
                    lastPurchaseCost: itemRate,
                    lastSellingPrice: itemMrp
                }));

                if (selectedItem.department) {
                    setFormData(prev => prev.department ? prev : ({ ...prev, department: selectedItem.department }));
                }
            }
        } else {
            setCurrentItem(prev => ({
                ...prev,
                item_id: '',
                name: '',
                hsn: '',
                totalStock: 0,
                deptStock: 0
            }));
        }
        setHsnSearchActive(false);
        setItemSearchText('');
    };

    const handleHsnInputChange = (e) => {
        const val = e.target.value;
        setCurrentItem(prev => ({ ...prev, hsn: val }));

        if (val.trim().length >= 1) {
            const query = val.trim().toLowerCase();
            const matched = items.filter(i => (i.hsn || '').toLowerCase().includes(query));
            setHsnSuggestions(matched.slice(0, 8));
            setHsnSearchActive(matched.length > 0);
        } else {
            setHsnSuggestions([]);
            setHsnSearchActive(false);
        }
    };

    const handleHsnSearchClick = async () => {
        const query = (currentItem.hsn || '').trim();
        if (!query) {
            const withHsn = items.filter(i => i.hsn);
            setHsnSuggestions(withHsn.slice(0, 10));
            setHsnSearchActive(withHsn.length > 0);
            return;
        }

        setIsHsnSearching(true);
        let matched = items.filter(i => (i.hsn || '').toLowerCase().includes(query.toLowerCase()));

        if (matched.length === 0) {
            try {
                const res = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/?search=${encodeURIComponent(query)}`);
                if (res?.success && Array.isArray(res.data)) {
                    matched = res.data.filter(i => (i.hsn || '').toLowerCase().includes(query.toLowerCase()));
                    if (matched.length > 0) {
                        setItems(prev => {
                            const newOnes = matched.filter(m => !prev.some(p => p.item_id === m.item_id));
                            return [...newOnes, ...prev];
                        });
                    }
                }
            } catch (err) {
                console.error("Error searching items by HSN:", err);
            }
        }
        setIsHsnSearching(false);

        if (matched.length === 1) {
            handleItemSelect({ value: matched[0].item_id, label: matched[0].itemName });
            setHsnSearchActive(false);
        } else if (matched.length > 1) {
            setHsnSuggestions(matched.slice(0, 10));
            setHsnSearchActive(true);
        } else {
            setHsnSuggestions([]);
            setHsnSearchActive(false);
            alert(`No items found with HSN Code: "${query}"`);
        }
    };

    const handleSelectHsnSuggestion = (matchedItem) => {
        handleItemSelect({ value: matchedItem.item_id, label: matchedItem.itemName });
        setHsnSearchActive(false);
    };

    const handleEditItem = (item) => {
        setEditingItemId(item.id);

        let expMonth = item.expMonth || '';
        let expYear = item.expYear || '';
        if (item.expiry && (!expMonth || !expYear)) {
            const parts = item.expiry.split('-');
            if (parts.length >= 2) {
                expYear = parts[0];
                expMonth = parts[1];
            }
        }

        const masterItem = items.find(i => i.item_id === item.item_id);

        setCurrentItem({
            ...initialCurrentItemState,
            ...item,
            item_id: item.item_id || masterItem?.item_id || '',
            name: item.name || item.itemName || masterItem?.itemName || '',
            hsn: item.hsn || masterItem?.hsn || '',
            department: item.department || masterItem?.department || '',
            batch: item.batch || '',
            expMonth,
            expYear,
            expiry: item.expiry || '',
            packing: item.packing !== undefined ? item.packing : 1,
            no_of_unit: item.no_of_unit !== undefined ? item.no_of_unit : 1,
            quantity: item.quantity !== undefined ? item.quantity : 1,
            free: item.free !== undefined ? item.free : 0,
            itemValue: item.itemValue !== undefined ? item.itemValue : (item.baseAmount || 0),
            packingPrice: item.packingPrice || 0,
            unitPrice: item.unitPrice || 0,
            tax: item.tax !== undefined ? item.tax : ((item.cgstPercent || 0) * 2),
            purchaseTaxInclusive: item.purchaseTaxInclusive !== undefined ? item.purchaseTaxInclusive : true,
            purchaseDiscountPercent: item.purchaseDiscountPercent || 0,
            purchaseDiscountAmt: item.purchaseDiscountAmt || item.discountedAmt || 0,
            deductDiscountForTax: item.deductDiscountForTax || false,
            purchaseCost: item.purchaseCost || 0,
            mrp: item.mrp || 0,
            maxPackingMrp: item.maxPackingMrp || 0,
            sellingTax: item.sellingTax !== undefined ? item.sellingTax : 5,
            sellingTaxInclusive: item.sellingTaxInclusive !== undefined ? item.sellingTaxInclusive : true,
            sellingDiscountPercent: item.sellingDiscountPercent || 0,
            price: item.price || 0,
            ipPrice: item.ipPrice || 0,
            calcTaxOnFree: item.calcTaxOnFree || item.calculateTaxOnFree || false,
            isReplacement: item.isReplacement || false,
            totalStock: masterItem?.total_quantity ?? item.totalStock ?? 0,
            deptStock: masterItem?.approved_quantity ?? item.deptStock ?? 0
        });

        setShowAddItemModal(true);
    };

    const handleCloseItemModal = () => {
        setShowAddItemModal(false);
        setEditingItemId(null);
        setHsnSearchActive(false);
        setItemSearchText('');
        setCurrentItem(initialCurrentItemState);
    };

    const currPacking = parseFloat(currentItem.packing) || 1;
    const currNoOfUnit = parseFloat(currentItem.no_of_unit) || 1;
    const currQty = parseFloat(currentItem.quantity) || (currPacking * currNoOfUnit) || 1;
    const currItemValue = parseFloat(currentItem.itemValue) || 0;
    const currTaxPercent = parseFloat(currentItem.tax) || 0;
    const currDiscountPercent = parseFloat(currentItem.purchaseDiscountPercent) || 0;
    const currDiscountAmt = parseFloat(currentItem.purchaseDiscountAmt) || (currItemValue * (currDiscountPercent / 100));

    const currUnitPrice = currQty ? currItemValue / currQty : 0;
    const currPackingPrice = currNoOfUnit > 0 ? currItemValue / currNoOfUnit : (currUnitPrice * currPacking);

    const baseAfterDiscount = currentItem.deductDiscountForTax ? Math.max(0, currItemValue - currDiscountAmt) : currItemValue;
    const currTotalTax = baseAfterDiscount * (currTaxPercent / 100);

    const currCgstAmt = currTotalTax / 2;
    const currSgstAmt = currTotalTax / 2;

    const netBase = Math.max(0, currItemValue - currDiscountAmt);
    const currPurchaseCost = netBase + currTotalTax;
    const currUnitCost = currQty ? currPurchaseCost / currQty : 0;

    const currMrp = parseFloat(currentItem.mrp) || 0;
    const currMaxPackingMrp = parseFloat(currentItem.maxPackingMrp) || (currMrp * currPacking);
    const currSellingTax = parseFloat(currentItem.sellingTax) || 0;
    const baseSellingPrice = (currentItem.sellingTaxInclusive && currSellingTax > 0)
        ? (currMrp / (1 + currSellingTax / 100))
        : currMrp;
    const currSellingCgst = currMrp > 0 ? ((currMrp - baseSellingPrice) / 2) : 0;
    const currSellingSgst = currMrp > 0 ? ((currMrp - baseSellingPrice) / 2) : 0;

    const currSellingDisc = parseFloat(currentItem.sellingDiscountPercent) || 0;
    const defaultSellingPrice = baseSellingPrice > 0 ? (baseSellingPrice * (1 - currSellingDisc / 100)) : 0;
    const currSellingPrice = currentItem.price !== '' && currentItem.price !== undefined ? parseFloat(currentItem.price) : defaultSellingPrice;
    const currIpPrice = currentItem.ipPrice !== '' && currentItem.ipPrice !== undefined ? parseFloat(currentItem.ipPrice) : currSellingPrice;

    const currFreeQty = parseFloat(currentItem.free) || 0;
    const freeBase = currFreeQty * currUnitPrice;
    let currFreeTax = 0;
    if (currentItem.calcTaxOnFree && currTaxPercent > 0) {
        currFreeTax = freeBase * (currTaxPercent / 100);
    }
    const currFreeCgst = currFreeTax / 2;
    const currFreeSgst = currFreeTax / 2;

    const addItemToGrn = () => {
        if (!currentItem.item_id || !currQty || !currItemValue) {
            alert("Please fill required item details (Item, Quantity, Item Value)");
            return;
        }

        let formattedExpiry = currentItem.expiry || "";
        if (!formattedExpiry && currentItem.expMonth && currentItem.expYear) {
            const year = parseInt(currentItem.expYear);
            const month = parseInt(currentItem.expMonth);
            const lastDay = new Date(year, month, 0).getDate();
            formattedExpiry = `${year}-${currentItem.expMonth}-${lastDay.toString().padStart(2, '0')}`;
        }

        const newItem = {
            ...currentItem,
            id: editingItemId ? editingItemId : Date.now(),
            quantity: currQty,
            expiry: formattedExpiry,
            unitPrice: Number(currUnitPrice.toFixed(2)),
            unitCost: Number(currUnitCost.toFixed(2)),
            packingPrice: Number(currPackingPrice.toFixed(2)),
            cgstPercent: currTaxPercent / 2,
            sgstPercent: currTaxPercent / 2,
            cgstAmt: Number(currCgstAmt.toFixed(2)),
            sgstAmt: Number(currSgstAmt.toFixed(2)),
            discountedAmt: Number(currDiscountAmt.toFixed(2)),
            itemValue: Number(currItemValue.toFixed(2)),
            purchaseCost: Number(currPurchaseCost.toFixed(2)),
            baseAmount: Number(currItemValue.toFixed(2)),
            purchaseDiscountPercent: currDiscountPercent,
            mrp: Number(currMrp.toFixed(2)),
            maxPackingMrp: Number(currMaxPackingMrp.toFixed(2)),
            price: Number(currSellingPrice.toFixed(2)),
            ipPrice: Number(currIpPrice.toFixed(2)),
            sellingTax: currSellingTax,
            isReplacement: currentItem.isReplacement || false,
            calculateTaxOnFree: currentItem.calcTaxOnFree || false,
            freeTaxAmt: Number(currFreeTax.toFixed(2))
        };

        // Auto-save HSN to item master if provided/updated
        if (currentItem.item_id && currentItem.hsn && currentItem.hsn.trim()) {
            const trimmedHsn = currentItem.hsn.trim();
            const originalItem = items.find(i => i.item_id === currentItem.item_id);
            if (originalItem && originalItem.hsn !== trimmedHsn) {
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/${currentItem.item_id}/`, 'PATCH', {
                    hsn: trimmedHsn
                }).then(res => {
                    if (res?.success) {
                        setItems(prev => prev.map(it => it.item_id === currentItem.item_id ? { ...it, hsn: trimmedHsn } : it));
                    }
                }).catch(() => {});
            }
        }

        if (editingItemId) {
            setGrnItems(grnItems.map(item => item.id === editingItemId ? newItem : item));
            setEditingItemId(null);
        } else {
            setGrnItems([...grnItems, newItem]);
        }
        setCurrentItem(initialCurrentItemState);
        setShowAddItemModal(false);
    };

    const removeItem = (id) => {
        setGrnItems(grnItems.filter(item => item.id !== id));
        if (editingItemId === id) {
            handleCloseItemModal();
        }
    };

    const totals = React.useMemo(() => {
        let taxable = 0;
        let nonTaxable = 0;
        let cgst = 0;
        let sgst = 0;
        let totalDiscount = 0;
        let taxOnFreeItems = 0;

        grnItems.forEach(item => {
            const baseValue = parseFloat(item.itemValue) || 0;
            const taxPercent = parseFloat(item.tax) || 0;
            const discount = parseFloat(item.discountedAmt) || 0;
            const isInclusive = item.purchaseTaxInclusive !== false;
            const itemCgst = parseFloat(item.cgstAmt) || 0;
            const itemSgst = parseFloat(item.sgstAmt) || 0;
            const itemTax = itemCgst + itemSgst;

            totalDiscount += discount;

            const netVal = Math.max(0, baseValue - discount);
            if (taxPercent > 0) {
                taxable += netVal;
                cgst += itemCgst;
                sgst += itemSgst;
            } else {
                nonTaxable += Math.max(0, baseValue - discount);
            }

            if (item.calculateTaxOnFree) {
                taxOnFreeItems += parseFloat(item.freeTaxAmt) || 0;
            }
        });

        const igst = parseFloat(formData.igst) || 0;
        const cess = parseFloat(formData.cess) || 0;
        const cst = parseFloat(formData.central_sales_tax) || 0;
        const transport = parseFloat(formData.courier_transport_charge) || 0;

        const rawRoundAmount = Math.abs(parseFloat(formData.round_amount) || 0);
        const signedRoundAmount = formData.round_type === 'subtract' ? -rawRoundAmount : rawRoundAmount;

        let totalAmountObj = taxable + nonTaxable + cgst + sgst + igst + cess + cst + transport + taxOnFreeItems;
        const netInvoiceAmount = Number((totalAmountObj + signedRoundAmount).toFixed(2));

        return {
            taxable_amount: Number(taxable.toFixed(2)),
            non_taxable_amount: Number(nonTaxable.toFixed(2)),
            cgst: Number(cgst.toFixed(2)),
            sgst: Number(sgst.toFixed(2)),
            tax_on_free_items: Number(taxOnFreeItems.toFixed(2)),
            total_discount: Number(totalDiscount.toFixed(2)),
            total_amount: Number(totalAmountObj.toFixed(2)),
            round_amount: signedRoundAmount,
            net_invoice_amount: netInvoiceAmount
        };
    }, [grnItems, formData.igst, formData.cess, formData.central_sales_tax, formData.courier_transport_charge, formData.round_amount, formData.round_type]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (grnItems.length === 0) {
            alert("Please add at least one item to generate GRN");
            return;
        }

        if (!formData.department) {
            alert("Please select a Department");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                items: grnItems,
                // The totals export contains the true signed round_amount which safely overwrites formData.round_amount
                ...totals,
            };

            // Optional: Delete round_type since the backend doesn't expect it
            delete payload.round_type;

            if (editGrn) {
                let existingPayments = editGrn.payment_status;
                if (typeof existingPayments === 'string') {
                    try { existingPayments = JSON.parse(existingPayments); } catch (e) { existingPayments = []; }
                }

                const totalPaid = editGrn.total_amount_paid?.$numberDecimal || editGrn.total_amount_paid || 0;
                payload.total_amount_paid = totalPaid;

                let paymentArray = existingPayments || [];

                if (paymentArray.length > 0) {
                    const latestRecord = { ...paymentArray[paymentArray.length - 1] };
                    const newPending = totals.net_invoice_amount - parseFloat(totalPaid);

                    latestRecord.pending_amount = newPending > 0 ? newPending : 0;

                    if (newPending <= 0 && totalPaid > 0) {
                        latestRecord.status = "Paid";
                    } else if (totalPaid > 0) {
                        latestRecord.status = "Partially Paid";
                    } else {
                        latestRecord.status = "Not Paid";
                    }

                    paymentArray[paymentArray.length - 1] = latestRecord;
                }

                payload.payment_status = paymentArray;
            }

            if (payload.due_date === '') payload.due_date = null;
            if (payload.invoice_date === '') payload.invoice_date = null;
            if (payload.date === '') payload.date = null;

            const method = editGrn ? 'PATCH' : 'POST';
            const endpoint = editGrn
                ? `${getBaseUrl.replace(/\/$/, '')}/stores-grn/${editGrn.grn_number}/`
                : `${getBaseUrl.replace(/\/$/, '')}/stores-grn/`;

            const response = await apiRequest(endpoint, method, payload);

            if (response.success) {
                alert(`GRN ${editGrn ? 'Updated' : 'Generated'} Successfully! GRN Number: ${response.data.grn_number}`);

                if (editGrn) {
                    navigate('/StoresGRNReport');
                    return;
                }
                setFormData({
                    ...formData,
                    department: '',
                    invoice_no: '',
                    remarks: '',
                    round_type: 'add',
                    round_amount: 0
                });
                setGrnItems([]);
            } else {
                alert("Error generating GRN: " + JSON.stringify(response.error));
            }
        } catch (error) {
            console.error("Error saving GRN:", error);
            alert("Error saving GRN");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItemMaster = async () => {
        if (!newItemMasterData.itemName || !newItemMasterData.department || !newItemMasterData.category || !newItemMasterData.group || !newItemMasterData.stockReorderLevel) {
            alert("Please fill all required fields marked with *");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...newItemMasterData,
                unit_price: 0,
                stockReorderLevel: String(newItemMasterData.stockReorderLevel || 0),
                total_quantity: Number(newItemMasterData.total_quantity) || 0,
                approved_quantity: Number(newItemMasterData.approved_quantity) || 0,
                group: newItemMasterData.group,
                group_code: newItemMasterData.group,
                category: newItemMasterData.category,
                category_code: newItemMasterData.category
            };
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/`, 'POST', payload);
            if (response.success) {
                alert("New Item Master Added Successfully!");
                setShowAddItemMasterModal(false);
                fetchItemsByDepartment(formData.department);
                if (response.data) {
                    setCurrentItem(prev => ({
                        ...prev,
                        item_id: response.data.item_id,
                        name: response.data.itemName,
                        hsn: response.data.hsn || ''
                    }));
                }
                setNewItemMasterData({
                    itemName: '',
                    department: '',
                    category: '',
                    group: '',
                    group_type: '',
                    hsn: '',
                    stockReorderLevel: '',
                    total_quantity: 0,
                    approved_quantity: 0
                });
            } else {
                const errDetail = response.error || (response.data && typeof response.data === 'object' ? Object.entries(response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : 'Bad Request');
                alert("Failed to add Item Master: " + errDetail);
            }
        } catch (error) {
            console.error("Error saving Item Master:", error);
            alert("Error saving Item Master: " + (error?.message || 'Network error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1e3a8a',
                    borderRadius: 12,
                    colorLink: '#1e3a8a',
                    colorLinkHover: '#2563eb',
                },
                components: {
                    DatePicker: {
                        headerBg: '#1e3a8a',
                        colorTextHeading: '#ffffff',
                        colorIcon: '#ffffff',
                        colorIconHover: 'rgba(255, 255, 255, 0.8)',
                    }
                }
            }}
        >
            <CalendarGlobalStyles />
            <PageWrapper>
                <Container style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                    {/* 1. Glass Header */}
                    <GlassHeader>
                        <div>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                                {editGrn ? `Edit GRN: ${editGrn.grn_number}` : 'New GRN Generation'}
                            </h2>
                            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: '500' }}>
                                {editGrn ? 'Update the Goods Receipt Note details below' : 'Streamline your inventory intake process'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Button
                                type="button"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.22)',
                                    color: '#ffffff',
                                    border: '1.5px solid rgba(255, 255, 255, 0.5)',
                                    backdropFilter: 'blur(10px)',
                                    fontWeight: '700',
                                    padding: '8px 18px',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate('/StoresGRNReport')}
                                title="Open GRN Reports & Analysis Dashboard"
                            >
                                📊 GRN Reports & Analysis
                            </Button>
                            {location.state?.fromAnalysis && (
                                <Button
                                    secondary
                                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', fontWeight: '600' }}
                                    onClick={() => navigate('/StoresGRNReport')}
                                >
                                    ← Back to Report
                                </Button>
                            )}
                        </div>
                    </GlassHeader>

                    {/* 2. Main Form Content */}
                    <form onSubmit={handleSubmit} style={{ background: colors.background, padding: '24px' }}>

                        {/* Purchase, Invoice & Supplier Details - Single Unified Card */}
                        <FormCard style={{ marginBottom: '18px' }}>
                            <SectionTitleCard style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Purchase, Invoice & Supplier Details
                                </h3>
                                {!isVerified && (
                                    <span
                                        onClick={() => { setVendorSearchQuery(''); setShowVendorListModal(true); }}
                                        style={{
                                            color: '#0d9488',
                                            fontSize: '0.78rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '4px 12px',
                                            background: '#f0fdfa',
                                            border: '1px solid #99f6e4',
                                            borderRadius: '6px',
                                            transition: 'all 0.15s ease'
                                        }}
                                        title="Open Vendor Directory Modal"
                                    >
                                        📋 Browse Supplier List
                                    </span>
                                )}
                            </SectionTitleCard>

                            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Row 1: 1. Department, 2. Category, 3. Vendor */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}>
                                    {/* 1. Department */}
                                    <div style={{ gridColumn: 'span 4' }}>
                                        <Label required style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>Department</span>
                                            <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>F10</span>
                                        </Label>
                                        <div
                                            onClick={() => {
                                                if (!isVerified) {
                                                    setShowDeptModal(true);
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                height: '34px',
                                                padding: '0 10px',
                                                borderRadius: '6px',
                                                border: `1px solid ${formData.department ? '#0d9488' : colors.border}`,
                                                backgroundColor: isVerified ? '#f1f5f9' : (formData.department ? '#f0fdfa' : '#ffffff'),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: isVerified ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.15s ease',
                                                boxSizing: 'border-box'
                                            }}
                                            title={isVerified ? 'Department locked' : 'Click to switch department (F10)'}
                                        >
                                            <div style={{
                                                flex: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.85rem',
                                                color: formData.department ? '#0f172a' : '#94a3b8',
                                                fontWeight: formData.department ? '600' : 'normal',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <Building2 size={14} color={formData.department ? '#0d9488' : '#94a3b8'} style={{ flexShrink: 0 }} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {(() => {
                                                        if (!formData.department) return 'All Departments';
                                                        const found = departments.find(d =>
                                                            String(d.department_id) === String(formData.department) ||
                                                            String(d.id) === String(formData.department) ||
                                                            String(d.department_name).toLowerCase() === String(formData.department).toLowerCase() ||
                                                            String(d.name).toLowerCase() === String(formData.department).toLowerCase()
                                                        );
                                                        return found ? (found.department_name || found.name) : formData.department;
                                                    })()}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                                <span style={{
                                                    fontSize: '0.68rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: formData.department ? '#ccfbf1' : '#f1f5f9',
                                                    color: formData.department ? '#0f766e' : '#64748b',
                                                    fontWeight: '700'
                                                }}>
                                                    Switch
                                                </span>
                                                {formData.department && !isVerified && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleInputChange({ target: { name: 'department', value: '' } });
                                                            setSelectedStoreDepartment('', 'All Departments');
                                                        }}
                                                        title="Clear selected department"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#94a3b8',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            fontSize: '12px',
                                                            lineHeight: 1,
                                                            borderRadius: '4px'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Category */}
                                    <div style={{ gridColumn: 'span 4' }}>
                                        <Label required>Category</Label>
                                        <Select
                                            options={purchaseCategories}
                                            value={purchaseCategories.find(c => c.value === formData.purchase_category)}
                                            onChange={(opt) => handleInputChange({ target: { name: 'purchase_category', value: opt ? opt.value : '' } })}
                                            menuPortalTarget={document.body}
                                            isDisabled={isVerified}
                                            styles={{
                                                menuPortal: base => ({ ...base, zIndex: 99999 }),
                                                control: base => ({
                                                    ...base,
                                                    minHeight: '34px',
                                                    height: '34px',
                                                    borderRadius: '6px',
                                                    borderColor: colors.border
                                                })
                                            }}
                                        />
                                    </div>

                                    {/* 3. Vendor */}
                                    <div style={{ gridColumn: 'span 4' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <Label required style={{ margin: 0 }}>Vendor</Label>
                                            {!isVerified && (
                                                <span
                                                    onClick={() => setShowAddVendorModal(true)}
                                                    style={{
                                                        color: '#0d9488',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        background: '#f0fdfa',
                                                        border: '1px solid #99f6e4'
                                                    }}
                                                    title="Add new vendor"
                                                >
                                                    + Add New Vendor
                                                </span>
                                            )}
                                        </div>
                                        <Select
                                            options={vendorOptions}
                                            value={vendorOptions.find(o => o.value === formData.vendor_id) || null}
                                            onChange={(opt) => {
                                                if (opt && opt.vendor) {
                                                    const v = opt.vendor;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        vendor_id: v.vendor_id,
                                                        supplier_address: getFullVendorAddress(v),
                                                        contact_person: v.contact_person || v.contactPerson || '',
                                                        phone: v.phone || ''
                                                    }));
                                                } else {
                                                    handleClearVendor();
                                                }
                                            }}
                                            placeholder="Select Vendor..."
                                            isClearable
                                            isDisabled={isVerified}
                                            menuPortalTarget={document.body}
                                            styles={{
                                                menuPortal: base => ({ ...base, zIndex: 99999 }),
                                                control: base => ({
                                                    ...base,
                                                    minHeight: '34px',
                                                    height: '34px',
                                                    borderRadius: '6px',
                                                    borderColor: colors.border
                                                })
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: 4. Phone Number, 5. Contact Person, 6. Office Address */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}>
                                    {/* 4. Phone Number */}
                                    <div style={{ gridColumn: 'span 3' }}>
                                        <Label>Phone Number</Label>
                                        <Input
                                            value={formData.phone}
                                            readOnly
                                            style={{ backgroundColor: '#f8fafc', height: '34px' }}
                                            placeholder="Vendor Phone"
                                        />
                                    </div>

                                    {/* 5. Contact Person */}
                                    <div style={{ gridColumn: 'span 3' }}>
                                        <Label>Contact Person</Label>
                                        <Input
                                            value={formData.contact_person}
                                            readOnly
                                            style={{ backgroundColor: '#f8fafc', height: '34px' }}
                                            placeholder="Contact Person"
                                        />
                                    </div>

                                    {/* 6. Office Address */}
                                    <div style={{ gridColumn: 'span 6' }}>
                                        <Label>Office Address</Label>
                                        <Input
                                            value={(() => {
                                                if (formData.supplier_address) return formData.supplier_address;
                                                const v = vendors.find(item => item.vendor_id === formData.vendor_id);
                                                return v ? getFullVendorAddress(v) : '';
                                            })()}
                                            readOnly
                                            style={{ backgroundColor: '#f8fafc', height: '34px' }}
                                            placeholder="Office / Vendor Address"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: 7. GRN Date, 8. Invoice No, 9. Invoice Date, 10. Credit (Days), 11. Payment Mode */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}>
                                    {/* 7. GRN Date */}
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label required>GRN Date</Label>
                                        <DatePicker
                                            value={formData.date ? dayjs(formData.date) : null}
                                            onChange={(d) => handleInputChange({ target: { name: 'date', value: d ? d.format('YYYY-MM-DD') : '' } })}
                                            format="DD/MM/YYYY"
                                            placeholder="Select Date"
                                            allowClear={false}
                                            disabled={isVerified}
                                            style={{ width: '100%', borderRadius: '6px', border: `1px solid ${colors.border}`, height: '34px' }}
                                        />
                                    </div>

                                    {/* 8. Invoice No */}
                                    <div style={{ gridColumn: 'span 3' }}>
                                        <Label required>Invoice No</Label>
                                        <Input
                                            placeholder="EX: INV-1001"
                                            name="invoice_no"
                                            value={formData.invoice_no}
                                            onChange={handleInputChange}
                                            disabled={isVerified}
                                            style={{ height: '34px' }}
                                        />
                                    </div>

                                    {/* 9. Invoice Date */}
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label required>Invoice Date</Label>
                                        <DatePicker
                                            value={formData.invoice_date ? dayjs(formData.invoice_date) : null}
                                            onChange={(d) => handleInputChange({ target: { name: 'invoice_date', value: d ? d.format('YYYY-MM-DD') : '' } })}
                                            format="DD/MM/YYYY"
                                            placeholder="Select Date"
                                            allowClear={false}
                                            disabled={isVerified}
                                            style={{ width: '100%', borderRadius: '6px', border: `1px solid ${colors.border}`, height: '34px' }}
                                        />
                                    </div>

                                    {/* 10. Credit (Days) */}
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label>Credit (Days)</Label>
                                        <Input
                                            name="credit_period"
                                            value={formData.credit_period}
                                            onChange={handleInputChange}
                                            disabled={isVerified}
                                            style={{ height: '34px' }}
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* 11. Payment Mode */}
                                    <div style={{ gridColumn: 'span 3' }}>
                                        <Label>Payment Mode</Label>
                                        <Select
                                            options={paymentModes}
                                            value={paymentModes.find(m => m.value === formData.payment_mode)}
                                            onChange={(opt) => handleInputChange({ target: { name: 'payment_mode', value: opt ? opt.value : '' } })}
                                            menuPortalTarget={document.body}
                                            isDisabled={isVerified}
                                            styles={{
                                                menuPortal: base => ({ ...base, zIndex: 99999 }),
                                                control: base => ({
                                                    ...base,
                                                    minHeight: '34px',
                                                    height: '34px',
                                                    borderRadius: '6px',
                                                    borderColor: colors.border
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormCard>

                        {/* 3. Items Management Section */}
                        <FormCard style={{ marginTop: '5px' }}>
                            <SectionTitleCard $bg="linear-gradient(to right, #f0fdfa, white)">
                                <h3>Items Collection ({grnItems.length})</h3>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setEditingItemId(null);
                                        setCurrentItem(initialCurrentItemState);
                                        setShowAddItemModal(true);
                                    }}
                                    disabled={isVerified}
                                    style={{ padding: '6px 16px', boxShadow: '0 4px 6px rgba(13, 148, 136, 0.2)', opacity: isVerified ? 0.6 : 1, cursor: isVerified ? 'not-allowed' : 'pointer' }}
                                >
                                    + Add Stock Item
                                </Button>
                            </SectionTitleCard>

                            <ItemTableWrapper>
                                <Table>
                                    <thead>
                                        <Tr style={{ background: `linear-gradient(90deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)` }}>
                                            {['Sl.No', 'Description', 'HSN', 'Batch', 'Packing', 'Qty', 'Free', 'Expiry', 'MRP', 'S.Rate', 'CGST%', 'CGST₹', 'SGST%', 'SGST₹', 'Total Value', 'Action'].map(h => (
                                                <Th key={h} style={{
                                                    color: 'white',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    padding: '12px 10px',
                                                    fontWeight: '700',
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    textAlign: ['Sl.No', 'HSN', 'Action'].includes(h) ? 'center' : ['MRP', 'S.Rate', 'CGST₹', 'SGST₹', 'Total Value'].includes(h) ? 'right' : 'left'
                                                }}>{h}</Th>
                                            ))}
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {grnItems.map((item, index) => (
                                            <Tr key={item.id} style={{ background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                                                <Td style={{ textAlign: 'center', width: '50px' }}>{index + 1}</Td>
                                                <Td style={{ fontWeight: '600', color: colors.primaryDark }}>
                                                    <div>{item.name || item.itemName}</div>
                                                    
                                                </Td>
                                                <Td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>{item.hsn || '-'}</Td>
                                                <Td>{item.batch || '-'}</Td>
                                                <Td>{item.packing}</Td>
                                                <Td style={{ textAlign: 'center', fontWeight: '500' }}>{item.quantity}</Td>
                                                <Td style={{ textAlign: 'center' }}>{item.free}</Td>
                                                <Td>{formatExpiryDisplay(item.expiry, item.expMonth, item.expYear)}</Td>
                                                <Td style={{ textAlign: 'right', color: '#64748b' }}>₹{parseFloat(item.mrp || 0).toFixed(2)}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '500' }}>₹{parseFloat(item.unitPrice || 0).toFixed(2)}</Td>
                                                <Td style={{ textAlign: 'center' }}>{item.cgstPercent}%</Td>
                                                <Td style={{ textAlign: 'right' }}>₹{parseFloat(item.cgstAmt || 0).toFixed(2)}</Td>
                                                <Td style={{ textAlign: 'center' }}>{item.sgstPercent}%</Td>
                                                <Td style={{ textAlign: 'right' }}>₹{parseFloat(item.sgstAmt || 0).toFixed(2)}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: '700', color: colors.primary }}>₹{parseFloat(item.itemValue || 0).toFixed(2)}</Td>
                                                <Td style={{ textAlign: 'center', width: '75px', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => !isVerified && handleEditItem(item)}
                                                            disabled={isVerified}
                                                            title="Edit Item"
                                                            style={{
                                                                color: '#0d9488',
                                                                background: '#f0fdfa',
                                                                border: '1px solid #99f6e4',
                                                                borderRadius: '4px',
                                                                padding: '3px 7px',
                                                                cursor: isVerified ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.2s',
                                                                opacity: isVerified ? 0.3 : 1,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.85rem'
                                                            }}
                                                            onMouseOver={e => !isVerified && (e.currentTarget.style.background = '#ccfbf1')}
                                                            onMouseOut={e => !isVerified && (e.currentTarget.style.background = '#f0fdfa')}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => !isVerified && removeItem(item.id)}
                                                            disabled={isVerified}
                                                            title="Delete Item"
                                                            style={{
                                                                color: '#ef4444',
                                                                background: '#fef2f2',
                                                                border: '1px solid #fecaca',
                                                                borderRadius: '4px',
                                                                padding: '3px 7px',
                                                                cursor: isVerified ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.2s',
                                                                opacity: isVerified ? 0.3 : 1,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.85rem'
                                                            }}
                                                            onMouseOver={e => !isVerified && (e.currentTarget.style.background = '#fee2e2')}
                                                            onMouseOut={e => !isVerified && (e.currentTarget.style.background = '#fef2f2')}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </Td>
                                            </Tr>
                                        ))}
                                        {grnItems.length === 0 && (
                                            <Tr>
                                                <Td colSpan={16} style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
                                                    <div style={{ opacity: 0.5, marginBottom: '10px' }}>
                                                        <span style={{ fontSize: '3rem' }}>📦</span>
                                                    </div>
                                                    <div style={{ fontSize: '1rem', fontWeight: '500' }}>Your inventory bucket is empty</div>
                                                    <div style={{ fontSize: '0.85rem' }}>Click "Add Stock Item" to populate this GRN</div>
                                                </Td>
                                            </Tr>
                                        )}
                                    </tbody>
                                </Table>
                            </ItemTableWrapper>
                        </FormCard>

                        {/* 4. Financial Summary Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.8fr)', gap: '20px', marginBottom: '20px' }}>
                            <StatsCard style={{ height: '100%' }}>
                                <SectionTitleCard $bg="transparent" style={{ padding: '0 0 10px 0', marginBottom: '8px' }}>
                                    <h3>Total Calculations</h3>
                                </SectionTitleCard>
                                <SummaryRow>
                                    <span className="label">Non Taxable Base</span>
                                    <span className="value">₹{totals.non_taxable_amount.toFixed(2)}</span>
                                </SummaryRow>
                                <SummaryRow>
                                    <span className="label">Taxable Base</span>
                                    <span className="value">₹{totals.taxable_amount.toFixed(2)}</span>
                                </SummaryRow>
                                <SummaryRow>
                                    <span className="label">Applied Discount</span>
                                    <span className="value danger">- ₹{totals.total_discount.toFixed(2)}</span>
                                </SummaryRow>
                                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                                    <SectionTitleCard $bg="transparent" style={{ padding: '10px 0', marginBottom: '8px' }}>
                                        <h3>Free Items Tax</h3>
                                    </SectionTitleCard>
                                    <SummaryRow>
                                        <span className="label">Tax on Free Items</span>
                                        <span className="value">₹{totals.tax_on_free_items.toFixed(2)}</span>
                                    </SummaryRow>
                                </div>
                            </StatsCard>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <StatsCard>
                                    <SectionTitleCard $bg="transparent" style={{ padding: '0 0 10px 0', marginBottom: '8px' }}>
                                        <h3>Tax Component Breakdown</h3>
                                    </SectionTitleCard>
                                    <SummaryRow>
                                        <span className="label">Total CGST (A)</span>
                                        <span className="value">₹{totals.cgst.toFixed(2)}</span>
                                    </SummaryRow>
                                    <SummaryRow>
                                        <span className="label">Total SGST (B)</span>
                                        <span className="value">₹{totals.sgst.toFixed(2)}</span>
                                    </SummaryRow>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                                        <div>
                                            <Label style={{ fontSize: '0.7rem' }}>IGST OFFSET</Label>
                                            <Input
                                                name="igst"
                                                value={formData.igst}
                                                onChange={handleInputChange}
                                                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                        <div>
                                            <Label style={{ fontSize: '0.7rem' }}>CESS / OTHER</Label>
                                            <Input
                                                name="cess"
                                                value={formData.cess}
                                                onChange={handleInputChange}
                                                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>
                                </StatsCard>

                                <NetPayableCard>
                                    <span className="label">Final Invoice Value</span>
                                    <span className="value">₹{totals.net_invoice_amount.toFixed(2)}</span>

                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>ROUND OFF:</span>

                                        <select
                                            name="round_type"
                                            value={formData.round_type}
                                            onChange={handleInputChange}
                                            disabled={isVerified}
                                            style={{
                                                padding: '2px 4px',
                                                fontSize: '0.8rem',
                                                borderRadius: '4px',
                                                border: '1px solid white',
                                                color: 'black',
                                                background: 'white',
                                                cursor: isVerified ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <option value="add">(+) Add</option>
                                            <option value="subtract">(-) Subtract</option>
                                        </select>

                                        <Input
                                            name="round_amount"
                                            value={formData.round_amount}
                                            onChange={handleInputChange}
                                            disabled={isVerified}
                                            style={{
                                                width: '60px',
                                                padding: '2px 6px',
                                                fontSize: '0.85rem',
                                                color: 'black',
                                                borderRadius: '4px',
                                                border: '1px solid white'
                                            }}
                                        />
                                    </div>
                                </NetPayableCard>
                            </div>
                        </div>

                        {/* Remarks & Completion */}
                        <FormCard style={{ marginBottom: 0 }}>
                            <div style={{ padding: '20px' }}>
                                <Label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '1rem' }}>📝</span> Operational Internal Remarks
                                </Label>
                                <textarea
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                    disabled={isVerified}
                                    placeholder={isVerified ? "Remarks are locked for verified GRNs" : "Add specific notes about this shipment, quality checks, or vendor comments..."}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        border: `1px solid ${colors.border}`,
                                        fontFamily: 'inherit',
                                        fontSize: '0.9rem',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        backgroundColor: isVerified ? '#f8fafc' : 'white'
                                    }}
                                />
                            </div>
                            <ActionFooter>
                                <Button
                                    type="button"
                                    secondary
                                    onClick={() => editGrn ? navigate('/StoresGRNReport') : setGrnItems([])}
                                    style={{ padding: '10px 25px' }}
                                >
                                    {editGrn ? 'Discard Changes' : 'Reset Form'}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || isVerified}
                                    style={{ padding: '10px 40px', fontSize: '1rem', boxShadow: isVerified ? 'none' : `0 10px 15px -3px rgba(13, 148, 136, 0.3)`, opacity: isVerified ? 0.6 : 1, cursor: isVerified ? 'not-allowed' : 'pointer' }}
                                >
                                    {loading ? 'Processing...' : (isVerified ? 'Record Verified (Read Only)' : (editGrn ? 'Update GRN Record' : 'Finalize & Post GRN'))}
                                </Button>
                            </ActionFooter>
                        </FormCard>
                    </form>
                </Container>

                {/* Vendor List Modal */}
                                {showDeptModal && (
                    <DepartmentSelectionModal
                        departments={departments}
                        currentDepartmentId={formData.department}
                        onClose={() => setShowDeptModal(false)}
                        onSelect={(dept) => {
                            const val = dept ? (dept.department_id || dept.department_code || '') : '';
                            const lbl = dept ? (dept.department_name || val) : '';
                            handleInputChange({ target: { name: 'department', value: val } });
                            setSelectedStoreDepartment(val, lbl);
                            setShowDeptModal(false);
                        }}
                    />
                )}

                {showVendorListModal && (() => {
                    const q = (vendorSearchQuery || '').toLowerCase().trim();
                    const filteredVendors = vendors
                        .filter(v => {
                            if (!q) return true;
                            const name = (v.name || v.vendor_name || '').toLowerCase();
                            const code = (v.vendor_id || '').toLowerCase();
                            const contact = (v.contactPerson || v.contact_person || '').toLowerCase();
                            const phone = (v.phone || '').toLowerCase();
                            const gstin = (v.gstin || '').toLowerCase();
                            const city = (v.city || '').toLowerCase();
                            return name.includes(q) || code.includes(q) || contact.includes(q) || phone.includes(q) || gstin.includes(q) || city.includes(q);
                        })
                        .map(v => {
                            if (!q) return { ...v, _score: 0 };
                            const name = (v.name || v.vendor_name || '').toLowerCase();
                            let score = 99;
                            if (name === q) score = 0;
                            else if (name.startsWith(q)) score = 1;
                            else if (name.split(/\s+/).some(w => w.startsWith(q))) score = 2;
                            else if (name.includes(q)) score = 3;
                            else score = 4;
                            return { ...v, _score: score };
                        })
                        .sort((a, b) => {
                            if (q && a._score !== b._score) return a._score - b._score;
                            const nameA = a.name || a.vendor_name || '';
                            const nameB = b.name || b.vendor_name || '';
                            return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
                        });

                    return (
                        <ModalOverlay onClick={e => e.target === e.currentTarget && setShowVendorListModal(false)} style={{ zIndex: 10000 }}>
                            <ModalContainerAnimated style={{ maxWidth: '980px', width: '95vw', maxHeight: '90vh', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <ModalHeader style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <ModalTitle style={{ color: 'white', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            🏢 Vendor Directory
                                            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.25)', padding: '2px 10px', borderRadius: '12px', fontWeight: '600' }}>
                                                {vendors.length} Total
                                            </span>
                                        </ModalTitle>
                                        <div style={{ fontSize: '0.78rem', color: '#ccfbf1', marginTop: '3px' }}>
                                            Search and select a vendor for this Goods Receipt Note
                                        </div>
                                    </div>
                                    <CloseButton style={{ color: 'white', fontSize: '1.3rem' }} onClick={() => setShowVendorListModal(false)}>✕</CloseButton>
                                </ModalHeader>

                                <ModalBody style={{ padding: '20px 24px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflow: 'hidden' }}>
                                    {/* Search Bar */}
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <input
                                                type="text"
                                                autoFocus
                                                value={vendorSearchQuery}
                                                onChange={(e) => setVendorSearchQuery(e.target.value)}
                                                placeholder="Search by Vendor Name, Code / ID, Contact Person, Phone, GSTIN, City..."
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 38px 10px 14px',
                                                    borderRadius: '8px',
                                                    border: '1.5px solid #cbd5e1',
                                                    fontSize: '0.9rem',
                                                    outline: 'none',
                                                    background: '#ffffff',
                                                    color: '#0f172a',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            {vendorSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setVendorSearchQuery('')}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: '#94a3b8',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '11px'
                                                    }}
                                                >✕</button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                            Showing <strong>{filteredVendors.length}</strong> of {vendors.length}
                                        </div>
                                    </div>

                                    {/* Vendor Table */}
                                    <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                                <tr style={{ background: '#f0fdfa', borderBottom: '2px solid #0d9488' }}>
                                                    <th style={{ padding: '10px 8px', textAlign: 'center', width: '35px', color: '#0f766e', fontWeight: '700' }}>#</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', width: '110px', color: '#0f766e', fontWeight: '700' }}>Code / ID</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#0f766e', fontWeight: '700' }}>Vendor Name</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#0f766e', fontWeight: '700' }}>Contact Person</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#0f766e', fontWeight: '700' }}>Phone</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#0f766e', fontWeight: '700' }}>GSTIN</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', color: '#0f766e', fontWeight: '700' }}>City / State</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'center', width: '110px', color: '#0f766e', fontWeight: '700' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredVendors.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                                                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                                                            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#334155' }}>No vendors found</div>
                                                            <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                                                                {vendorSearchQuery ? `No vendor matches "${vendorSearchQuery}"` : 'No vendors registered in the system.'}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredVendors.map((v, idx) => {
                                                        const isSelected = v.vendor_id === formData.vendor_id;
                                                        const location = [v.city, v.state].filter(Boolean).join(', ') || '—';
                                                        return (
                                                            <tr
                                                                key={v.vendor_id || idx}
                                                                onClick={() => handleSelectVendorFromModal(v)}
                                                                style={{
                                                                    borderBottom: '1px solid #f1f5f9',
                                                                    background: isSelected ? '#f0fdfa' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                                    cursor: 'pointer',
                                                                    transition: 'background 0.15s'
                                                                }}
                                                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f5f9'; }}
                                                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'; }}
                                                            >
                                                                <td style={{ padding: '10px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>{idx + 1}</td>
                                                                <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0d9488', fontFamily: 'monospace' }}>
                                                                    {v.vendor_id || '—'}
                                                                </td>
                                                                <td style={{ padding: '10px 14px' }}>
                                                                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{v.name || v.vendor_name || '—'}</div>
                                                                    {v.addressLine1 && (
                                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                            {v.addressLine1}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '10px 12px', color: '#334155' }}>
                                                                    {v.contactPerson || v.contact_person || '—'}
                                                                </td>
                                                                <td style={{ padding: '10px 12px', color: '#334155', fontWeight: '500' }}>
                                                                    {v.phone || '—'}
                                                                </td>
                                                                <td style={{ padding: '10px 12px', color: '#475569', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                                                    {v.gstin || '—'}
                                                                </td>
                                                                <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                                                    {location}
                                                                </td>
                                                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                    {isSelected ? (
                                                                        <span style={{
                                                                            background: '#0d9488',
                                                                            color: 'white',
                                                                            padding: '4px 10px',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '700',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '3px'
                                                                        }}>
                                                                            ✓ Selected
                                                                        </span>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); handleSelectVendorFromModal(v); }}
                                                                            style={{
                                                                                background: '#ffffff',
                                                                                color: '#0d9488',
                                                                                border: '1.5px solid #0d9488',
                                                                                padding: '4px 12px',
                                                                                borderRadius: '6px',
                                                                                fontSize: '0.78rem',
                                                                                fontWeight: '700',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.15s'
                                                                            }}
                                                                            onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = '#ffffff'; }}
                                                                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#0d9488'; }}
                                                                        >
                                                                            Select
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer Actions */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {formData.vendor_id ? (
                                                <span>Current Selection: <strong style={{ color: '#0d9488' }}>{vendors.find(v => v.vendor_id === formData.vendor_id)?.name || formData.vendor_id}</strong> </span>
                                            ) : (
                                                <span>No vendor selected yet</span>
                                            )}
                                        </div>
                                        <Button secondary onClick={() => setShowVendorListModal(false)} style={{ padding: '8px 24px' }}>
                                            Close
                                        </Button>
                                    </div>
                                </ModalBody>
                            </ModalContainerAnimated>
                        </ModalOverlay>
                    );
                })()}

                {/* 7. Enhanced Add Item Modal */}
                {showAddItemModal && (
                    <ModalOverlay onClick={e => e.target === e.currentTarget && handleCloseItemModal()}>
                        <ModalContainerAnimated style={{ maxWidth: '1150px', width: '95vw', borderRadius: '12px', overflow: 'hidden' }}>
                            <ModalHeader style={{ background: '#1b7a70', color: 'white', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <ModalTitle style={{ color: 'white', fontSize: '1.15rem', fontWeight: '700', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {editingItemId ? '✏️ Edit Catalog Item' : 'GST Purchase'}
                                </ModalTitle>
                                <CloseButton style={{ color: 'white', fontSize: '1.2rem' }} onClick={handleCloseItemModal}>✕</CloseButton>
                            </ModalHeader>
                            <ModalBody style={{ padding: '20px 24px', background: '#ffffff', maxHeight: '85vh', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '22px' }}>
                                    {/* ── LEFT COLUMN ── */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* 1. Item Name (without Purchase Order field) */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CompactLabel required style={{ margin: 0 }}>Item Name</CompactLabel>
                                                    {formData.department ? (
                                                        <span style={{ fontSize: '0.72rem', color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                                            Dept: {departments.find(d => String(d.department_id) === String(formData.department) || String(d.id) === String(formData.department) || String(d.department_name).toLowerCase() === String(formData.department).toLowerCase())?.department_name || formData.department} ({departmentItemsList.length} items)
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                                            All Departments ({departmentItemsList.length} items)
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        loadSecondaryMasters();
                                                        const activeDept = formData.department || getSelectedStoreDepartment();
                                                        if (activeDept) {
                                                            setNewItemMasterData(prev => ({ ...prev, department: activeDept }));
                                                        }
                                                        setShowAddItemMasterModal(true);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            const activeDept = formData.department || getSelectedStoreDepartment();
                                                            if (activeDept) {
                                                                setNewItemMasterData(prev => ({ ...prev, department: activeDept }));
                                                            }
                                                            setShowAddItemMasterModal(true);
                                                        }
                                                    }}
                                                    tabIndex={0}
                                                    style={{
                                                        color: '#0d9488',
                                                        fontSize: '0.78rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        background: '#f0fdfa',
                                                        border: '1px solid #99f6e4'
                                                    }}
                                                >
                                                    ➕ Add New Item
                                                </button>
                                            </div>
                                            <Select
                                                isLoading={loadingItems}
                                                options={itemSelectOptions}
                                                value={currentItem.item_id ? {
                                                    value: currentItem.item_id,
                                                    label: currentItem.name,
                                                    hsn: currentItem.hsn
                                                } : null}
                                                onChange={(opt) => {
                                                    setItemSearchText('');
                                                    handleItemSelect(opt);
                                                }}
                                                onInputChange={(val, { action }) => {
                                                    if (action === 'input-change') {
                                                        setItemSearchText(val);
                                                    } else if (action === 'menu-close' || action === 'set-value') {
                                                        setItemSearchText('');
                                                    }
                                                }}
                                                placeholder={loadingItems ? "Loading department items..." : (formData.department ? "Search items in selected department..." : "Type item name or HSN code to search (All Departments)...")}
                                                filterOption={() => true}
                                                formatOptionLabel={(option) => (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                        <span style={{ fontWeight: 500, color: '#1e293b' }}>{option.label}</span>
                                                        {option.hsn && (
                                                            <span style={{
                                                                fontSize: '0.72rem',
                                                                background: '#f0fdfa',
                                                                color: '#0d9488',
                                                                border: '1px solid #99f6e4',
                                                                padding: '1px 6px',
                                                                borderRadius: '4px',
                                                                fontWeight: 700,
                                                                letterSpacing: '0.02em',
                                                                marginLeft: '8px'
                                                            }}>
                                                                HSN: {option.hsn}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menuPortal: base => ({ ...base, zIndex: 10002 }),
                                                    control: base => ({
                                                        ...base,
                                                        minHeight: '32px',
                                                        height: '32px',
                                                        fontSize: '0.82rem',
                                                        borderRadius: '4px',
                                                        borderColor: '#cbd5e1'
                                                    }),
                                                    valueContainer: base => ({ ...base, padding: '0 8px' }),
                                                    indicatorsContainer: base => ({ ...base, height: '32px' })
                                                }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                                <span style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700' }}>Total Stock : {currentItem.totalStock || 0}</span>
                                                <span style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700' }}>Dept Stock : {currentItem.deptStock || 0}</span>
                                            </div>
                                        </div>

                                        {/* 2. HSN Code, Batch, Expiry */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                                            <div style={{ position: 'relative' }} ref={hsnDropdownRef}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <CompactLabel style={{ margin: 0 }}>HSN Code</CompactLabel>
                                                        {isHsnSearching && (
                                                            <span style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: 600 }}>Searching...</span>
                                                        )}
                                                    </div>
                                                    {currentItem.item_id && (
                                                        <button
                                                            type="button"
                                                            onClick={handleSaveHsnToItemMaster}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    handleSaveHsnToItemMaster();
                                                                }
                                                            }}
                                                            tabIndex={0}
                                                            style={{
                                                                fontSize: '0.7rem',
                                                                color: currentItem.hsn ? '#0d9488' : '#94a3b8',
                                                                fontWeight: '700',
                                                                cursor: currentItem.hsn ? 'pointer' : 'default',
                                                                background: currentItem.hsn ? '#f0fdfa' : '#f8fafc',
                                                                border: `1px solid ${currentItem.hsn ? '#99f6e4' : '#e2e8f0'}`,
                                                                padding: '1px 6px',
                                                                borderRadius: '4px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '3px',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                            title={currentItem.hsn ? "Click or press Enter to save this HSN code directly to the Item Master database" : "Enter HSN code to save to item"}
                                                        >
                                                            {savingHsn ? 'Saving...' : '💾 Save HSN to Item'}
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <CompactInput
                                                        name="hsn"
                                                        value={currentItem.hsn}
                                                        onChange={handleHsnInputChange}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleHsnSearchClick();
                                                            } else if (e.key === 'Escape') {
                                                                setHsnSearchActive(false);
                                                            }
                                                        }}
                                                        onFocus={() => {
                                                            if ((currentItem.hsn || '').trim().length >= 1 && hsnSuggestions.length > 0) {
                                                                setHsnSearchActive(true);
                                                            }
                                                        }}
                                                        placeholder="HSN Code"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleHsnSearchClick}
                                                        title="Search items by HSN"
                                                        style={{
                                                            position: 'absolute',
                                                            right: '4px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            padding: '2px 5px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            color: '#0d9488',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        onMouseOver={e => (e.currentTarget.style.background = '#f0fdfa')}
                                                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                                    >
                                                        🔍
                                                    </button>
                                                </div>

                                                {/* Floating HSN Search Results Dropdown */}
                                                {hsnSearchActive && hsnSuggestions.length > 0 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        right: 0,
                                                        marginTop: '4px',
                                                        background: '#ffffff',
                                                        border: '1px solid #cbd5e1',
                                                        borderRadius: '6px',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                        zIndex: 10005,
                                                        maxHeight: '220px',
                                                        overflowY: 'auto'
                                                    }}>
                                                        <div style={{
                                                            padding: '6px 10px',
                                                            background: '#f8fafc',
                                                            borderBottom: '1px solid #e2e8f0',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700,
                                                            color: '#64748b',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}>
                                                            <span>Matching Items ({hsnSuggestions.length})</span>
                                                            <span
                                                                onClick={() => setHsnSearchActive(false)}
                                                                style={{ cursor: 'pointer', color: '#94a3b8' }}
                                                                title="Close"
                                                            >
                                                                ✕
                                                            </span>
                                                        </div>
                                                        {hsnSuggestions.map((sItem) => (
                                                            <div
                                                                key={sItem.item_id}
                                                                onClick={() => handleSelectHsnSuggestion(sItem)}
                                                                style={{
                                                                    padding: '8px 10px',
                                                                    borderBottom: '1px solid #f1f5f9',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.15s',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '2px'
                                                                }}
                                                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0fdfa')}
                                                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                            >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                                                                        {sItem.itemName}
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        background: '#e0f2fe',
                                                                        color: '#0369a1',
                                                                        padding: '1px 6px',
                                                                        borderRadius: '4px',
                                                                        fontWeight: 700
                                                                    }}>
                                                                        HSN: {sItem.hsn || '-'}
                                                                    </span>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: '#64748b' }}>
                                                                    <span>Total Stock: <b style={{ color: '#2563eb' }}>{sItem.total_quantity || 0}</b></span>
                                                                    <span>Dept Stock: <b style={{ color: '#2563eb' }}>{sItem.approved_quantity || 0}</b></span>
                                                                    {sItem.mrp ? <span>MRP: ₹{parseFloat(sItem.mrp).toFixed(2)}</span> : null}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <CompactLabel>Batch</CompactLabel>
                                                <CompactInput
                                                    placeholder="EX: BT-001"
                                                    name="batch"
                                                    value={currentItem.batch}
                                                    onChange={handleCurrentItemChange}
                                                />
                                            </div>
                                            <div>
                                                <CompactLabel>Expiry</CompactLabel>
                                                <ExpiryInput
                                                    value={currentItem.expiry || (currentItem.expYear && currentItem.expMonth ? `${currentItem.expYear}-${String(currentItem.expMonth).padStart(2, '0')}` : '')}
                                                    onChange={(parsed) => {
                                                        if (parsed) {
                                                            setCurrentItem(prev => ({
                                                                ...prev,
                                                                expiry: parsed.expiry,
                                                                expMonth: parsed.expMonth,
                                                                expYear: parsed.expYear
                                                            }));
                                                        } else {
                                                            setCurrentItem(prev => ({
                                                                ...prev,
                                                                expiry: '',
                                                                expMonth: '',
                                                                expYear: ''
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="MM/YYYY"
                                                />
                                            </div>
                                        </div>

                                        {/* 3. Packing, No.of Unit, Quantity, Free */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <CompactLabel>Packing</CompactLabel>
                                                <CompactInput
                                                    type="number"
                                                    name="packing"
                                                    value={currentItem.packing}
                                                    onChange={handleCurrentItemChange}
                                                />
                                            </div>
                                            <div>
                                                <CompactLabel>No.of Unit</CompactLabel>
                                                <CompactInput
                                                    type="number"
                                                    name="no_of_unit"
                                                    value={currentItem.no_of_unit}
                                                    onChange={handleCurrentItemChange}
                                                />
                                            </div>
                                            <div>
                                                <CompactLabel>Quantity</CompactLabel>
                                                <CompactInput
                                                    type="number"
                                                    name="quantity"
                                                    value={currentItem.quantity}
                                                    onChange={handleCurrentItemChange}
                                                    style={{ fontWeight: '700' }}
                                                />
                                            </div>
                                            <div>
                                                <CompactLabel>Free</CompactLabel>
                                                <CompactInput
                                                    type="number"
                                                    name="free"
                                                    value={currentItem.free || ''}
                                                    onChange={handleCurrentItemChange}
                                                />
                                            </div>
                                        </div>

                                        {/* 4. Item Value, Packing Price, Unit Price */}
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <CompactLabel required>Item Value</CompactLabel>
                                                    <MoneyInput
                                                        name="itemValue"
                                                        value={currentItem.itemValue}
                                                        onChange={handleCurrentItemChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel>Packing Price</CompactLabel>
                                                    <MoneyInput
                                                        value={currPackingPrice > 0 ? currPackingPrice.toFixed(4) : "0.0000"}
                                                        readOnly
                                                        placeholder="0.0000"
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel>Unit Price</CompactLabel>
                                                    <MoneyInput
                                                        value={currUnitPrice > 0 ? currUnitPrice.toFixed(4) : "0.0000"}
                                                        readOnly
                                                        placeholder="0.0000"
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                                <span style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700' }}>Last Purchase Free : {parseFloat(currentItem.lastPurchaseFree || 0).toFixed(4)}</span>
                                                <span style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700' }}>Last Purchase Price : {parseFloat(currentItem.lastPurchasePrice || 0).toFixed(4)}</span>
                                            </div>
                                        </div>

                                        {/* 5. Purchase Tax Card */}
                                        <div style={{ background: '#e8edf3', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', marginTop: '4px' }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Purchase Tax</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>Tax</CompactLabel>
                                                    <Select
                                                        options={taxOptions}
                                                        value={taxOptions.find(t => t.value === currentItem.tax) || taxOptions[1]}
                                                        onChange={(opt) => handleCurrentItemChange({ target: { name: 'tax', value: opt ? opt.value : 0 } })}
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            menuPortal: base => ({ ...base, zIndex: 10002 }),
                                                            control: base => ({
                                                                ...base,
                                                                minHeight: '30px',
                                                                height: '30px',
                                                                fontSize: '0.78rem',
                                                                borderRadius: '4px',
                                                                borderColor: '#cbd5e1'
                                                            }),
                                                            valueContainer: base => ({ ...base, padding: '0 6px' }),
                                                            indicatorsContainer: base => ({ ...base, height: '30px' })
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>CGST</CompactLabel>
                                                    <MoneyInput
                                                        value={currCgstAmt > 0 ? currCgstAmt.toFixed(4) : "0.0000"}
                                                        readOnly
                                                        suffix={currTaxPercent > 0 ? `${(currTaxPercent / 2).toFixed(1).replace(/\.0$/, '')}%` : ''}
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>SGST</CompactLabel>
                                                    <MoneyInput
                                                        value={currSgstAmt > 0 ? currSgstAmt.toFixed(4) : "0.0000"}
                                                        readOnly
                                                        suffix={currTaxPercent > 0 ? `${(currTaxPercent / 2).toFixed(1).replace(/\.0$/, '')}%` : ''}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>IGST</CompactLabel>
                                                    <MoneyInput
                                                        value="0.00"
                                                        readOnly
                                                    />
                                                </div>
                                                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', paddingTop: '16px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            name="purchaseTaxInclusive"
                                                            checked={currentItem.purchaseTaxInclusive}
                                                            onChange={handleCurrentItemChange}
                                                        />
                                                        Tax Inclusive
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 6. Purchase Discount (%) and Purchase Cost */}
                                        <div style={{ marginTop: '4px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px', alignItems: 'flex-start' }}>
                                                <div>
                                                    <CompactLabel>Purchase Discount (%)</CompactLabel>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                                        <CompactInput
                                                            type="number"
                                                            name="purchaseDiscountPercent"
                                                            value={currentItem.purchaseDiscountPercent || ''}
                                                            onChange={handleCurrentItemChange}
                                                            placeholder="0"
                                                        />
                                                        <MoneyInput
                                                            name="purchaseDiscountAmt"
                                                            value={Number(currDiscountAmt.toFixed(2))}
                                                            onChange={handleCurrentItemChange}
                                                        />
                                                    </div>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#1e293b', cursor: 'pointer', marginTop: '6px' }}>
                                                        <input
                                                            type="checkbox"
                                                            name="deductDiscountForTax"
                                                            checked={currentItem.deductDiscountForTax}
                                                            onChange={handleCurrentItemChange}
                                                        />
                                                        Deduct discount for tax calc
                                                    </label>
                                                </div>
                                                <div>
                                                    <CompactLabel>Purchase Cost</CompactLabel>
                                                    <MoneyInput
                                                        value={currPurchaseCost > 0 ? currPurchaseCost.toFixed(4) : "0.0000"}
                                                        readOnly
                                                        style={{ fontWeight: '700' }}
                                                    />
                                                    <div style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700', marginTop: '3px', textAlign: 'right' }}>
                                                        Last Purchase Cost : {parseFloat(currentItem.lastPurchaseCost || 0).toFixed(4)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── RIGHT COLUMN ── */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* 1. Max Retail Price & Max Packing MRP */}
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <CompactLabel>Max Retail Price</CompactLabel>
                                                    <MoneyInput
                                                        name="mrp"
                                                        value={currentItem.mrp}
                                                        onChange={handleCurrentItemChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel>Max Packing MRP</CompactLabel>
                                                    <MoneyInput
                                                        name="maxPackingMrp"
                                                        value={currentItem.maxPackingMrp !== undefined ? currentItem.maxPackingMrp : ''}
                                                        onChange={handleCurrentItemChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700', marginTop: '3px' }}>
                                                Last MRP : {parseFloat(currentItem.lastMrp || 0).toFixed(4)}
                                            </div>
                                        </div>

                                        {/* 2. Selling Tax Card */}
                                        <div style={{ background: '#e8edf3', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', marginTop: '4px' }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Selling Tax</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>Tax</CompactLabel>
                                                    <Select
                                                        options={taxOptions}
                                                        value={taxOptions.find(t => t.value === currentItem.sellingTax) || taxOptions[1]}
                                                        onChange={(opt) => handleCurrentItemChange({ target: { name: 'sellingTax', value: opt ? opt.value : 0 } })}
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            menuPortal: base => ({ ...base, zIndex: 10002 }),
                                                            control: base => ({
                                                                ...base,
                                                                minHeight: '30px',
                                                                height: '30px',
                                                                fontSize: '0.78rem',
                                                                borderRadius: '4px',
                                                                borderColor: '#cbd5e1'
                                                            }),
                                                            valueContainer: base => ({ ...base, padding: '0 6px' }),
                                                            indicatorsContainer: base => ({ ...base, height: '30px' })
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>CGST ({currSellingTax / 2}%)</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currSellingCgst.toFixed(2))}
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>SGST ({currSellingTax / 2}%)</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currSellingSgst.toFixed(2))}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '8px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="sellingTaxInclusive"
                                                        checked={currentItem.sellingTaxInclusive}
                                                        onChange={handleCurrentItemChange}
                                                    />
                                                    Tax Inclusive
                                                </label>
                                            </div>
                                        </div>

                                        {/* 3. Selling Discount (%), Price, IP Price */}
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <CompactLabel>Selling Discount (%)</CompactLabel>
                                                    <CompactInput
                                                        type="number"
                                                        name="sellingDiscountPercent"
                                                        value={currentItem.sellingDiscountPercent || ''}
                                                        onChange={handleCurrentItemChange}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel>Price</CompactLabel>
                                                    <MoneyInput
                                                        name="price"
                                                        value={Number(currSellingPrice.toFixed(2))}
                                                        onChange={handleCurrentItemChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel>IP Price</CompactLabel>
                                                    <MoneyInput
                                                        name="ipPrice"
                                                        value={Number(currIpPrice.toFixed(2))}
                                                        onChange={handleCurrentItemChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700', marginTop: '3px' }}>
                                                Last Selling Price : {parseFloat(currentItem.lastSellingPrice || 0).toFixed(4)}
                                            </div>
                                        </div>

                                        {/* 4. Tax on Free Card */}
                                        <div style={{ background: '#e8edf3', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', marginTop: '4px' }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>Tax on Free</div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#1e293b', cursor: 'pointer', marginBottom: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    name="calcTaxOnFree"
                                                    checked={currentItem.calcTaxOnFree}
                                                    onChange={handleCurrentItemChange}
                                                />
                                                Calculate Tax On Free
                                            </label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>Total Tax</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currFreeTax.toFixed(2))}
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>CGST</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currFreeCgst.toFixed(2))}
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>SGST</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currFreeSgst.toFixed(2))}
                                                        readOnly
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>IGST</CompactLabel>
                                                    <MoneyInput
                                                        value="0.00"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. Replacement Checkbox */}
                                        <div style={{ marginTop: '4px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    name="isReplacement"
                                                    checked={currentItem.isReplacement}
                                                    onChange={handleCurrentItemChange}
                                                />
                                                Replacement
                                            </label>
                                        </div>

                                        {/* 6. Action Buttons */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                                            <button
                                                type="button"
                                                onClick={addItemToGrn}
                                                style={{
                                                    background: '#0d9488',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '7px 20px',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
                                                }}
                                            >
                                                {editingItemId ? '💾 Update Item' : '💾 Save'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCloseItemModal}
                                                style={{
                                                    background: '#334155',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '7px 20px',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                ✕ Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                        </ModalContainerAnimated>
                    </ModalOverlay>
                )}
                {/* 8. Add New Item Master Modal */}
                {showAddItemMasterModal && (
                    <ModalOverlay onClick={e => e.target === e.currentTarget && setShowAddItemMasterModal(false)} style={{ zIndex: 10000 }}>
                        <ModalContainerAnimated style={{ maxWidth: '900px', borderRadius: '16px' }}>
                            <ModalHeader style={{ background: colors.primary, color: 'white', padding: '15px 25px' }}>
                                <ModalTitle style={{ color: 'white' }}>Add New Item Master</ModalTitle>
                                <CloseButton style={{ color: 'white' }} onClick={() => setShowAddItemMasterModal(false)}>✕</CloseButton>
                            </ModalHeader>
                            <ModalBody style={{ padding: '25px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <Label required>Item Name</Label>
                                        <Input
                                            placeholder="Item Name"
                                            value={newItemMasterData.itemName}
                                            onChange={(e) => setNewItemMasterData({ ...newItemMasterData, itemName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label required>Department</Label>
                                        <Select
                                            options={departments.map(d => ({ value: d.department_id, label: d.department_name }))}
                                            placeholder="Select Department"
                                            value={departments.find(d => d.department_id === newItemMasterData.department) ? { value: newItemMasterData.department, label: departments.find(d => d.department_id === newItemMasterData.department).department_name } : null}
                                            onChange={(opt) => {
                                                const val = opt ? opt.value : '';
                                                const lbl = opt ? opt.label : '';
                                                setNewItemMasterData({ ...newItemMasterData, department: val });
                                                if (val) setSelectedStoreDepartment(val, lbl);
                                            }}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                        />
                                    </div>
                                    <div>
                                        <Label required>Group</Label>
                                        <Select
                                            options={newItemModalGroupOptions}
                                            placeholder="Select Group"
                                            isClearable
                                            value={newItemModalGroupOptions.find(g => g.value === newItemMasterData.group) || null}
                                            onChange={(opt) => {
                                                const newGroup = opt ? opt.value : '';
                                                let currentCat = newItemMasterData.category;
                                                if (newGroup && currentCat) {
                                                    const catObj = categories.find(c => c.category_id === currentCat);
                                                    const mappedGrp = catObj?.group || catObj?.group_id;
                                                    if (mappedGrp && mappedGrp !== newGroup) {
                                                        currentCat = '';
                                                    }
                                                } else if (!newGroup) {
                                                    currentCat = '';
                                                }
                                                setNewItemMasterData(prev => ({ ...prev, group: newGroup, category: currentCat }));
                                            }}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                        />
                                    </div>
                                    <div>
                                        <Label required>Category</Label>
                                        <Select
                                            options={newItemModalCategoryOptions}
                                            placeholder={newItemMasterData.group ? "Select Category" : "Select Category"}
                                            isClearable
                                            value={newItemModalCategoryOptions.find(c => c.value === newItemMasterData.category) || null}
                                            onChange={(opt) => {
                                                const newCat = opt ? opt.value : '';
                                                let autoGroup = newItemMasterData.group;
                                                if (newCat) {
                                                    const catObj = categories.find(c => c.category_id === newCat);
                                                    const mappedGrp = catObj?.group || catObj?.group_id;
                                                    if (mappedGrp) {
                                                        autoGroup = mappedGrp;
                                                    }
                                                }
                                                setNewItemMasterData(prev => ({ ...prev, category: newCat, group: autoGroup }));
                                            }}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                        />
                                    </div>
                                    <div>
                                        <Label>HSN</Label>
                                        <Input
                                            placeholder="HSN"
                                            value={newItemMasterData.hsn}
                                            onChange={(e) => setNewItemMasterData({ ...newItemMasterData, hsn: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label required>Stock Reorder Level</Label>
                                        <Input
                                            placeholder="Stock Reorder Level"
                                            value={newItemMasterData.stockReorderLevel}
                                            onChange={(e) => setNewItemMasterData({ ...newItemMasterData, stockReorderLevel: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Total Quantity</Label>
                                        <Input value={newItemMasterData.total_quantity} readOnly style={{ background: '#f8fafc' }} />
                                    </div>
                                    <div>
                                        <Label>Approved Quantity</Label>
                                        <Input value={newItemMasterData.approved_quantity} readOnly style={{ background: '#f8fafc' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                                    <Button onClick={handleSaveItemMaster} disabled={loading} style={{ background: colors.primary, color: 'white', padding: '10px 30px', minWidth: '120px' }}>
                                        {loading ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button secondary onClick={() => setShowAddItemMasterModal(false)} style={{ background: '#64748b', color: 'white', padding: '10px 30px', minWidth: '120px' }}>
                                        Cancel
                                    </Button>
                                </div>
                            </ModalBody>
                        </ModalContainerAnimated>
                    </ModalOverlay>
                )}
                {/* Add New Vendor Modal */}
                {showAddVendorModal && (
                    <ModalOverlay onClick={() => setShowAddVendorModal(false)}>
                        <ModalContainerAnimated onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', width: '92%' }}>
                            <ModalHeader>
                                <ModalTitle>🏢 Add New General Store Vendor</ModalTitle>
                                <CloseButton onClick={() => setShowAddVendorModal(false)}>&times;</CloseButton>
                            </ModalHeader>
                            <ModalBody style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label required>Vendor / Company Name</Label>
                                        <Input
                                            placeholder="Enter vendor or supplier name"
                                            value={newVendorData.name}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <Label required>Vendor Type</Label>
                                        <Select
                                            options={[
                                                { value: 'SUPPLIER', label: 'Supplier' },
                                                { value: 'MANUFACTURER', label: 'Manufacturer' },
                                                { value: 'BOTH', label: 'Both' }
                                            ]}
                                            value={{
                                                value: newVendorData.vendor_type,
                                                label: newVendorData.vendor_type === 'BOTH' ? 'Both' : (newVendorData.vendor_type === 'MANUFACTURER' ? 'Manufacturer' : 'Supplier')
                                            }}
                                            onChange={(opt) => setNewVendorData({ ...newVendorData, vendor_type: opt ? opt.value : 'SUPPLIER' })}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 100001 }) }}
                                        />
                                    </div>

                                    <div>
                                        <Label>GSTIN</Label>
                                        <Input
                                            placeholder="GSTIN Number"
                                            value={newVendorData.gstin}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, gstin: e.target.value.toUpperCase() })}
                                        />
                                    </div>

                                    <div>
                                        <Label>Contact Person</Label>
                                        <Input
                                            placeholder="Contact person name"
                                            value={newVendorData.contact_person}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, contact_person: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <Label>Phone Number</Label>
                                        <Input
                                            placeholder="Phone number"
                                            value={newVendorData.phone}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="Email address"
                                            value={newVendorData.email}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, email: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label>Address Line 1</Label>
                                        <Input
                                            placeholder="Building, street, door no."
                                            value={newVendorData.address_line1}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, address_line1: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label>Address Line 2</Label>
                                        <Input
                                            placeholder="Area, landmark"
                                            value={newVendorData.address_line2}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, address_line2: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <Label>City</Label>
                                        <Input
                                            placeholder="City"
                                            value={newVendorData.city}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, city: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <Label>State</Label>
                                        <Input
                                            placeholder="State"
                                            value={newVendorData.state}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, state: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Label>Pincode</Label>
                                        <Input
                                            placeholder="Pincode"
                                            value={newVendorData.pincode}
                                            onChange={(e) => setNewVendorData({ ...newVendorData, pincode: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '24px' }}>
                                    <Button onClick={handleSaveNewVendor} disabled={loading} style={{ background: colors.primary, color: 'white', padding: '10px 30px', minWidth: '130px' }}>
                                        {loading ? 'Saving...' : 'Save Vendor'}
                                    </Button>
                                    <Button secondary onClick={() => setShowAddVendorModal(false)} style={{ background: '#64748b', color: 'white', padding: '10px 30px', minWidth: '110px' }}>
                                        Cancel
                                    </Button>
                                </div>
                            </ModalBody>
                        </ModalContainerAnimated>
                    </ModalOverlay>
                )}

            </PageWrapper>
        </ConfigProvider>
    );
};

export default StoresGRNGeneration;