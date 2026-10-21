import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Select from 'react-select';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import apiRequest from '../../Auth/apiRequest';
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
    &[type="date"] {
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
    grid-template-columns: minmax(130px, 1fr) minmax(280px, 2.6fr) minmax(130px, 1fr) minmax(65px, 0.55fr);
    gap: 12px;
    padding: 20px;
    align-items: flex-start;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr 2fr;
    }
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
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

const MoneyInput = ({ value, onChange, name, readOnly, placeholder = "0.00", style, suffix }) => (
    <CurrencyInputWrapper $readOnly={readOnly} style={style}>
        <CurrencySymbol>₹</CurrencySymbol>
        <CurrencyField
            type="number"
            step="any"
            name={name}
            value={value !== undefined && value !== null ? value : ''}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder}
        />
        {suffix && <SuffixSymbol>{suffix}</SuffixSymbol>}
    </CurrencyInputWrapper>
);

const CompactInput = styled(Input)`
    height: 30px !important;
    padding: 3px 8px !important;
    font-size: 0.8rem !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 4px !important;
    background: ${props => props.readOnly ? '#f8fafc' : 'white'} !important;
    box-sizing: border-box;
`;

const CompactLabel = styled.label`
    font-size: 0.72rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 3px;
    display: block;
`;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ExpiryDatePicker = ({ value, onChange, placeholder = "May 2027" }) => {
    const containerRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [inputText, setInputText] = React.useState('');
    const [pickerYear, setPickerYear] = React.useState(() => dayjs().year());
    const [error, setError] = React.useState(null);

    // Sync from incoming value
    React.useEffect(() => {
        if (value) {
            const d = dayjs(value);
            if (d.isValid()) {
                setInputText(d.format('MMM YYYY'));
                setPickerYear(d.year());
                setError(null);
                return;
            }
        }
        if (!value) {
            setInputText('');
            setError(null);
        }
    }, [value]);

    const parseExpiryText = React.useCallback((input) => {
        if (!input || !input.trim()) return null;
        const s = input.trim();
        // Format: "May 2026", "may 2026", "May2026"
        const m1 = s.match(/^([a-zA-Z]{3,9})\s*(\d{2,4})$/);
        if (m1) {
            const monthStr = m1[1].slice(0, 3).toLowerCase();
            const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthStr);
            let year = parseInt(m1[2], 10);
            if (year < 100) year += 2000;
            if (monthIdx !== -1 && year >= 2020 && year <= 2099) {
                const monthNum = String(monthIdx + 1).padStart(2, '0');
                const lastDay = new Date(year, monthIdx + 1, 0).getDate();
                return {
                    formatted: `${MONTH_NAMES[monthIdx]} ${year}`,
                    expiry: `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`,
                    expMonth: monthNum,
                    expYear: String(year),
                    monthIdx,
                    year
                };
            }
        }
        // Format: "5 2026", "05/2026", "5/26", "5-2026"
        const m2 = s.match(/^(\d{1,2})[\s/-]?(\d{2,4})$/);
        if (m2) {
            const month = parseInt(m2[1], 10);
            let year = parseInt(m2[2], 10);
            if (year < 100) year += 2000;
            if (month >= 1 && month <= 12 && year >= 2020 && year <= 2099) {
                const monthIdx = month - 1;
                const monthNum = String(month).padStart(2, '0');
                const lastDay = new Date(year, monthIdx + 1, 0).getDate();
                return {
                    formatted: `${MONTH_NAMES[monthIdx]} ${year}`,
                    expiry: `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`,
                    expMonth: monthNum,
                    expYear: String(year),
                    monthIdx,
                    year
                };
            }
        }
        return null;
    }, []);

    const handleValidate = React.useCallback((text) => {
        if (!text || !text.trim()) {
            setError(null);
            onChange(null);
            return;
        }
        const parsed = parseExpiryText(text);
        if (parsed) {
            setInputText(parsed.formatted);
            setPickerYear(parsed.year);
            setError(null);
            onChange(parsed);
        } else {
            setError('Format: May 2026 (Month 1-12, Year 2020-2099)');
        }
    }, [onChange, parseExpiryText]);

    // Close on click outside & validate
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                handleValidate(inputText);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inputText, handleValidate]);

    const handleInputChange = (e) => {
        let val = e.target.value;
        
        // Month typing intelligence:
        // When typing single or double digits for month, auto-convert to Month name + space
        if (val === '5') {
            val = 'May ';
        } else if (val === '2') {
            val = 'Feb ';
        } else if (val === '3') {
            val = 'Mar ';
        } else if (val === '4') {
            val = 'Apr ';
        } else if (val === '6') {
            val = 'Jun ';
        } else if (val === '7') {
            val = 'Jul ';
        } else if (val === '8') {
            val = 'Aug ';
        } else if (val === '9') {
            val = 'Sep ';
        } else if (val === '01') {
            val = 'Jan ';
        } else if (val === '02') {
            val = 'Feb ';
        } else if (val === '03') {
            val = 'Mar ';
        } else if (val === '04') {
            val = 'Apr ';
        } else if (val === '05') {
            val = 'May ';
        } else if (val === '06') {
            val = 'Jun ';
        } else if (val === '07') {
            val = 'Jul ';
        } else if (val === '08') {
            val = 'Aug ';
        } else if (val === '09') {
            val = 'Sep ';
        } else if (val === '10') {
            val = 'Oct ';
        } else if (val === '11') {
            val = 'Nov ';
        } else if (val === '12') {
            val = 'Dec ';
        }

        setInputText(val);

        // Check if full valid format is reached while typing (e.g. "May 2026")
        const parsed = parseExpiryText(val);
        if (parsed) {
            setError(null);
            setPickerYear(parsed.year);
            onChange(parsed);
        }
    };

    const handleSelectMonth = (monthIdx) => {
        const year = pickerYear || dayjs().year();
        const monthNum = String(monthIdx + 1).padStart(2, '0');
        const lastDay = new Date(year, monthIdx + 1, 0).getDate();
        const formatted = `${MONTH_NAMES[monthIdx]} ${year}`;
        setInputText(formatted);
        setError(null);
        onChange({
            formatted,
            expiry: `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`,
            expMonth: monthNum,
            expYear: String(year),
            monthIdx,
            year
        });
        setIsOpen(false);
    };

    // Current parsed state for active button highlight in popup
    const currentParsed = parseExpiryText(inputText);
    const selectedMonthIdx = currentParsed ? currentParsed.monthIdx : null;
    const selectedYear = currentParsed ? currentParsed.year : null;

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleValidate(inputText);
                            setIsOpen(false);
                        }
                    }}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        height: '30px',
                        padding: '0 45px 0 8px',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: error ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                        outline: 'none',
                        background: '#ffffff',
                        color: '#1e293b',
                        boxSizing: 'border-box'
                    }}
                />
                <div style={{ position: 'absolute', right: '6px', display: 'flex', alignItems: 'center' }}>
                    <span
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}
                        title="Open Month Picker"
                    >
                        📅
                    </span>
                </div>
            </div>

            {error && (
                <div style={{ color: '#ef4444', fontSize: '0.68rem', marginTop: '2px', lineHeight: '1.1' }}>
                    {error}
                </div>
            )}

            {/* Month/Year Picker Dropdown matching attached UI */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 10005,
                        marginTop: '4px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                        width: '280px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    {/* Header: << Year >> */}
                    <div
                        style={{
                            background: '#1e3a8a',
                            padding: '10px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: 'white'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setPickerYear(y => y - 1)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#93c5fd',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}
                            title="Previous Year"
                        >
                            &laquo;
                        </button>
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', letterSpacing: '0.05em' }}>
                            {pickerYear}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPickerYear(y => y + 1)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#93c5fd',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}
                            title="Next Year"
                        >
                            &raquo;
                        </button>
                    </div>

                    {/* Month Grid */}
                    <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {MONTH_NAMES.map((mName, idx) => {
                            const isSelected = selectedMonthIdx === idx && selectedYear === pickerYear;
                            return (
                                <button
                                    key={mName}
                                    type="button"
                                    onClick={() => handleSelectMonth(idx)}
                                    style={{
                                        padding: '8px 0',
                                        textAlign: 'center',
                                        fontSize: '0.85rem',
                                        fontWeight: isSelected ? '700' : '500',
                                        color: isSelected ? '#ffffff' : '#1e293b',
                                        background: isSelected ? '#1e3a8a' : 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {mName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
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
    const [vendors, setVendors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groupTypes, setGroupTypes] = useState([]);

    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        purchase_category: '',
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
        batch: '',
        expMonth: '',
        expYear: '',
        expiry: '',
        packing: 1,
        no_of_unit: 1,
        quantity: 1,
        free: 0,
        itemValue: 0,
        packingPrice: 0,
        unitPrice: 0,
        tax: 5,
        purchaseTaxInclusive: true,
        purchaseDiscountPercent: 0,
        purchaseDiscountAmt: 0,
        deductDiscountForTax: false,
        purchaseCost: 0,
        mrp: 0,
        maxPackingMrp: 0,
        sellingTax: 5,
        sellingTaxInclusive: true,
        sellingDiscountPercent: 0,
        price: 0,
        ipPrice: 0,
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
    const [hsnSearchActive, setHsnSearchActive] = useState(false);
    const [hsnSuggestions, setHsnSuggestions] = useState([]);
    const [isHsnSearching, setIsHsnSearching] = useState(false);
    const hsnDropdownRef = useRef(null);

    const [newItemMasterData, setNewItemMasterData] = useState({
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

    const fetchMasters = async () => {
        try {
            const [itemsRes, storeVendorsRes, deptsRes, groupsRes, catsRes, groupTypesRes] = await Promise.all([
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/category-master/`),
                apiRequest(`${getBaseUrl.replace(/\/$/, '')}/group-type-master/`)
            ]);
            if (itemsRes.success) setItems(itemsRes.data);
            if (storeVendorsRes?.success) {
                const list = Array.isArray(storeVendorsRes.data)
                    ? storeVendorsRes.data
                    : Array.isArray(storeVendorsRes.data?.data)
                        ? storeVendorsRes.data.data
                        : [];
                setVendors(list);
            }
            if (deptsRes.success) setDepartments(deptsRes.data);
            if (groupsRes.success) setGroups(groupsRes.data);
            if (catsRes.success) setCategories(catsRes.data);
            if (groupTypesRes.success) setGroupTypes(groupTypesRes.data);
        } catch (error) {
            console.error("Error fetching masters:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
            supplier_address: vendor.addressLine1 || vendor.address_line_1 || vendor.address || '',
            contact_person: vendor.contactPerson || vendor.contact_person || '',
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
        const val = type === 'checkbox' ? checked : value;

        const newCurrentItem = { ...currentItem, [name]: val };
        if (name === 'packing' || name === 'no_of_unit') {
            const p = parseFloat(name === 'packing' ? val : newCurrentItem.packing) || 0;
            const n = parseFloat(name === 'no_of_unit' ? val : newCurrentItem.no_of_unit) || 0;
            newCurrentItem.quantity = p * n;
        }

        if (name === 'mrp' || name === 'packing') {
            const m = parseFloat(name === 'mrp' ? val : newCurrentItem.mrp) || 0;
            const p = parseFloat(name === 'packing' ? val : newCurrentItem.packing) || 1;
            newCurrentItem.maxPackingMrp = m * p;
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

        if (name === 'sellingDiscountPercent' || name === 'mrp') {
            const m = parseFloat(name === 'mrp' ? val : newCurrentItem.mrp) || 0;
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
                    totalStock: stock,
                    deptStock: deptStock,
                    mrp: itemMrp,
                    maxPackingMrp: itemMrp * (parseFloat(prev.packing) || 1),
                    itemValue: itemRate,
                    unitPrice: (parseFloat(prev.quantity) || 1) > 0 ? itemRate / (parseFloat(prev.quantity) || 1) : itemRate,
                    tax: taxBracket,
                    sellingTax: taxBracket,
                    lastMrp: itemMrp,
                    lastPurchasePrice: itemRate,
                    lastPurchaseCost: itemRate,
                    lastSellingPrice: itemMrp
                }));
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
    let currTotalTax = 0;
    if (currentItem.purchaseTaxInclusive) {
        currTotalTax = currTaxPercent > 0 ? (baseAfterDiscount - (baseAfterDiscount / (1 + currTaxPercent / 100))) : 0;
    } else {
        currTotalTax = baseAfterDiscount * (currTaxPercent / 100);
    }

    const currCgstAmt = currTotalTax / 2;
    const currSgstAmt = currTotalTax / 2;

    const currPurchaseCost = currentItem.purchaseTaxInclusive
        ? Math.max(0, baseAfterDiscount)
        : (baseAfterDiscount + currTotalTax);
    const currUnitCost = currQty ? currPurchaseCost / currQty : 0;

    const currMrp = parseFloat(currentItem.mrp) || 0;
    const currMaxPackingMrp = parseFloat(currentItem.maxPackingMrp) || (currMrp * currPacking);
    const currSellingTax = parseFloat(currentItem.sellingTax) || 0;
    const currSellingCgst = (currMrp * (currSellingTax / 100)) / 2;
    const currSellingSgst = (currMrp * (currSellingTax / 100)) / 2;

    const currSellingDisc = parseFloat(currentItem.sellingDiscountPercent) || 0;
    const defaultSellingPrice = currMrp > 0 ? (currMrp * (1 - currSellingDisc / 100)) : 0;
    const currSellingPrice = parseFloat(currentItem.price) || defaultSellingPrice;
    const currIpPrice = parseFloat(currentItem.ipPrice) || currSellingPrice;

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
            const baseValue = item.itemValue || 0;
            const taxPercent = parseFloat(item.tax) || 0;
            const discount = parseFloat(item.discountedAmt) || 0;

            const netValue = baseValue - discount;

            totalDiscount += discount;

            if (taxPercent > 0) {
                taxable += netValue;
                cgst += item.cgstAmt;
                sgst += item.sgstAmt;
            } else {
                nonTaxable += netValue;
            }

            const freeQty = parseFloat(item.free) || 0;
            if (freeQty > 0 && taxPercent > 0) {
                const freeBase = freeQty * (item.unitPrice || 0);
                taxOnFreeItems += (freeBase * taxPercent) / 100;
            }
        });

        const igst = parseFloat(formData.igst) || 0;
        const cess = parseFloat(formData.cess) || 0;
        const cst = parseFloat(formData.central_sales_tax) || 0;
        const transport = parseFloat(formData.courier_transport_charge) || 0;

        // NEW: Calculate true signed amount based on dropdown type
        const rawRoundAmount = Math.abs(parseFloat(formData.round_amount) || 0);
        const signedRoundAmount = formData.round_type === 'subtract' ? -rawRoundAmount : rawRoundAmount;

        let totalAmountObj = taxable + nonTaxable + cgst + sgst + igst + cess + cst + transport;

        const netInvoiceAmount = Number((totalAmountObj + signedRoundAmount).toFixed(2));

        return {
            taxable_amount: Number(taxable.toFixed(2)),
            non_taxable_amount: Number(nonTaxable.toFixed(2)),
            cgst: Number(cgst.toFixed(2)),
            sgst: Number(sgst.toFixed(2)),
            tax_on_free_items: Number(taxOnFreeItems.toFixed(2)),
            total_discount: Number(totalDiscount.toFixed(2)),
            total_amount: Number(totalAmountObj.toFixed(2)),
            round_amount: signedRoundAmount, // Export the properly signed amount to backend payload
            net_invoice_amount: netInvoiceAmount
        };
    }, [grnItems, formData.igst, formData.cess, formData.central_sales_tax, formData.courier_transport_charge, formData.round_amount, formData.round_type]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (grnItems.length === 0) {
            alert("Please add at least one item to generate GRN");
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
        if (!newItemMasterData.itemName || !newItemMasterData.department || !newItemMasterData.category || !newItemMasterData.group || !newItemMasterData.group_type || !newItemMasterData.stockReorderLevel) {
            alert("Please fill all required fields marked with *");
            return;
        }

        setLoading(true);
        try {
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/item-master/`, 'POST', newItemMasterData);
            if (response.success) {
                alert("New Item Master Added Successfully!");
                setShowAddItemMasterModal(false);
                // Refresh items list
                fetchMasters();
                // Optionally auto-select the new item
                setCurrentItem(prev => ({
                    ...prev,
                    item_id: response.data.item_id,
                    name: response.data.itemName,
                    hsn: response.data.hsn || ''
                }));
                // Reset new item data
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
                alert("Error adding item: " + JSON.stringify(response.error));
            }
        } catch (error) {
            console.error("Error saving Item Master:", error);
            alert("Error saving Item Master");
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
                        {location.state?.fromAnalysis && (
                            <Button
                                secondary
                                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', fontWeight: '600' }}
                                onClick={() => navigate('/StoresGRNReport')}
                            >
                                ← Back to Report
                            </Button>
                        )}
                    </GlassHeader>

                    {/* 2. Main Form Content */}
                    <form onSubmit={handleSubmit} style={{ background: colors.background, padding: '24px' }}>

                        {/* Purchase & Supplier Info Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '20px' }}>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <FormCard>
                                    <SectionTitleCard>
                                        <h3>Purchase Information</h3>
                                    </SectionTitleCard>
                                    <PurchaseInfoGrid>
                                            <div>
                                                <Label required>Category</Label>
                                                <Select
                                                    options={purchaseCategories}
                                                    value={purchaseCategories.find(c => c.value === formData.purchase_category)}
                                                    onChange={(opt) => handleInputChange({ target: { name: 'purchase_category', value: opt ? opt.value : '' } })}
                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                            <div>
                                                <Label required>Vendor</Label>
                                                <div
                                                    onClick={() => {
                                                        if (!isVerified) {
                                                            setVendorSearchQuery('');
                                                            setShowVendorListModal(true);
                                                        }
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        height: '34px',
                                                        padding: '0 10px',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${formData.vendor_id ? '#0d9488' : colors.border}`,
                                                        backgroundColor: isVerified ? '#f1f5f9' : (formData.vendor_id ? '#f0fdfa' : '#ffffff'),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        cursor: isVerified ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        boxShadow: formData.vendor_id ? '0 0 0 1px rgba(13,148,136,0.1)' : 'none',
                                                        overflow: 'hidden',
                                                        boxSizing: 'border-box'
                                                    }}
                                                    title={(() => {
                                                        if (isVerified) return 'Vendor locked';
                                                        const found = vendors.find(v => v.vendor_id === formData.vendor_id);
                                                        return found ? `${found.name || found.vendor_name} (Click to change vendor)` : 'Click to select vendor from modal';
                                                    })()}
                                                >
                                                    <div style={{
                                                        flex: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontSize: '0.85rem',
                                                        color: formData.vendor_id ? '#0f172a' : '#94a3b8',
                                                        fontWeight: formData.vendor_id ? '600' : 'normal',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🏢</span>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {(() => {
                                                                if (!formData.vendor_id) return 'Click to select vendor...';
                                                                const found = vendors.find(v => v.vendor_id === formData.vendor_id);
                                                                return found ? (found.name || found.vendor_name) : formData.vendor_id;
                                                            })()}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px', flexShrink: 0 }}>
                                                        {formData.vendor_id && !isVerified && (
                                                            <button
                                                                type="button"
                                                                onClick={handleClearVendor}
                                                                title="Clear selected vendor"
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    color: '#94a3b8',
                                                                    cursor: 'pointer',
                                                                    padding: '2px 5px',
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
                                            <div>
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

                                            <div><Label>Vendor ID</Label><Input value={formData.vendor_id} readOnly style={{ backgroundColor: '#f8fafc', fontWeight: '600', textAlign: 'center' }} /></div>
                                    </PurchaseInfoGrid>
                                 </FormCard>

                                <FormCard>
                                    <SectionTitleCard $color="#6366f1">
                                        <h3>Invoice & Payment Details</h3>
                                    </SectionTitleCard>
                                    <FormGrid $minWidth="160px">
                                        <div><Label required>Invoice No</Label><Input placeholder="EX: INV-1001" name="invoice_no" value={formData.invoice_no} onChange={handleInputChange} disabled={isVerified} /></div>
                                        <div>
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

                                        <div><Label>Credit (Days)</Label><Input name="credit_period" value={formData.credit_period} onChange={handleInputChange} disabled={isVerified} /></div>
                                        <div><Label>Payment Mode</Label>
                                            <Select
                                                options={paymentModes}
                                                value={paymentModes.find(m => m.value === formData.payment_mode)}
                                                onChange={(opt) => handleInputChange({ target: { name: 'payment_mode', value: opt ? opt.value : '' } })}
                                                menuPortalTarget={document.body}
                                                isDisabled={isVerified}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            />
                                        </div>
                                    </FormGrid>
                                </FormCard>
                            </div>

                            <FormCard style={{ height: 'fit-content' }}>
                                <SectionTitleCard $color="#b45309" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>Supplier Snapshot</h3>
                                    {!isVerified && (
                                        <span
                                            onClick={() => { setVendorSearchQuery(''); setShowVendorListModal(true); }}
                                            style={{





                                                
                                                color: '#b45309',
                                                fontSize: '0.72rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}
                                            title="Open Vendor Directory Modal"
                                        >
                                            📋 Browse List
                                        </span>
                                    )}
                                </SectionTitleCard>
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div><Label>Vendor ID</Label><Input value={formData.vendor_id} readOnly style={{ backgroundColor: '#f8fafc', fontWeight: '600' }} /></div>
                                    <div><Label>Contact Person</Label><Input value={formData.contact_person} readOnly style={{ backgroundColor: '#f8fafc' }} /></div>
                                    <div><Label>Phone Number</Label><Input value={formData.phone} readOnly style={{ backgroundColor: '#f8fafc' }} /></div>
                                    <div><Label>Office Address</Label><Input value={formData.supplier_address} readOnly style={{ backgroundColor: '#f8fafc' }} /></div>
                                </div>
                            </FormCard>
                        </div>

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
                                                <Td style={{ fontWeight: '600', color: colors.primaryDark }}>{item.name || item.itemName}</Td>
                                                <Td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>{item.hsn || '-'}</Td>
                                                <Td>{item.batch || '-'}</Td>
                                                <Td>{item.packing}</Td>
                                                <Td style={{ textAlign: 'center', fontWeight: '500' }}>{item.quantity}</Td>
                                                <Td style={{ textAlign: 'center' }}>{item.free}</Td>
                                                <Td>{item.expiry || '-'}</Td>
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
                {showVendorListModal && (() => {
                    const q = (vendorSearchQuery || '').toLowerCase().trim();
                    const filteredVendors = vendors.filter(v => {
                        if (!q) return true;
                        const name = (v.name || v.vendor_name || '').toLowerCase();
                        const code = (v.vendor_id || '').toLowerCase();
                        const contact = (v.contactPerson || v.contact_person || '').toLowerCase();
                        const phone = (v.phone || '').toLowerCase();
                        const gstin = (v.gstin || '').toLowerCase();
                        const city = (v.city || '').toLowerCase();
                        return name.includes(q) || code.includes(q) || contact.includes(q) || phone.includes(q) || gstin.includes(q) || city.includes(q);
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
                                                <span>Current Selection: <strong style={{ color: '#0d9488' }}>{vendors.find(v => v.vendor_id === formData.vendor_id)?.name || formData.vendor_id}</strong> ({formData.vendor_id})</span>
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
                                    {editingItemId ? '✏️ Edit Catalog Item' : 'Catalog Item Entry'}
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
                                                <CompactLabel required style={{ margin: 0 }}>Item Name</CompactLabel>
                                                <span
                                                    onClick={() => setShowAddItemMasterModal(true)}
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
                                                </span>
                                            </div>
                                            <Select
                                                options={items.map(i => ({
                                                    value: i.item_id,
                                                    label: i.itemName,
                                                    hsn: i.hsn || '',
                                                    stock: i.total_quantity || 0,
                                                    deptStock: i.approved_quantity || 0
                                                }))}
                                                value={currentItem.item_id ? {
                                                    value: currentItem.item_id,
                                                    label: currentItem.name,
                                                    hsn: currentItem.hsn
                                                } : null}
                                                onChange={handleItemSelect}
                                                placeholder="Type item name or HSN code to search..."
                                                filterOption={(candidate, input) => {
                                                    if (!input) return true;
                                                    const q = input.toLowerCase().trim();
                                                    const name = (candidate.data.label || '').toLowerCase();
                                                    const hsn = (candidate.data.hsn || '').toLowerCase();
                                                    const id = (candidate.data.value || '').toLowerCase();
                                                    return name.includes(q) || hsn.includes(q) || id.includes(q);
                                                }}
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
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <CompactLabel>HSN Code</CompactLabel>
                                                    {isHsnSearching && (
                                                        <span style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: 600 }}>Searching...</span>
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
                                                <ExpiryDatePicker
                                                    value={currentItem.expiry}
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
                                                    placeholder="May 2027"
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
                                                    value={currentItem.free}
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
                                                        value={Number(currPackingPrice.toFixed(2))}
                                                        readOnly
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel>Unit Price</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currUnitPrice.toFixed(2))}
                                                        readOnly
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                                <span style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700' }}>Last Purchase Free : {currentItem.lastPurchaseFree || 0}</span>
                                                <span style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700' }}>Last Purchase Price : ₹{Number(currentItem.lastPurchasePrice || 0).toFixed(2)}</span>
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
                                                        value={Number(currCgstAmt.toFixed(2))}
                                                        readOnly
                                                        suffix="%"
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>SGST</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currSgstAmt.toFixed(2))}
                                                        readOnly
                                                        suffix="%"
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
                                                            value={currentItem.purchaseDiscountPercent}
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
                                                        value={Number(currPurchaseCost.toFixed(2))}
                                                        readOnly
                                                        style={{ fontWeight: '700' }}
                                                    />
                                                    <div style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700', marginTop: '3px', textAlign: 'right' }}>
                                                        Last Purchase Cost : ₹{Number(currentItem.lastPurchaseCost || 0).toFixed(2)}
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
                                                        value={Number(currMaxPackingMrp.toFixed(2))}
                                                        onChange={handleCurrentItemChange}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ color: '#2563eb', fontSize: '0.73rem', fontWeight: '700', marginTop: '3px' }}>
                                                Last MRP : ₹{Number(currentItem.lastMrp || 0).toFixed(2)}
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
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>CGST</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currSellingCgst.toFixed(2))}
                                                        readOnly
                                                        suffix="%"
                                                    />
                                                </div>
                                                <div>
                                                    <CompactLabel style={{ fontSize: '0.7rem' }}>SGST</CompactLabel>
                                                    <MoneyInput
                                                        value={Number(currSellingSgst.toFixed(2))}
                                                        readOnly
                                                        suffix="%"
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
                                                        value={currentItem.sellingDiscountPercent}
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
                                                Last Selling Price : ₹{Number(currentItem.lastSellingPrice || 0).toFixed(2)}
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
                                            onChange={(opt) => setNewItemMasterData({ ...newItemMasterData, department: opt ? opt.value : '' })}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                        />
                                    </div>
                                    <div>
                                        <Label required>Category</Label>
                                        <Select
                                            options={categories.map(c => ({ value: c.category_id, label: c.category_name }))}
                                            placeholder="Select Category"
                                            value={categories.find(c => c.category_id === newItemMasterData.category) ? { value: newItemMasterData.category, label: categories.find(c => c.category_id === newItemMasterData.category).category_name } : null}
                                            onChange={(opt) => setNewItemMasterData({ ...newItemMasterData, category: opt ? opt.value : '' })}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                        />
                                    </div>
                                    <div>
                                        <Label required>Group</Label>
                                        <Select
                                            options={groups.map(g => ({ value: g.group_id, label: g.group_name }))}
                                            placeholder="Select Group"
                                            value={groups.find(g => g.group_id === newItemMasterData.group) ? { value: newItemMasterData.group, label: groups.find(g => g.group_id === newItemMasterData.group).group_name } : null}
                                            onChange={(opt) => setNewItemMasterData({ ...newItemMasterData, group: opt ? opt.value : '' })}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 10001 }) }}
                                        />
                                    </div>
                                    <div>
                                        <Label required>Group Type</Label>
                                        <Select
                                            options={groupTypes.map(gt => ({ value: gt.group_type_id, label: gt.group_type_name }))}
                                            placeholder="Select Group Type"
                                            value={groupTypes.find(gt => gt.group_type_id === newItemMasterData.group_type) ? { value: newItemMasterData.group_type, label: groupTypes.find(gt => gt.group_type_id === newItemMasterData.group_type).group_type_name } : null}
                                            onChange={(opt) => setNewItemMasterData({ ...newItemMasterData, group_type: opt ? opt.value : '' })}
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
            </PageWrapper>
        </ConfigProvider>
    );
};

export default StoresGRNGeneration;