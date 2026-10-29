import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { DatePicker, ConfigProvider } from 'antd';
import ReactSelect from 'react-select';
import dayjs from 'dayjs';
import { 
    Pencil, CheckCheck, CreditCard, Printer, Trash2, 
    MoreVertical, Eye, AlertTriangle, AlertCircle
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import { getSelectedStoreDepartment, setSelectedStoreDepartment, useStoresDepartment } from './storesDepartmentHelper';
import DepartmentSelectionModal, { DepartmentFilterControl } from './DepartmentSelectionModal';
import TablePagination, { usePagination } from './TablePagination';
import {
    PageWrapper,
    Container,
    ControlsContainer,
    SearchContainer,
    Input,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    InputWrapper,
    Label,
    FormRow,
    ButtonContainer,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    ModalBody,
    CloseButton,
    colors,
    SectionHeader
} from '../GlobalStyles';

const CalendarGlobalStyles = createGlobalStyle`
    .ant-picker-dropdown {
        z-index: 10000 !important;
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
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin: 20px 22px;
`;

const StatsCard = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid ${colors.border};
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${colors.primary};
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .label {
        font-size: 0.8rem;
        color: ${colors.textMuted};
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }

    .value {
        font-size: 1.6rem;
        font-weight: 700;
        color: ${colors.textMain};
    }

    .sub-value {
        font-size: 0.75rem;
        color: ${colors.textMuted};
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;

const SummaryRow = ({ label, value, color }) => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '8px 15px', 
        borderBottom: `1px solid ${colors.primary}10`,
        fontSize: '0.9rem',
        fontWeight: '600'
    }}>
        <span style={{ color: colors.textMuted }}>{label}</span>
        <span style={{ color: color || colors.textMain }}>₹{(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
);

const GRNActionPopover = ({
    grn,
    anchorEl,
    onClose,
    onView,
    onEdit,
    onApprove,
    onPayment,
    onPrint,
    onDelete,
    onCancel
}) => {
    const isApproved = !!grn.is_approved;
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            const popoverWidth = 320;
            let targetLeft = rect.right - popoverWidth + window.scrollX;
            if (targetLeft < 10) {
                targetLeft = Math.max(10, rect.left + window.scrollX);
            }
            setPos({
                top: rect.bottom + window.scrollY + 6,
                left: targetLeft,
            });
        }
    }, [anchorEl]);

    const items = [
        {
            icon: <Eye size={18} strokeWidth={1.8} />,
            label: "View",
            color: "#0284c7",
            disabled: false,
            title: "View GRN Details",
            onClick: onView,
        },
        {
            icon: <Pencil size={18} strokeWidth={1.8} />,
            label: "Edit",
            color: "#0d9488",
            disabled: isApproved,
            title: isApproved ? "Cannot edit verified GRN" : "Edit GRN",
            onClick: onEdit,
        },
        {
            icon: <Trash2 size={18} strokeWidth={1.8} />,
            label: "Cancel",
            color: "#ef4444",
            disabled: isApproved,
            title: isApproved ? "Cannot cancel verified GRN" : "Cancel GRN",
            onClick: onCancel || onDelete,
        },
        {
            icon: <CreditCard size={18} strokeWidth={1.8} />,
            label: "Payment",
            color: "#0284c7",
            disabled: false,
            title: "Record Payment",
            onClick: onPayment,
        },
        {
            icon: <Printer size={18} strokeWidth={1.8} />,
            label: "Print",
            color: "#7c3aed",
            disabled: false,
            title: "Print GRN Voucher",
            onClick: onPrint,
        },
        {
            icon: <CheckCheck size={18} strokeWidth={1.8} />,
            label: isApproved ? "Verified" : "Confirm",
            color: isApproved ? "#10b981" : "#ea580c",
            disabled: isApproved,
            title: isApproved ? "Already Approved" : "Approve GRN",
            onClick: onApprove,
        },
    ];

    const popover = (
        <div
            className="grn-action-popover"
            style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "8px 10px",
                zIndex: 99999,
                minWidth: 320,
                boxShadow: "0 12px 35px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.04)",
                animation: "fadeIn 0.15s ease-out"
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: 3,
                }}
            >
                {items.map((item, ii) => (
                    <button
                        key={ii}
                        disabled={item.disabled}
                        title={item.title || item.label}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            if (!item.disabled) {
                                item.onClick();
                            }
                        }}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 5,
                            padding: "8px 2px",
                            border: "1px solid transparent",
                            borderRadius: 8,
                            background: "none",
                            cursor: item.disabled ? "not-allowed" : "pointer",
                            opacity: item.disabled ? 0.35 : 1,
                            transition: "all 0.12s ease",
                            color: item.color,
                        }}
                        onMouseEnter={(e) => {
                            if (!item.disabled) {
                                e.currentTarget.style.background = "#f8fafc";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.borderColor = "transparent";
                        }}
                    >
                        {item.icon}
                        <span
                            style={{
                                fontSize: "0.72rem",
                                fontWeight: "500",
                                color: item.disabled ? "#94a3b8" : "#475569",
                                lineHeight: 1.2,
                                textAlign: "center",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );

    return createPortal(popover, document.body);
};

const numberToWords = (num) => {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const n = Math.round(parseFloat(num) || 0);
    if (n === 0) return "Zero Only /-";
    const inW = (x) => {
        if (x < 20) return a[x];
        if (x < 100) return b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : "");
        return a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + inW(x % 100) : "");
    };
    let r = "";
    if (n >= 10000000) r += inW(Math.floor(n / 10000000)) + " Crore ";
    if (n >= 100000) r += inW(Math.floor((n % 10000000) / 100000)) + " Lakh ";
    if (n >= 1000) r += inW(Math.floor((n % 100000) / 1000)) + " Thousand ";
    if (n >= 100) r += inW(Math.floor((n % 1000) / 100)) + " Hundred ";
    r += inW(n % 100);
    return r.trim() + " Only /-";
};

const StoresGRNDocument = ({ grn, vendorName, items = [], getDepartmentName: getDeptNameProp }) => {
    const fmt2 = (n) => (parseFloat(n) || 0).toFixed(2);
    const fmtDate = (d) => d ? dayjs(d).format('DD/MM/YYYY') : '—';

    let itemsArray = items;
    if (typeof itemsArray === 'string') {
        try { itemsArray = JSON.parse(itemsArray); } catch (e) { itemsArray = []; }
    }
    if (!Array.isArray(itemsArray)) itemsArray = [];

    const normalizedItems = itemsArray.map((it, i) => {
        const qty = parseFloat(it.quantity || it.qty || 0);
        const pack = it.packing || it.pack || 1;
        const free = parseFloat(it.free || it.free_qty || 0);
        const pRate = parseFloat(it.unitPrice || it.purchaseRate || it.packingPrice || it.packing_price || it.rate || 0);
        const pCost = parseFloat(it.unitCost || it.purchase_cost_display || (qty ? (parseFloat(it.purchaseCost || it.purchase_cost || 0) / qty) : 0) || pRate);
        const mrp = parseFloat(it.mrp || 0);
        const disc = parseFloat(it.purchase_discount_amt || it.discountedAmt || it.discount || 0);
        const taxable = parseFloat(it.item_value || it.taxableAmt || (pRate * (qty / (pack || 1))) - disc);
        const cgstRate = parseFloat(it.cgst_percent || it.cgstPercent || (it.tax ? it.tax / 2 : 0) || 0);
        const cgstAmt = parseFloat(it.cgst_amt || it.cgstAmt || (taxable * cgstRate / 100) || 0);
        const sgstRate = parseFloat(it.sgst_percent || it.sgstPercent || (it.tax ? it.tax / 2 : 0) || 0);
        const sgstAmt = parseFloat(it.sgst_amt || it.sgstAmt || (taxable * sgstRate / 100) || 0);
        const igstRate = parseFloat(it.igst_percent || it.igstPercent || 0);
        const igstAmt = parseFloat(it.igst_amt || it.igstAmt || it.igst || 0);
        const totalAmt = parseFloat(it.purchase_cost || it.purchaseCost || it.total_amount || (taxable + cgstAmt + sgstAmt + igstAmt));

        let expDisplay = it.expiry || it.expDate || "—";
        if (expDisplay && expDisplay !== "—") {
            const d = dayjs(expDisplay);
            if (d.isValid()) expDisplay = d.format("YYYY/MM");
        }

        return {
            sl: i + 1,
            product: it.name || it.itemName || it.item_name || "Item",
            hsn: it.hsn || it.hsn_code || "—",
            batch: it.batch || it.batch_no || "—",
            expiry: expDisplay,
            pack,
            qty,
            free,
            pRate,
            pCost,
            mrp,
            disc,
            taxable,
            cgstRate,
            cgstAmt,
            sgstRate,
            sgstAmt,
            igstRate,
            igstAmt,
            totalAmt
        };
    });

    const totalTaxable = normalizedItems.reduce((s, i) => s + i.taxable, 0);
    const totalCgst = normalizedItems.reduce((s, i) => s + i.cgstAmt, 0) || parseFloat(grn.cgst || 0);
    const totalSgst = normalizedItems.reduce((s, i) => s + i.sgstAmt, 0) || parseFloat(grn.sgst || 0);
    const totalIgst = normalizedItems.reduce((s, i) => s + i.igstAmt, 0) || parseFloat(grn.igst || 0);
    const totalDisc = normalizedItems.reduce((s, i) => s + i.disc, 0) || parseFloat(grn.total_discount || 0);
    const totalItemAmounts = normalizedItems.reduce((s, i) => s + i.totalAmt, 0) || parseFloat(grn.total_amount || 0);
    const taxOnFree = parseFloat(grn.tax_on_free_items || grn.tax_on_free || 0);
    const roundOff = parseFloat(grn.round_amount || 0);
    const totalGst = totalCgst + totalSgst + totalIgst;
    const netAmt = parseFloat(grn.net_invoice_amount?.$numberDecimal || grn.net_invoice_amount || grn.net_amount || (totalItemAmounts + taxOnFree + roundOff));

    const th = (extra = {}) => ({
        background: "#dbeafe",
        color: "#0c4a6e",
        border: "1px solid #7dd3fc",
        padding: "3px 4px",
        fontSize: "7.5px",
        fontWeight: 700,
        whiteSpace: "nowrap",
        textAlign: "center",
        verticalAlign: "middle",
        ...extra
    });
    const td = (extra = {}) => ({ border: "1px solid #cbd5e1", padding: "3px 4px", fontSize: "8px", whiteSpace: "nowrap", verticalAlign: "middle", ...extra });
    const tdr = (extra = {}) => td({ textAlign: "right", ...extra });
    const tdc = (extra = {}) => td({ textAlign: "center", ...extra });

    return (
        <div id="stores-grn-print-slip" style={{ fontFamily: "Arial, sans-serif", fontSize: "9px", color: "#000", border: "1.5px solid #0c4a6e", background: "#ffffff" }}>
            {/* Header */}
            <div style={{ textAlign: "center", padding: "10px 12px 6px", borderBottom: "1.5px solid #0c4a6e", background: "#ffffff" }}>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#0c4a6e", letterSpacing: "0.5px" }}>SHANMUGA HOSPITAL LIMITED</div>
                <div style={{ fontSize: "9.5px", color: "#334155", marginTop: "2px" }}>51/24.Saradha College Road, Salem - 636007,,</div>
                <div style={{ fontSize: "9.5px", color: "#334155" }}>Phone : 04272706666,info@smrft.org</div>
                <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#334155", marginTop: "2px" }}>GST Number : {grn.hospital_gst || ""}</div>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        marginTop: "6px",
                        color: "#0c4a6e"
                    }}
                >
                    GOODS RECEIPT NOTE - {grn.purchase_category ? grn.purchase_category.toUpperCase() : "OPENING STOCK (DRUG)"}
                </div>
            </div>

            {(grn.cancellation_remarks || grn.is_cancelled || grn.is_active === false) && (
                <div style={{
                    background: '#fef2f2',
                    borderBottom: '1.5px solid #ef4444',
                    padding: '8px 12px',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '9px',
                    fontWeight: 600
                }}>
                    <span>
                        <strong style={{ color: '#dc2626' }}>[CANCELLED GRN]</strong> Reason: {grn.cancellation_remarks || '—'}
                    </span>
                    {grn.cancelled_by && (
                        <span>Cancelled By: <strong>{grn.cancelled_by}</strong></span>
                    )}
                </div>
            )}

            {/* Metadata Strip */}
            <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1px solid #7dd3fc" }}>
                <tbody>
                    <tr>
                        <td style={{ verticalAlign: "top", padding: "5px 8px", fontSize: "8.5px", borderRight: "1px solid #7dd3fc", width: "33%" }}>
                            <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                                {[
                                    ["Invoice No", grn.invoice_no || grn.invoice_number],
                                    ["Invoice Date", fmtDate(grn.invoice_date)],
                                    ["Purchase No", grn.grn_number || grn.draft_number],
                                    ["Purchase Date", fmtDate(grn.date)],
                                ].map(([k, val]) => (
                                    <tr key={k}>
                                        <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: "8.5px", verticalAlign: "top", minWidth: 86 }}>{k}</td>
                                        <td style={{ fontSize: "8.5px", verticalAlign: "top" }}>: {val || "—"}</td>
                                    </tr>
                                ))}
                            </tbody></table>
                        </td>

                        <td style={{ verticalAlign: "top", padding: "5px 8px", fontSize: "8.5px", borderRight: "1px solid #7dd3fc", width: "34%" }}>
                            <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                                <tr>
                                    <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: "8.5px", verticalAlign: "top", minWidth: 86 }}>Supplier Name</td>
                                    <td style={{ fontSize: "8.5px", fontWeight: 700, verticalAlign: "top" }}>: {vendorName || grn.vendor_name || "OPENING STOCK"}</td>
                                </tr>
                                {[
                                    ["State", grn.vendor_state || ""],
                                    ["Phone", grn.vendor_phone || ""],
                                    ["GST Number", grn.vendor_gstin || grn.gstin || "******"],
                                ].map(([k, val]) => (
                                    <tr key={k}>
                                        <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: "8.5px", verticalAlign: "top", minWidth: 86 }}>{k}</td>
                                        <td style={{ fontSize: "8.5px", verticalAlign: "top" }}>: {val || "—"}</td>
                                    </tr>
                                ))}
                            </tbody></table>
                        </td>

                        <td style={{ verticalAlign: "top", padding: "5px 8px", fontSize: "8.5px", width: "33%" }}>
                            <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
                                {[
                                    ["Department", getDeptNameProp ? getDeptNameProp(grn.department, grn) : (grn.department_name || grn.department || "—")],
                                    ["Order Number", grn.order_number || ""],
                                    ["Payment Mode", grn.payment_mode || "CHEQUE"],
                                    ["Approved Date", grn.is_approved ? fmtDate(grn.approved_date || grn.date) : (grn.approved_date ? fmtDate(grn.approved_date) : "—")],
                                ].map(([k, val]) => (
                                    <tr key={k}>
                                        <td style={{ fontWeight: 700, whiteSpace: "nowrap", paddingRight: 4, fontSize: "8.5px", verticalAlign: "top", minWidth: 86 }}>{k}</td>
                                        <td style={{ fontSize: "8.5px", verticalAlign: "top" }}>: {val || "—"}</td>
                                    </tr>
                                ))}
                            </tbody></table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Items Table + Right Summary */}
            <div style={{ display: "flex", borderBottom: "1px solid #7dd3fc" }}>
                <div style={{ flex: 1, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
                        <thead>
                            <tr>
                                <th rowSpan={2} style={th({ width: 22 })}>Sl.</th>
                                <th rowSpan={2} style={th({ minWidth: 95, textAlign: "left" })}>Product</th>
                                <th rowSpan={2} style={th()}>HSN</th>
                                <th rowSpan={2} style={th()}>Batch</th>
                                <th rowSpan={2} style={th()}>Expiry</th>
                                <th rowSpan={2} style={th()}>Pack</th>
                                <th rowSpan={2} style={th()}>QTY</th>
                                <th rowSpan={2} style={th()}>Free</th>
                                <th rowSpan={2} style={th()}>P Rate</th>
                                <th rowSpan={2} style={th()}>P.cost</th>
                                <th rowSpan={2} style={th()}>MRP</th>
                                <th rowSpan={2} style={th()}>Discount</th>
                                <th rowSpan={2} style={th()}>Taxable Amount</th>
                                <th colSpan={2} style={th()}>CGST</th>
                                <th colSpan={2} style={th()}>SGST</th>
                                <th colSpan={2} style={th()}>IGST</th>
                                <th rowSpan={2} style={th()}>Total Amount</th>
                            </tr>
                            <tr>
                                <th style={th()}>Rate</th><th style={th()}>Amt</th>
                                <th style={th()}>Rate</th><th style={th()}>Amt</th>
                                <th style={th()}>Rate</th><th style={th()}>Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {normalizedItems.map((it) => (
                                <tr key={it.sl}>
                                    <td style={tdc()}>{it.sl}</td>
                                    <td style={td({ fontWeight: 600, maxWidth: 120, whiteSpace: "normal", textAlign: "left" })}>{it.product}</td>
                                    <td style={tdc()}>{it.hsn}</td>
                                    <td style={tdc()}>{it.batch}</td>
                                    <td style={tdc()}>{it.expiry}</td>
                                    <td style={tdc()}>{it.pack}</td>
                                    <td style={tdc()}>{it.qty}</td>
                                    <td style={tdc()}>{it.free}</td>
                                    <td style={tdr()}>{fmt2(it.pRate)}</td>
                                    <td style={tdr()}>{fmt2(it.pCost)}</td>
                                    <td style={tdr()}>{fmt2(it.mrp)}</td>
                                    <td style={tdr()}>{fmt2(it.disc)}</td>
                                    <td style={tdr()}>{fmt2(it.taxable)}</td>
                                    <td style={tdc()}>{it.cgstRate ? `${it.cgstRate}%` : "—"}</td>
                                    <td style={tdr()}>{fmt2(it.cgstAmt)}</td>
                                    <td style={tdc()}>{it.sgstRate ? `${it.sgstRate}%` : "—"}</td>
                                    <td style={tdr()}>{fmt2(it.sgstAmt)}</td>
                                    <td style={tdc()}>{it.igstRate ? `${it.igstRate}%` : "—"}</td>
                                    <td style={tdr()}>{fmt2(it.igstAmt)}</td>
                                    <td style={tdr({ fontWeight: 700 })}>{fmt2(it.totalAmt)}</td>
                                </tr>
                            ))}

                            <tr style={{ background: "#dbeafe" }}>
                                <td colSpan={12} style={td({ textAlign: "right", fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>Total</td>
                                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalTaxable)}</td>
                                <td style={td({ background: "#dbeafe" })} />
                                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalCgst)}</td>
                                <td style={td({ background: "#dbeafe" })} />
                                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalSgst)}</td>
                                <td style={td({ background: "#dbeafe" })} />
                                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalIgst)}</td>
                                <td style={tdr({ fontWeight: 700, color: "#0c4a6e", background: "#dbeafe" })}>{fmt2(totalItemAmounts)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Right totals panel */}
                <table style={{ borderLeft: "1px solid #7dd3fc", borderCollapse: "collapse", fontSize: "8.5px", minWidth: 140, alignSelf: "stretch" }}>
                    <tbody>
                        {[
                            ["Total", fmt2(totalTaxable), false],
                            ["Discount", fmt2(totalDisc), false],
                            ["Tax On Free", fmt2(taxOnFree), false],
                            ["Round off.", fmt2(roundOff), false],
                            ["Total GST", fmt2(totalGst), true],
                            ["Net Amount", fmt2(netAmt), true, "#e8f5e9", "#0f766e"],
                        ].map(([lbl, val, bold, bg, col]) => (
                            <tr key={lbl} style={{ background: bg || "transparent" }}>
                                <td style={{ padding: "3px 6px", borderBottom: "1px solid #e2e8f0", fontWeight: bold ? 800 : 600, color: col || "#334155", whiteSpace: "nowrap" }}>{lbl}</td>
                                <td style={{ padding: "3px 6px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: bold ? 800 : 700, color: col || "#0f172a", whiteSpace: "nowrap" }}>{val}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom strip */}
            <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1px solid #0c4a6e" }}>
                <tbody>
                    <tr>
                        <td style={{ padding: "4px 8px", fontSize: "8px", borderRight: "1px solid #7dd3fc", whiteSpace: "nowrap", width: "42%" }}>
                            <strong>GST Amount</strong>&nbsp;&nbsp;
                            CGST Amount : {fmt2(totalCgst)}&nbsp;&nbsp;
                            SGST Amount : {fmt2(totalSgst)}&nbsp;&nbsp;
                            IGST Amount : {fmt2(totalIgst)}
                        </td>
                        <td style={{ padding: "4px 8px", fontSize: "8px", borderRight: "1px solid #7dd3fc" }}>
                            <strong>Amount In Words</strong>&nbsp;&nbsp;
                            Rupee(s) {numberToWords(netAmt)}
                        </td>
                        <td style={{ padding: "4px 10px", fontSize: "8.5px", textAlign: "right", whiteSpace: "nowrap", minWidth: 110 }}>
                            <strong>Net Amount</strong>&nbsp;
                            <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0f766e" }}>{fmt2(netAmt)}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Signature strip */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 12px", fontSize: "8.5px", background: "#f8fafc" }}>
                <span><strong>Entered By :</strong> {grn.entered_by || grn.created_by_name || grn.created_by || "—"}</span>
                <span><strong>Checked By :</strong> —</span>
                <span><strong>Verified By :</strong> {grn.verified_by || (grn.is_approved ? "APPROVED" : "—")}</span>
            </div>
        </div>
    );
};

const deptSelectStyles = {
    control: (base, state) => ({
        ...base,
        height: '48px',
        minHeight: '48px',
        borderRadius: '12px',
        border: `1.5px solid ${state.isFocused ? '#1e3a8a' : colors.border}`,
        boxShadow: state.isFocused ? '0 0 0 2px rgba(30, 58, 138, 0.15)' : 'none',
        fontSize: '0.9rem',
        fontWeight: '600',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        minWidth: '220px',
        '&:hover': {
            borderColor: '#1e3a8a'
        }
    }),
    valueContainer: (base) => ({
        ...base,
        height: '48px',
        padding: '0 12px'
    }),
    input: (base) => ({
        ...base,
        margin: '0px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: colors.textMain
    }),
    singleValue: (base) => ({
        ...base,
        color: colors.textMain,
        fontWeight: '600',
        fontSize: '0.9rem'
    }),
    placeholder: (base) => ({
        ...base,
        color: colors.textMuted,
        fontWeight: '500',
        fontSize: '0.9rem'
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: '48px'
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 99999
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        zIndex: 99999,
        marginTop: '6px'
    }),
    menuList: (base) => ({
        ...base,
        padding: '6px',
        maxHeight: '260px'
    }),
    option: (base, state) => ({
        ...base,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '0.86rem',
        fontWeight: state.isSelected ? '700' : '500',
        backgroundColor: state.isSelected
            ? '#0d9488'
            : state.isFocused
            ? '#f0fdfa'
            : 'transparent',
        color: state.isSelected ? '#ffffff' : '#1e293b',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
    })
};

const StoresGRNReport = () => {
    const navigate = useNavigate();
    const [grns, setGrns] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const getBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || '';

    const today = dayjs().format('YYYY-MM-DD');
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    const [fromDate, setFromDate] = useState(oneMonthAgo);
    const [toDate, setToDate] = useState(today);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(getSelectedStoreDepartment() || 'ALL');
    useStoresDepartment((newDept) => setSelectedDepartment(newDept || 'ALL'));
    const departmentFilterRef = useRef(null);

    // F10 Shortcut to focus Department filter
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F10') {
                e.preventDefault();
                departmentFilterRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const [openPopover, setOpenPopover] = useState(null);
    const [popoverData, setPopoverData] = useState(null);
    const anchorRefs = useRef({});

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedGrn, setSelectedGrn] = useState(null);
    const [selectedGrnForApproval, setSelectedGrnForApproval] = useState(null);
    const [selectedGrnForView, setSelectedGrnForView] = useState(null);
    const [selectedGrnForCancel, setSelectedGrnForCancel] = useState(null);
    const [cancelRemark, setCancelRemark] = useState('');
    const [cancelError, setCancelError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount_paid: '',
        payment_method: 'Cash',
        payment_details: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { 
        fetchGRNs(); 
        fetchVendors();
        fetchDepartments();
    }, []);

    useEffect(() => {
        const handleDocClick = (e) => {
            if (e.target.closest('.grn-action-popover-wrap') || e.target.closest('.grn-action-popover')) {
                return;
            }
            setOpenPopover(null);
            setPopoverData(null);
        };
        document.addEventListener('mousedown', handleDocClick);
        return () => document.removeEventListener('mousedown', handleDocClick);
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/department-master/`, 'GET');
            if (response?.success) {
                const list = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];
                setDepartments(list);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const getDepartmentName = (deptCode, grnObj = null) => {
        const directName = grnObj?.department_name;
        const code = deptCode || grnObj?.department || grnObj?.department_code || '';
        const codeStr = String(code || '').trim();

        // 1. If departments list has a match for code (from backend_diagnostics_Departments)
        if (codeStr && departments && departments.length > 0) {
            const match = departments.find(d => 
                String(d.department_code || d.department_id || d.id || d._id || '').toLowerCase() === codeStr.toLowerCase()
            );
            if (match && (match.department_name || match.name)) {
                return match.department_name || match.name;
            }
        }

        // 2. If directName is valid and not a raw unmapped DEPT code
        if (directName && directName !== codeStr && !/^DEPT\d+$/i.test(directName)) {
            return directName;
        }

        // 3. If directName itself matches a code in departments
        if (directName && departments && departments.length > 0) {
            const match = departments.find(d => 
                String(d.department_code || d.department_id || d.id || d._id || '').toLowerCase() === String(directName).trim().toLowerCase()
            );
            if (match && (match.department_name || match.name)) {
                return match.department_name || match.name;
            }
        }

        return directName || codeStr || '—';
    };

    const fetchVendors = async () => {
        try {
            const response = await apiRequest(`${getBaseUrl.replace(/\/$/, '')}/general-store-vendors/`, 'GET');
            if (response?.success) {
                const list = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];
                setVendors(list);
            }
        } catch (error) {
            console.error("Error fetching general store vendors:", error);
        }
    };

    const fetchGRNs = async () => {
        setLoading(true);
        try {
            let url = `${getBaseUrl.replace(/\/$/, '')}/stores-grn/`;
            let method = 'GET';
            let data = null;

            if (fromDate || toDate || (selectedDepartment && selectedDepartment !== 'ALL')) {
                // Now using the same main endpoint, but with POST
                method = 'POST';
                data = { 
                    from_date: fromDate, 
                    to_date: toDate,
                    ...(selectedDepartment && selectedDepartment !== 'ALL' ? { department: selectedDepartment } : {})
                };
            }

            const response = await apiRequest(url, method, data);
            if (response.success) setGrns(response.data);
        } finally {
            setLoading(false);
        }
    };

    const clearFilter = () => {
        setFromDate(oneMonthAgo);
        setToDate(today);
        setSearchTerm('');
        setFilterStatus('ALL');
        setSelectedDepartment('ALL');
        setSelectedStoreDepartment('');
        setTimeout(() => fetchGRNs(), 0);
    };

    const handleOpenCancelModal = (grn) => {
        if (grn?.is_approved) {
            alert("Approved GRNs cannot be cancelled.");
            return;
        }
        setSelectedGrnForCancel(grn);
        setCancelRemark('');
        setCancelError('');
        setShowCancelModal(true);
    };

    const handleCloseCancelModal = () => {
        if (cancelling) return;
        setShowCancelModal(false);
        setSelectedGrnForCancel(null);
        setCancelRemark('');
        setCancelError('');
    };

    const handleConfirmCancel = async () => {
        if (!selectedGrnForCancel) return;
        const trimmed = cancelRemark.trim();
        if (!trimmed) {
            setCancelError('Cancellation remark is required. Please provide a reason.');
            return;
        }

        setCancelling(true);
        setCancelError('');
        try {
            const grnNumber = selectedGrnForCancel.grn_number;
            const response = await apiRequest(
                `${getBaseUrl.replace(/\/$/, '')}/stores-grn/${grnNumber}/?cancellation_remarks=${encodeURIComponent(trimmed)}`,
                'DELETE',
                {
                    cancellation_remarks: trimmed,
                    remark: trimmed
                }
            );

            if (response.success) {
                setShowCancelModal(false);
                setSelectedGrnForCancel(null);
                setCancelRemark('');
                setCancelError('');
                alert(`GRN ${grnNumber} has been successfully cancelled.`);
                fetchGRNs();
            } else {
                const errMsg = response.error || (response.data && response.data.error) || 'Failed to cancel GRN.';
                setCancelError(errMsg);
            }
        } catch (err) {
            setCancelError('An unexpected error occurred while cancelling the GRN.');
        } finally {
            setCancelling(false);
        }
    };

    const handleDelete = (grnNumber, grn) => {
        handleOpenCancelModal(grn || { grn_number: grnNumber });
    };
    
    const handleApprove = (grn) => {
        setSelectedGrnForApproval(grn);
        setShowApproveModal(true);
    };

    const confirmFinalApproval = async () => {
        if (!selectedGrnForApproval) return;
        
        const payload = { 
            is_approved: true
        };

        // Frontend fix for Djongo JSON validation issues
        // We ensure JSON fields are actual arrays/objects, not strings
        // HEURISTIC: Only include them in payload if we detect they are "bad" (i.e. strings)
        // OR if they lack timestamps (which causes backend duplication)
        
        let needsItemsFix = typeof selectedGrnForApproval.items === 'string';
        if (needsItemsFix) {
            try { payload.items = JSON.parse(selectedGrnForApproval.items); } catch(e) { payload.items = []; }
        }

        let ps = selectedGrnForApproval.payment_status;
        if (typeof ps === 'string') {
            try { ps = JSON.parse(ps); } catch(e) { ps = []; }
        }
        
        // Fix for backend duplication: assign timestamps to any entries that lack them
        if (Array.isArray(ps)) {
            const hasNoTimestamps = ps.some(p => !p.timestamp);
            if (hasNoTimestamps || typeof selectedGrnForApproval.payment_status === 'string') {
                payload.payment_status = ps.map((p, idx) => ({
                    ...p,
                    timestamp: p.timestamp || new Date(Date.now() + idx).toISOString()
                }));
            }
        }

        setSubmitting(true);
        try {
            const response = await apiRequest(
                `${getBaseUrl.replace(/\/$/, '')}/stores-grn/${selectedGrnForApproval.grn_number}/`, 
                'PATCH', 
                payload
            );
            if (response.success) {
                alert(`GRN ${selectedGrnForApproval.grn_number} approved successfully.`);
                setShowApproveModal(false);
                fetchGRNs();
            } else {
                alert("Error approving GRN: " + (response.error?.message || "Unknown error"));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportExcel = () => {
        const dataToExport = grns.map(grn => {
            const { totalPaid, netAmt, pending, latest } = getPaymentInfo(grn);
            return {
                "GRN Number": grn.grn_number,
                "Date": grn.date ? new Date(grn.date).toLocaleDateString('en-IN') : '-',
                "Vendor": getVendorName(grn.vendor_id),
                "Category": grn.purchase_category,
                "Department": getDepartmentName(grn.department, grn),
                "Invoice No": grn.invoice_no,
                "Net Amount": netAmt.toFixed(2),
                "Total Paid": totalPaid.toFixed(2),
                "Pending Amount": pending.toFixed(2),
                "Status": latest.status,
                "Approved": grn.is_approved ? "Yes" : "No",
                "Entered By": grn.entered_by || grn.created_by_name || grn.created_by || '-'
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GRN Report");
        XLSX.writeFile(workbook, `GRN_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrintTable = () => {
        const printContent = `
            <html>
                <head>
                    <title>GRN Report</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        h2 { text-align: center; color: #333; }
                        .footer { margin-top: 20px; text-align: right; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <h2>Stores GRN Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>GRN No</th>
                                <th>Date</th>
                                <th>Vendor</th>
                                <th>Category</th>
                                <th>Department</th>
                                <th>Invoice No</th>
                                <th>Net Amt</th>
                                <th>Paid</th>
                                <th>Pending</th>
                                <th>Status</th>
                                <th>Approved</th>
                                <th>Entered By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${grns.map(grn => {
                                const { totalPaid, netAmt, pending, latest } = getPaymentInfo(grn);
                                return `
                                    <tr>
                                        <td>${grn.grn_number}</td>
                                        <td>${grn.date ? new Date(grn.date).toLocaleDateString('en-IN') : '-'}</td>
                                        <td>${getVendorName(grn.vendor_id)}</td>
                                        <td>${grn.purchase_category}</td>
                                        <td>${getDepartmentName(grn.department, grn)}</td>
                                        <td>${grn.invoice_no}</td>
                                        <td>₹${netAmt.toFixed(2)}</td>
                                        <td>₹${totalPaid.toFixed(2)}</td>
                                        <td>₹${pending.toFixed(2)}</td>
                                        <td>${latest.status}</td>
                                        <td>${grn.is_approved ? "Yes" : "No"}</td>
                                        <td>${grn.entered_by || grn.created_by_name || grn.created_by || '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    <div class="footer">Generated on: ${new Date().toLocaleString()}</div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const handlePrintRow = (grn) => {
        let itemsArray = grn.items;
        if (typeof itemsArray === 'string') {
            try {
                itemsArray = JSON.parse(itemsArray);
            } catch (e) {
                try {
                    const cleaned = itemsArray.replace(/OrderedDict\(/g, '').replace(/\)/g, '');
                    itemsArray = JSON.parse(cleaned);
                } catch (e2) {
                    itemsArray = [];
                }
            }
        }
        if (!Array.isArray(itemsArray)) itemsArray = [];

        const fmt2 = (n) => (parseFloat(n) || 0).toFixed(2);
        const fmtDate = (d) => d ? dayjs(d).format('DD/MM/YYYY') : '—';

        const normalizedItems = itemsArray.map((it, i) => {
            const qty = parseFloat(it.quantity || it.qty || 0);
            const pack = it.packing || it.pack || 1;
            const free = parseFloat(it.free || it.free_qty || 0);
            const pRate = parseFloat(it.unitPrice || it.purchaseRate || it.packingPrice || it.packing_price || it.rate || 0);
            const pCost = parseFloat(it.unitCost || it.purchase_cost_display || (qty ? (parseFloat(it.purchaseCost || it.purchase_cost || 0) / qty) : 0) || pRate);
            const mrp = parseFloat(it.mrp || 0);
            const disc = parseFloat(it.purchase_discount_amt || it.discountedAmt || it.discount || 0);
            const taxable = parseFloat(it.item_value || it.taxableAmt || (pRate * (qty / (pack || 1))) - disc);
            const cgstRate = parseFloat(it.cgst_percent || it.cgstPercent || (it.tax ? it.tax / 2 : 0) || 0);
            const cgstAmt = parseFloat(it.cgst_amt || it.cgstAmt || (taxable * cgstRate / 100) || 0);
            const sgstRate = parseFloat(it.sgst_percent || it.sgstPercent || (it.tax ? it.tax / 2 : 0) || 0);
            const sgstAmt = parseFloat(it.sgst_amt || it.sgstAmt || (taxable * sgstRate / 100) || 0);
            const igstRate = parseFloat(it.igst_percent || it.igstPercent || 0);
            const igstAmt = parseFloat(it.igst_amt || it.igstAmt || it.igst || 0);
            const totalAmt = parseFloat(it.purchase_cost || it.purchaseCost || it.total_amount || (taxable + cgstAmt + sgstAmt + igstAmt));

            let expDisplay = it.expiry || it.expDate || "—";
            if (expDisplay && expDisplay !== "—") {
                const d = dayjs(expDisplay);
                if (d.isValid()) expDisplay = d.format("YYYY/MM");
            }

            return {
                sl: i + 1,
                product: it.name || it.itemName || it.item_name || "Item",
                hsn: it.hsn || it.hsn_code || "—",
                batch: it.batch || it.batch_no || "—",
                expiry: expDisplay,
                pack,
                qty,
                free,
                pRate,
                pCost,
                mrp,
                disc,
                taxable,
                cgstRate,
                cgstAmt,
                sgstRate,
                sgstAmt,
                igstRate,
                igstAmt,
                totalAmt
            };
        });

        const totalTaxable = normalizedItems.reduce((s, i) => s + i.taxable, 0);
        const totalCgst = normalizedItems.reduce((s, i) => s + i.cgstAmt, 0) || parseFloat(grn.cgst || 0);
        const totalSgst = normalizedItems.reduce((s, i) => s + i.sgstAmt, 0) || parseFloat(grn.sgst || 0);
        const totalIgst = normalizedItems.reduce((s, i) => s + i.igstAmt, 0) || parseFloat(grn.igst || 0);
        const totalDisc = normalizedItems.reduce((s, i) => s + i.disc, 0) || parseFloat(grn.total_discount || 0);
        const totalItemAmounts = normalizedItems.reduce((s, i) => s + i.totalAmt, 0) || parseFloat(grn.total_amount || 0);
        const taxOnFree = parseFloat(grn.tax_on_free_items || grn.tax_on_free || 0);
        const roundOff = parseFloat(grn.round_amount || 0);
        const totalGst = totalCgst + totalSgst + totalIgst;
        const netAmt = parseFloat(grn.net_invoice_amount?.$numberDecimal || grn.net_invoice_amount || grn.net_amount || (totalItemAmounts + taxOnFree + roundOff));
        const vendorName = getVendorName(grn.vendor_id);

        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>GRN - ${grn.grn_number}</title>
                    <style>
                        * { box-sizing: border-box; }
                        @page { size: A4 landscape; margin: 8mm; }
                        body { font-family: Arial, sans-serif; font-size: 8.5px; color: #000; margin: 0; padding: 6px; }
                        table { border-collapse: collapse; }
                        th { background: #dbeafe; color: #0c4a6e; border: 1px solid #7dd3fc; padding: 3px 4px; font-size: 7.5px; font-weight: 700; white-space: nowrap; text-align: center; }
                        td { border: 1px solid #cbd5e1; padding: 3px 4px; font-size: 8px; white-space: nowrap; vertical-align: middle; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        .total-cell { background: #dbeafe; color: #0c4a6e; font-weight: 700; text-align: right; }
                        @media print {
                            @page { margin: 6mm; }
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div style="font-family: Arial, sans-serif; font-size: 9px; color: #000; border: 1.5px solid #0c4a6e; background: #ffffff;">
                        <div style="text-align: center; padding: 8px 12px 6px; border-bottom: 1.5px solid #0c4a6e;">
                            <div style="font-size: 15px; font-weight: 900; color: #0c4a6e; letter-spacing: 0.5px;">SHANMUGA HOSPITAL LIMITED</div>
                            <div style="font-size: 9px; color: #334155; margin-top: 2px;">51/24.Saradha College Road, Salem - 636007,,</div>
                            <div style="font-size: 9px; color: #334155;">Phone : 04272706666, info@smrft.org</div>
                            <div style="font-size: 9px; font-weight: 700; color: #334155; margin-top: 2px;">GST Number : ${grn.hospital_gst || ''}</div>
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 5px; color: #0c4a6e;">
                                GOODS RECEIPT NOTE - ${grn.purchase_category ? grn.purchase_category.toUpperCase() : 'OPENING STOCK (DRUG)'}
                            </div>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #7dd3fc;">
                            <tbody>
                                <tr>
                                    <td style="vertical-align: top; padding: 5px 8px; font-size: 8.5px; border-right: 1px solid #7dd3fc; width: 33%;">
                                        <table style="border-collapse: collapse; width: 100%;">
                                            <tr><td style="border:none;font-weight:700;width:90px;">Invoice No</td><td style="border:none;">: ${grn.invoice_no || grn.invoice_number || '—'}</td></tr>
                                            <tr><td style="border:none;font-weight:700;">Invoice Date</td><td style="border:none;">: ${fmtDate(grn.invoice_date)}</td></tr>
                                            <tr><td style="border:none;font-weight:700;">Purchase No</td><td style="border:none;">: ${grn.grn_number || '—'}</td></tr>
                                            <tr><td style="border:none;font-weight:700;">Purchase Date</td><td style="border:none;">: ${fmtDate(grn.date)}</td></tr>
                                        </table>
                                    </td>
                                    <td style="vertical-align: top; padding: 5px 8px; font-size: 8.5px; border-right: 1px solid #7dd3fc; width: 34%;">
                                        <table style="border-collapse: collapse; width: 100%;">
                                            <tr><td style="border:none;font-weight:700;width:95px;">Supplier Name</td><td style="border:none;font-weight:700;">: ${vendorName || grn.vendor_name || 'OPENING STOCK'}</td></tr>
                                            <tr><td style="border:none;font-weight:700;">State</td><td style="border:none;">: ${grn.vendor_state || '—'}</td></tr>
                                            <tr><td style="border:none;font-weight:700;">Phone</td><td style="border:none;">: ${grn.vendor_phone || '—'}</td></tr>
                                            <tr><td style="border:none;font-weight:700;">GST Number</td><td style="border:none;">: ${grn.vendor_gstin || grn.gstin || '******'}</td></tr>
                                        </table>
                                    </td>
                                    <td style="vertical-align: top; padding: 5px 8px; font-size: 8.5px; width: 33%;">
                                        <table style="border-collapse: collapse; width: 100%;">
                                            <tr><td style="border:none;font-weight:700;width:95px;">Department</td><td style="border:none;font-weight:600;color:#0d9488;">: ${getDepartmentName(grn.department, grn)}</td></tr>
                                            <tr><td style="border:none;font-weight:700;width:95px;">Order Number</td><td style="border:none;">: ${grn.order_number || grn.po_number || '—'}</td></tr>
                                            <tr><td style="border:none;font-weight:700;">Payment Mode</td><td style="border:none;">: ${grn.payment_mode || 'CHEQUE'}</td></tr>
                                            <tr><td style="border:none;font-weight:700;">Approved Date</td><td style="border:none;">: ${grn.is_approved ? fmtDate(grn.approved_date || grn.date) : '—'}</td></tr>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="display: flex; border-bottom: 1px solid #0c4a6e;">
                            <div style="flex: 1; overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr>
                                            <th rowspan="2" style="width: 22px;">Sl.</th>
                                            <th rowspan="2" style="min-width: 95px; text-align: left;">Product</th>
                                            <th rowspan="2">HSN</th>
                                            <th rowspan="2">Batch</th>
                                            <th rowspan="2">Expiry</th>
                                            <th rowspan="2">Pack</th>
                                            <th rowspan="2">QTY</th>
                                            <th rowspan="2">Free</th>
                                            <th rowspan="2">P Rate</th>
                                            <th rowspan="2">P.cost</th>
                                            <th rowspan="2">MRP</th>
                                            <th rowspan="2">Discount</th>
                                            <th rowspan="2">Taxable Amount</th>
                                            <th colspan="2">CGST</th>
                                            <th colspan="2">SGST</th>
                                            <th colspan="2">IGST</th>
                                            <th rowspan="2">Total Amount</th>
                                        </tr>
                                        <tr>
                                            <th>Rate</th><th>Amt</th>
                                            <th>Rate</th><th>Amt</th>
                                            <th>Rate</th><th>Amt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${normalizedItems.map((it) => `
                                            <tr>
                                                <td class="text-center">${it.sl}</td>
                                                <td class="text-left" style="font-weight: 600; max-width: 120px; white-space: normal;">${it.product}</td>
                                                <td class="text-center">${it.hsn}</td>
                                                <td class="text-center">${it.batch}</td>
                                                <td class="text-center">${it.expiry}</td>
                                                <td class="text-center">${it.pack}</td>
                                                <td class="text-center">${it.qty}</td>
                                                <td class="text-center">${it.free}</td>
                                                <td class="text-right">${fmt2(it.pRate)}</td>
                                                <td class="text-right">${fmt2(it.pCost)}</td>
                                                <td class="text-right">${fmt2(it.mrp)}</td>
                                                <td class="text-right">${fmt2(it.disc)}</td>
                                                <td class="text-right">${fmt2(it.taxable)}</td>
                                                <td class="text-center">${it.cgstRate ? it.cgstRate + '%' : '—'}</td>
                                                <td class="text-right">${fmt2(it.cgstAmt)}</td>
                                                <td class="text-center">${it.sgstRate ? it.sgstRate + '%' : '—'}</td>
                                                <td class="text-right">${fmt2(it.sgstAmt)}</td>
                                                <td class="text-center">${it.igstRate ? it.igstRate + '%' : '—'}</td>
                                                <td class="text-right">${fmt2(it.igstAmt)}</td>
                                                <td class="text-right" style="font-weight: 700;">${fmt2(it.totalAmt)}</td>
                                            </tr>
                                        `).join('')}
                                        <tr style="background: #dbeafe;">
                                            <td colspan="12" class="total-cell" style="text-align: right;">Total</td>
                                            <td class="total-cell">${fmt2(totalTaxable)}</td>
                                            <td style="background: #dbeafe; border: 1px solid #cbd5e1;"></td>
                                            <td class="total-cell">${fmt2(totalCgst)}</td>
                                            <td style="background: #dbeafe; border: 1px solid #cbd5e1;"></td>
                                            <td class="total-cell">${fmt2(totalSgst)}</td>
                                            <td style="background: #dbeafe; border: 1px solid #cbd5e1;"></td>
                                            <td class="total-cell">${fmt2(totalIgst)}</td>
                                            <td class="total-cell">${fmt2(totalItemAmounts)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <table style="border-left: 1px solid #7dd3fc; border-collapse: collapse; font-size: 8.5px; min-width: 140px; align-self: stretch;">
                                <tbody>
                                    <tr><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Total</td><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${fmt2(totalTaxable)}</td></tr>
                                    <tr><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Discount</td><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${fmt2(totalDisc)}</td></tr>
                                    <tr><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Tax On Free</td><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${fmt2(taxOnFree)}</td></tr>
                                    <tr><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Round off.</td><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${fmt2(roundOff)}</td></tr>
                                    <tr><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; font-weight: 800;">Total GST</td><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 800;">${fmt2(totalGst)}</td></tr>
                                    <tr style="background: #e8f5e9;"><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #0f766e;">Net Amount</td><td style="padding: 3px 6px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 800; color: #0f766e;">${fmt2(netAmt)}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #0c4a6e;">
                            <tbody>
                                <tr>
                                    <td style="padding: 4px 8px; font-size: 8px; border-right: 1px solid #7dd3fc; white-space: nowrap; width: 42%;">
                                        <strong>GST Amount</strong>&nbsp;&nbsp;
                                        CGST Amount : ${fmt2(totalCgst)}&nbsp;&nbsp;
                                        SGST Amount : ${fmt2(totalSgst)}&nbsp;&nbsp;
                                        IGST Amount : ${fmt2(totalIgst)}
                                    </td>
                                    <td style="padding: 4px 8px; font-size: 8px; border-right: 1px solid #7dd3fc;">
                                        <strong>Amount In Words</strong>&nbsp;&nbsp;
                                        Rupee(s) ${numberToWords(netAmt)}
                                    </td>
                                    <td style="padding: 4px 10px; font-size: 8.5px; text-align: right; white-space: nowrap; min-width: 110px;">
                                        <strong>Net Amount</strong>&nbsp;
                                        <span style="font-weight: 800; font-size: 11px; color: #0f766e;">${fmt2(netAmt)}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="display: flex; justify-content: space-between; padding: 5px 12px; font-size: 8.5px; background: #f8fafc;">
                            <span><strong>Entered By :</strong> ${grn.entered_by || grn.created_by_name || grn.created_by || '—'}</span>
                            <span><strong>Checked By :</strong> —</span>
                            <span><strong>Verified By :</strong> ${grn.verified_by || (grn.is_approved ? 'APPROVED' : '—')}</span>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=1150,height=750');
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 400);
    };

    const openPaymentModal = (grn) => {
        setSelectedGrn(grn);
        let paymentArray = grn.payment_status;
        if (typeof paymentArray === 'string') {
            try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
        }
        const lastStatus = paymentArray && paymentArray.length > 0
            ? paymentArray[paymentArray.length - 1]
            : { pending_amount: grn.net_invoice_amount };
        setPaymentData({
            amount_paid: '',
            payment_method: 'Cash',
            payment_details: ''
        });
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const amountPaid = parseFloat(paymentData.amount_paid);
        if (isNaN(amountPaid) || amountPaid <= 0) { alert("Please enter a valid amount"); return; }

        let paymentArray = selectedGrn.payment_status;
        if (typeof paymentArray === 'string') {
            try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
        }

        const lastStatus = paymentArray && paymentArray.length > 0
            ? paymentArray[paymentArray.length - 1]
            : { pending_amount: selectedGrn.net_invoice_amount };

        const currentPending = parseFloat(lastStatus.pending_amount) || 0;
        if (amountPaid > currentPending) {
            alert(`Amount (₹${amountPaid}) exceeds pending amount (₹${currentPending})!`);
            return;
        }

        const newPending = currentPending - amountPaid;
        const newRecord = {
            status: newPending <= 0 ? "Paid" : "Partially Paid",
            amount_paid: amountPaid,
            pending_amount: newPending,
            payment_method: paymentData.payment_method,
            payment_details: paymentData.payment_details,
            payment_date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };

        const updatedPaymentStatus = [...(paymentArray || []), newRecord];
        const currentTotalPaid = parseFloat(selectedGrn.total_amount_paid?.$numberDecimal || selectedGrn.total_amount_paid || 0);
        const updatedTotalPaid = currentTotalPaid + amountPaid;

        setSubmitting(true);
        try {
            const response = await apiRequest(
                `${getBaseUrl.replace(/\/$/, '')}/stores-grn/${selectedGrn.grn_number}/`,
                'PATCH',
                { payment_status: updatedPaymentStatus, total_amount_paid: updatedTotalPaid }
            );
            if (response.success) {
                setShowPaymentModal(false);
                fetchGRNs();
            } else {
                alert("Error updating payment: " + JSON.stringify(response.error));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getPaymentInfo = (grn) => {
        let paymentArray = grn.payment_status;
        if (typeof paymentArray === 'string') {
            try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
        }
        const latest = paymentArray && paymentArray.length > 0
            ? paymentArray[paymentArray.length - 1]
            : { status: 'Not Paid', pending_amount: grn.net_invoice_amount };
        const totalPaid = parseFloat(grn.total_amount_paid?.$numberDecimal || grn.total_amount_paid || 0);
        const netAmt = parseFloat(grn.net_invoice_amount?.$numberDecimal || grn.net_invoice_amount || 0);
        const pending = parseFloat(latest.pending_amount) || 0;
        return { latest, totalPaid, netAmt, pending, paymentArray };
    };

    const getVendorName = (vendorId) => {
        if (!vendorId) return '-';
        if (!vendors || vendors.length === 0) return vendorId;
        const vendor = vendors.find(v => 
            String(v.vendor_id) === String(vendorId) || 
            String(v.id) === String(vendorId) ||
            String(v.vendor_code) === String(vendorId) ||
            String(v.code) === String(vendorId)
        );
        return vendor ? (vendor.vendor_name || vendor.name || vendor.vendorName || vendor.vendor_id || vendorId) : vendorId;
    };

    const getStatusBadge = (status) => {
        const colorMap = {
            'Paid': { bg: '#f0fdf4', color: '#166534' },
            'Partially Paid': { bg: '#fffbeb', color: '#92400e' },
            'Not Paid': { bg: '#fff5f5', color: '#b91c1c' },
        };
        const style = colorMap[status] || colorMap['Not Paid'];
        return (
            <span style={{
                padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                backgroundColor: style.bg, color: style.color, border: `1px solid ${style.bg}`,
                whiteSpace: 'nowrap', textTransform: 'uppercase'
            }}>{status}</span>
        );
    };

    const getPendingInfo = (grn) => {
        const { latest } = getPaymentInfo(grn);
        let paymentArray = grn.payment_status;
        if (typeof paymentArray === 'string') {
            try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
        }
        const lastStatus = paymentArray && paymentArray.length > 0
            ? paymentArray[paymentArray.length - 1]
            : { pending_amount: grn.net_invoice_amount };
        return parseFloat(lastStatus.pending_amount) || 0;
    };

    const getTotalStats = () => {
        const stats = grns.reduce((acc, grn) => {
            const { netAmt, pending } = getPaymentInfo(grn);
            acc.totalNet += netAmt;
            acc.totalPending += pending;
            return acc;
        }, { totalNet: 0, totalPending: 0 });
        
        return stats;
    };

    const stats = getTotalStats();

    const filteredGrns = grns.filter(grn => {
        const vName = getVendorName(grn.vendor_id)?.toLowerCase() || '';
        const grnNo = (grn.grn_number || '').toLowerCase();
        const invNo = (grn.invoice_no || '').toLowerCase();
        const cat = (grn.purchase_category || '').toLowerCase();
        const deptDisplay = getDepartmentName(grn.department, grn);
        const deptSearchStr = `${deptDisplay} ${grn.department || ''} ${grn.department_code || ''}`.toLowerCase();
        const enteredBy = (grn.entered_by || grn.created_by_name || grn.created_by || '').toLowerCase();
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch = !q || vName.includes(q) || grnNo.includes(q) || invNo.includes(q) || cat.includes(q) || deptSearchStr.includes(q) || enteredBy.includes(q);

        if (!matchesSearch) return false;

        if (selectedDepartment && selectedDepartment !== 'ALL') {
            const rawCode = String(grn.department || grn.department_code || '').trim().toLowerCase();
            const resolvedName = String(deptDisplay || '').trim().toLowerCase();
            const target = String(selectedDepartment).trim().toLowerCase();
            const selDeptObj = departments.find(d => 
                String(d.department_code || d.department_id || d.id || '').toLowerCase() === target
            );
            const selName = String(selDeptObj?.department_name || selDeptObj?.name || '').toLowerCase();

            if (rawCode !== target && resolvedName !== target && (!selName || resolvedName !== selName)) {
                return false;
            }
        }
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'APPROVED') return !!grn.is_approved;
        if (filterStatus === 'UNAPPROVED') return !grn.is_approved;
        const { latest } = getPaymentInfo(grn);
        if (filterStatus === 'PAID') return latest.status === 'Paid';
        if (filterStatus === 'PENDING') return latest.status !== 'Paid';
        return true;
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
    } = usePagination(filteredGrns, 15);

    return (
        <PageWrapper>
            <Container>
                {/* Header Section */}
                <div style={{
                    background: '#ffffff',
                    padding: '24px 40px',
                    borderBottom: `2px solid ${colors.primary}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: colors.textMain }}>Stores GRN Report</h1>
                        <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>Comprehensive view of your goods receipt inventory</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button 
                            secondary
                            onClick={handleExportExcel}
                            style={{ 
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            📊 Export Excel
                        </Button>
                        <Button
                            onClick={() => navigate('/StoresGRNGeneration', { state: { fromAnalysis: true } })}
                            style={{ 
                                background: colors.primary,
                                color: 'white', 
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            + New GRN
                        </Button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <StatsGrid>
                    <StatsCard>
                        <div className="label">Total Invoices</div>
                        <div className="value">{grns.length}</div>
                        <div className="sub-value">Current Period</div>
                    </StatsCard>
                    <StatsCard>
                        <div className="label">Net Total Value</div>
                        <div className="value">₹{stats.totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div className="sub-value" style={{ color: colors.primary }}>Across all categories</div>
                    </StatsCard>
                    <StatsCard trend="down">
                        <div className="label">Total Outstanding</div>
                        <div className="value" style={{ color: stats.totalPending > 0 ? '#dc2626' : '#16a34a' }}>
                            ₹{stats.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="sub-value">Pending Payments</div>
                    </StatsCard>
                    <StatsCard>
                        <div className="label">Approved GRNs</div>
                        <div className="value">{grns.filter(g => g.is_approved).length}</div>
                        <div className="sub-value" style={{ color: '#0d9488' }}>🛡️ Verified Records</div>
                    </StatsCard>
                </StatsGrid>

                {/* Filter Card */}
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#1e3a8a', // Dark blue selection circle
                            borderRadius: 12,
                            colorLink: '#1e3a8a',
                            colorLinkHover: '#2563eb',
                        },
                        components: {
                            DatePicker: {
                                headerBg: '#1e3a8a', // Matching image header
                                headerColor: '#ffffff',
                                colorIcon: '#ffffff', // For arrows in header
                                colorTextHeading: '#ffffff', // For month/year text
                                colorPrimary: '#1e3a8a', // For selection circle
                            }
                        }
                    }}
                >
                    <CalendarGlobalStyles />
                    <div style={{
                        background: 'white', 
                        margin: '20px 22px 0', 
                        padding: '24px', 
                        borderRadius: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: `1px solid ${colors.border}`
                    }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: colors.textMuted, fontWeight: '700', pointerEvents: 'none', fontSize: '0.85rem' }}>From</span>
                                    <DatePicker 
                                        value={fromDate ? dayjs(fromDate) : dayjs(oneMonthAgo)}
                                        onChange={(d) => d && setFromDate(d.format('YYYY-MM-DD'))}
                                        format="DD/MM/YYYY"
                                        placeholder="17/03/2026"
                                        suffixIcon={null}
                                        allowClear={false}
                                        style={{ 
                                            width: '210px', 
                                            padding: '10px 15px 10px 68px', 
                                            borderRadius: '12px', 
                                            border: `1.5px solid ${colors.border}`,
                                            height: '48px',
                                            fontSize: '0.95rem',
                                            fontWeight: '600'
                                        }}
                                    />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: colors.textMuted, fontWeight: '700', pointerEvents: 'none', fontSize: '0.85rem' }}>To</span>
                                    <DatePicker 
                                        value={toDate ? dayjs(toDate) : dayjs(today)}
                                        onChange={(d) => d && setToDate(d.format('YYYY-MM-DD'))}
                                        format="DD/MM/YYYY"
                                        placeholder="17/03/2026"
                                        suffixIcon={null}
                                        allowClear={false}
                                        style={{ 
                                            width: '210px', 
                                            padding: '10px 15px 10px 48px', 
                                            borderRadius: '12px', 
                                            border: `1.5px solid ${colors.border}`,
                                            height: '48px',
                                            fontSize: '0.95rem',
                                            fontWeight: '600'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <DepartmentFilterControl
                                    departments={departments}
                                    onDepartmentChange={(dept) => {
                                        setSelectedDepartment(dept || 'ALL');
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search GRN, Vendor, Invoice, Department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        border: `1.5px solid ${colors.border}`,
                                        height: '48px',
                                        minWidth: '220px',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                                <Button 
                                    onClick={fetchGRNs} 
                                    style={{ padding: '10px 20px', borderRadius: '8px', height: '48px' }}
                                >
                                    🔍 Search
                                </Button>
                                <Button 
                                    secondary 
                                    onClick={clearFilter} 
                                    style={{ padding: '10px 18px', borderRadius: '8px', height: '48px' }}
                                >
                                    ✕ Reset
                                </Button>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>Total / Filtered</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: colors.primary }}>{filteredGrns.length} / {grns.length}</div>
                            </div>
                        </div>
                    </div>
                </ConfigProvider>

                {/* Table Section */}
                <div style={{ padding: '0 22px 40px' }}>
                    <div style={{ 
                        background: 'white',
                        borderRadius: '20px', 
                        overflow: 'hidden', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        border: `1px solid ${colors.border}`
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <Table>
                                <thead>
                                    <Tr style={{ background: '#e6f4f1' }}>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>#</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>GRN NO</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>DATE</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>VENDOR</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>CATEGORY / DEPT</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>INVOICE NO</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>INVOICE DATE</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>PAYMENT</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>NET AMOUNT</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>STATUS</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px' }}>ENTERED BY</Th>
                                        <Th style={{ background: '#e6f4f1', color: '#1e293b', fontWeight: '800', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 12px', textAlign: 'center' }}>ACTIONS</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <Tr><Td colSpan="12" style={{ textAlign: 'center', padding: '100px' }}>
                                            <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⏳</div>
                                            <div style={{ color: colors.textMuted, marginTop: '20px', fontWeight: '700', fontSize: '1.1rem' }}>Updating Records...</div>
                                        </Td></Tr>
                                    ) : filteredGrns.length === 0 ? (
                                        <Tr><Td colSpan="12" style={{ textAlign: 'center', padding: '120px' }}>
                                            <div style={{ fontSize: '5rem', opacity: 0.3, marginBottom: '20px' }}>📦</div>
                                            <div style={{ color: colors.textMuted, fontSize: '1.4rem', fontWeight: '800' }}>No GRNs found</div>
                                            <div style={{ color: colors.textMuted, marginTop: '8px', fontSize: '0.9rem' }}>Try adjusting your search or date filters</div>
                                            <Button secondary onClick={clearFilter} style={{ marginTop: '30px', borderRadius: '12px', padding: '12px 30px' }}>Reset Filters</Button>
                                        </Td></Tr>
                                    ) : pageData.map((grn, idx) => {
                                        const { totalPaid, netAmt, pending, latest } = getPaymentInfo(grn);
                                        const serialNo = startIdx + idx + 1;
                                        return (
                                            <Tr key={grn.grn_number} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <Td style={{ color: '#64748b', fontWeight: '600', fontSize: '0.84rem', padding: '12px 10px' }}>
                                                    {serialNo}
                                                </Td>
                                                <Td style={{ padding: '12px 10px' }}>
                                                    <span style={{ 
                                                        background: '#dcfce7', 
                                                        color: '#15803d', 
                                                        fontWeight: '700', 
                                                        fontSize: '0.78rem', 
                                                        padding: '3px 10px', 
                                                        borderRadius: '16px', 
                                                        display: 'inline-block', 
                                                        letterSpacing: '0.02em',
                                                        border: '1px solid #bbf7d0'
                                                    }}>
                                                        {grn.grn_number}
                                                    </span>
                                                </Td>
                                                <Td style={{ color: '#334155', fontSize: '0.82rem', whiteSpace: 'nowrap', padding: '12px 10px' }}>
                                                    {grn.date ? dayjs(grn.date).format('YYYY-MM-DD') : '-'}
                                                </Td>
                                                <Td style={{ color: '#1e293b', fontWeight: '600', fontSize: '0.82rem', padding: '12px 10px' }}>
                                                    {getVendorName(grn.vendor_id)}
                                                </Td>
                                                <Td style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', padding: '12px 10px' }}>
                                                    <div>{grn.purchase_category || '-'}</div>
                                                    {(grn.department_name || grn.department) && (
                                                        <span style={{ 
                                                            color: '#0d9488', 
                                                            background: '#f0fdfa', 
                                                            border: '1px solid #ccfbf1', 
                                                            fontSize: '0.7rem', 
                                                            fontWeight: '600', 
                                                            textTransform: 'none', 
                                                            padding: '1px 6px', 
                                                            borderRadius: '4px', 
                                                            display: 'inline-block', 
                                                            marginTop: '3px' 
                                                        }}
                                                        title={`Code: ${grn.department_code || grn.department || '-'}`}
                                                        >
                                                            {getDepartmentName(grn.department, grn)}
                                                        </span>
                                                    )}
                                                </Td>
                                                <Td style={{ color: '#334155', fontSize: '0.82rem', fontWeight: '500', padding: '12px 10px' }}>
                                                    {grn.invoice_no || grn.invoice_number || '-'}
                                                </Td>
                                                <Td style={{ color: '#334155', fontSize: '0.82rem', whiteSpace: 'nowrap', padding: '12px 10px' }}>
                                                    {grn.invoice_date ? dayjs(grn.invoice_date).format('YYYY-MM-DD') : (grn.date ? dayjs(grn.date).format('YYYY-MM-DD') : '-')}
                                                </Td>
                                                <Td style={{ color: '#334155', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', padding: '12px 10px' }}>
                                                    {grn.payment_mode || (latest && latest.payment_method) || 'CHEQUE'}
                                                </Td>
                                                <Td style={{ color: '#0f766e', fontWeight: '800', fontSize: '0.85rem', whiteSpace: 'nowrap', padding: '12px 10px' }}>
                                                    ₹{netAmt.toFixed(2)}
                                                </Td>
                                                <Td style={{ padding: '12px 10px' }}>
                                                    <span style={{ 
                                                        background: grn.is_approved ? '#ecfdf5' : '#fffbeb', 
                                                        color: grn.is_approved ? '#059669' : '#d97706', 
                                                        border: `1px solid ${grn.is_approved ? '#a7f3d0' : '#fde68a'}`, 
                                                        padding: '3px 9px', 
                                                        borderRadius: '6px', 
                                                        fontWeight: '700', 
                                                        fontSize: '0.74rem',
                                                        display: 'inline-block'
                                                    }}>
                                                        {grn.is_approved ? 'Verified' : 'Pending'}
                                                    </span>
                                                </Td>
                                                <Td style={{ color: '#1e293b', fontSize: '0.82rem', padding: '12px 10px', whiteSpace: 'nowrap' }}>
                                                    <span style={{ fontWeight: '600' }}>{grn.entered_by || grn.created_by_name || grn.created_by || '—'}</span>
                                                </Td>
                                                <Td style={{ textAlign: 'center', padding: '12px 10px' }}>
                                                    <div className="grn-action-popover-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                                                        <button
                                                            ref={(el) => { anchorRefs.current[grn.grn_number] = el; }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (openPopover === grn.grn_number) {
                                                                    setOpenPopover(null);
                                                                    setPopoverData(null);
                                                                } else {
                                                                    setOpenPopover(grn.grn_number);
                                                                    setPopoverData(grn);
                                                                }
                                                            }}
                                                            style={{
                                                                background: openPopover === grn.grn_number ? '#f0fdfa' : '#ffffff',
                                                                border: openPopover === grn.grn_number ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                                                                borderRadius: '8px',
                                                                padding: '5px 12px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                color: openPopover === grn.grn_number ? '#0d9488' : '#334155',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                        >
                                                            <span>Action</span>
                                                            <MoreVertical size={13} style={{ opacity: 0.7 }} />
                                                        </button>

                                                        {openPopover === grn.grn_number && popoverData && (
                                                            <GRNActionPopover
                                                                grn={popoverData}
                                                                anchorEl={anchorRefs.current[grn.grn_number]}
                                                                onClose={() => { setOpenPopover(null); setPopoverData(null); }}
                                                                onView={() => { setOpenPopover(null); setSelectedGrnForView(popoverData); setShowViewModal(true); }}
                                                                onApprove={() => { setOpenPopover(null); handleApprove(popoverData); }}
                                                                onPayment={() => { setOpenPopover(null); setSelectedGrn(popoverData); setShowPaymentModal(true); }}
                                                                onEdit={() => { setOpenPopover(null); navigate('/StoresGRNGeneration', { state: { editGrn: popoverData, fromAnalysis: true } }); }}
                                                                onPrint={() => { setOpenPopover(null); handlePrintRow(popoverData); }}
                                                                onDelete={() => { setOpenPopover(null); handleOpenCancelModal(popoverData); }}
                                                                onCancel={() => { setOpenPopover(null); handleOpenCancelModal(popoverData); }}
                                                            />
                                                        )}
                                                    </div>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
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
                                itemName="GRN"
                                themeColor={colors.primary}
                            />
                        </div>
                    </div>
                </div>
            </Container>

            {/* Payment Modal */}
            {showPaymentModal && selectedGrn && (() => {
                let paymentArray = selectedGrn.payment_status;
                if (typeof paymentArray === 'string') {
                    try { paymentArray = JSON.parse(paymentArray); } catch(e) { paymentArray = []; }
                }
                const lastStatus = paymentArray && paymentArray.length > 0
                    ? paymentArray[paymentArray.length - 1]
                    : { pending_amount: selectedGrn.net_invoice_amount };
                const pendingAmt = parseFloat(lastStatus.pending_amount) || 0;
                const totalPaid = parseFloat(selectedGrn.total_amount_paid?.$numberDecimal || selectedGrn.total_amount_paid || 0);
                const netAmt = parseFloat(selectedGrn.net_invoice_amount?.$numberDecimal || selectedGrn.net_invoice_amount || 0);

                return (
                    <ModalOverlay onClick={e => e.target === e.currentTarget && setShowPaymentModal(false)}>
                        <ModalContainer style={{ maxWidth: '500px' }}>
                            <ModalHeader>
                                <ModalTitle>💳 Make Payment</ModalTitle>
                                <CloseButton onClick={() => setShowPaymentModal(false)}>✕</CloseButton>
                            </ModalHeader>
                            <ModalBody>
                                {/* GRN Summary */}
                                <div style={{
                                    background: `linear-gradient(135deg, #f0fdfa, #e0f2fe)`,
                                    borderRadius: '8px', padding: '14px', marginBottom: '18px',
                                    border: `1px solid ${colors.border}`
                                }}>
                                    <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '10px', color: colors.primary }}>
                                        {selectedGrn.grn_number}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.72rem', color: colors.textMuted }}>Net Amount</div>
                                            <div style={{ fontWeight: '700', color: colors.textMain }}>₹{netAmt.toFixed(2)}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}` }}>
                                            <div style={{ fontSize: '0.72rem', color: colors.textMuted }}>Total Paid</div>
                                            <div style={{ fontWeight: '700', color: '#16a34a' }}>₹{totalPaid.toFixed(2)}</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.72rem', color: colors.textMuted }}>Pending</div>
                                            <div style={{ fontWeight: '700', color: '#dc2626' }}>₹{pendingAmt.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment History */}
                                {paymentArray && paymentArray.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' }}>
                                            Payment History ({paymentArray.filter(p => (parseFloat(p.amount_paid) || 0) > 0).length} entries)
                                        </div>
                                        <div style={{ maxHeight: '100px', overflowY: 'auto', border: `1px solid ${colors.border}`, borderRadius: '6px' }}>
                                            {paymentArray.filter(p => (parseFloat(p.amount_paid) || 0) > 0).map((p, i) => (
                                                <div key={i} style={{
                                                    display: 'flex', justifyContent: 'space-between',
                                                    padding: '5px 10px', fontSize: '0.78rem',
                                                    borderBottom: i < paymentArray.length - 1 ? `1px solid ${colors.border}` : 'none',
                                                    background: i % 2 === 0 ? '#f8fafc' : 'white'
                                                }}>
                                                    <span>{p.payment_date || 'N/A'}</span>
                                                    <span style={{ color: '#16a34a', fontWeight: '600' }}>+₹{p.amount_paid}</span>
                                                    <span style={{ color: '#dc2626' }}>Pending: ₹{p.pending_amount}</span>
                                                    <span style={{ color: colors.textMuted }}>{p.payment_method}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Form */}
                                <form onSubmit={handlePaymentSubmit}>
                                    <FormRow style={{ flexDirection: 'column', gap: '12px' }}>
                                        <InputWrapper>
                                            <Label required>Amount to Pay (Max: ₹{pendingAmt.toFixed(2)})</Label>
                                            <Input
                                                value={paymentData.amount_paid}
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val > pendingAmt) {
                                                        setPaymentData({ ...paymentData, amount_paid: pendingAmt.toString() });
                                                    } else {
                                                        setPaymentData({ ...paymentData, amount_paid: e.target.value });
                                                    }
                                                }}
                                                required
                                                placeholder={`Enter amount (max ₹${pendingAmt.toFixed(2)})`}
                                            />
                                        </InputWrapper>
                                        <InputWrapper>
                                            <Label required>Payment Method</Label>
                                            <select
                                                style={{
                                                    padding: '5px 10px', border: `1px solid ${colors.border}`,
                                                    borderRadius: '6px', fontSize: '0.82rem', outline: 'none'
                                                }}
                                                value={paymentData.payment_method}
                                                onChange={e => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Card">Card</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Cheque">Cheque</option>
                                                <option value="UPI">UPI</option>
                                            </select>
                                        </InputWrapper>
                                        <InputWrapper>
                                            <Label>Reference / Cheque No</Label>
                                            <Input
                                                value={paymentData.payment_details}
                                                onChange={e => setPaymentData({ ...paymentData, payment_details: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </InputWrapper>
                                    </FormRow>

                                    <ButtonContainer style={{ paddingTop: '14px', gap: '10px', justifyContent: 'flex-end' }}>
                                        <Button type="button" secondary onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                                        <Button type="submit" success disabled={submitting}>
                                            {submitting ? 'Processing...' : '✅ Submit Payment'}
                                        </Button>
                                    </ButtonContainer>
                                </form>
                            </ModalBody>
                        </ModalContainer>
                    </ModalOverlay>
                );
            })()}

            {/* Approval Modal */}
            {showApproveModal && selectedGrnForApproval && (
                <ModalOverlay onClick={e => e.target === e.currentTarget && setShowApproveModal(false)}>
                    <ModalContainer style={{ maxWidth: '1200px', width: '96%', maxHeight: '92vh', overflowY: 'auto' }}>
                        <ModalHeader style={{ background: '#0e7490', color: 'white', padding: '12px 18px' }}>
                            <ModalTitle style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📋 Verify & Approve GRN:</span>
                                <span style={{ fontWeight: 800 }}>{selectedGrnForApproval.grn_number}</span>
                            </ModalTitle>
                            <CloseButton style={{ color: 'white' }} onClick={() => setShowApproveModal(false)}>✕</CloseButton>
                        </ModalHeader>
                        <ModalBody style={{ padding: '16px' }}>
                            <StoresGRNDocument 
                                grn={selectedGrnForApproval}
                                vendorName={getVendorName(selectedGrnForApproval.vendor_id)}
                                items={selectedGrnForApproval.items}
                                getDepartmentName={getDepartmentName}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                                <Button secondary onClick={() => setShowApproveModal(false)} style={{ padding: '10px 25px' }}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={confirmFinalApproval} 
                                    disabled={submitting}
                                    style={{ background: '#16a34a', color: 'white', padding: '10px 35px', fontSize: '1rem', fontWeight: 'bold' }}
                                >
                                    {submitting ? 'Approving...' : '🚀 Confirm & Approve'}
                                </Button>
                            </div>
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}

            {/* View GRN Modal */}
            {/* View GRN Modal */}
            {showViewModal && selectedGrnForView && (
                <ModalOverlay onClick={e => e.target === e.currentTarget && setShowViewModal(false)}>
                    <ModalContainer style={{ maxWidth: '1200px', width: '96%', maxHeight: '92vh', overflowY: 'auto' }}>
                        <ModalHeader style={{ borderBottom: `1px solid ${colors.border}`, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <ModalTitle style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Eye size={20} color={colors.primary} />
                                    <span>GRN Analysis & Details:</span>
                                    <span style={{ color: colors.primary, fontWeight: '800' }}>{selectedGrnForView.grn_number}</span>
                                </ModalTitle>
                                <span style={{ 
                                    background: selectedGrnForView.is_approved ? '#ecfdf5' : '#fffbeb', 
                                    color: selectedGrnForView.is_approved ? '#059669' : '#d97706', 
                                    border: `1px solid ${selectedGrnForView.is_approved ? '#a7f3d0' : '#fde68a'}`, 
                                    padding: '3px 10px', 
                                    borderRadius: '6px', 
                                    fontWeight: '700', 
                                    fontSize: '0.75rem' 
                                }}>
                                    {selectedGrnForView.is_approved ? 'APPROVED' : 'PENDING APPROVAL'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <Button 
                                    disabled={selectedGrnForView.is_approved}
                                    onClick={() => {
                                        setShowViewModal(false);
                                        navigate('/StoresGRNGeneration', { state: { editGrn: selectedGrnForView, fromAnalysis: true } });
                                    }}
                                    style={{
                                        padding: '6px 14px',
                                        fontSize: '0.8rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: selectedGrnForView.is_approved ? '#f1f5f9' : '#0d9488',
                                        color: selectedGrnForView.is_approved ? '#94a3b8' : '#ffffff',
                                        cursor: selectedGrnForView.is_approved ? 'not-allowed' : 'pointer',
                                        fontWeight: '600'
                                    }}
                                    title={selectedGrnForView.is_approved ? 'Cannot edit approved GRN' : 'Edit GRN'}
                                >
                                    <Pencil size={14} />
                                    <span>Edit</span>
                                </Button>
                                <Button 
                                    disabled={selectedGrnForView.is_approved}
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleApprove(selectedGrnForView);
                                    }}
                                    style={{
                                        padding: '6px 14px',
                                        fontSize: '0.8rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: selectedGrnForView.is_approved ? '#ecfdf5' : '#ea580c',
                                        color: selectedGrnForView.is_approved ? '#059669' : '#ffffff',
                                        cursor: selectedGrnForView.is_approved ? 'not-allowed' : 'pointer',
                                        fontWeight: '600'
                                    }}
                                    title={selectedGrnForView.is_approved ? 'Already approved' : 'Confirm & Approve GRN'}
                                >
                                    <CheckCheck size={14} />
                                    <span>{selectedGrnForView.is_approved ? 'Verified' : 'Confirm'}</span>
                                </Button>
                                <Button 
                                    onClick={() => handlePrintRow(selectedGrnForView)}
                                    style={{
                                        padding: '6px 14px',
                                        fontSize: '0.8rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: '#7c3aed',
                                        color: '#ffffff',
                                        fontWeight: '600'
                                    }}
                                    title="Print GRN Voucher"
                                >
                                    <Printer size={14} />
                                    <span>Print</span>
                                </Button>
                                <Button 
                                    disabled={selectedGrnForView.is_approved}
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleOpenCancelModal(selectedGrnForView);
                                    }}
                                    style={{
                                        padding: '6px 14px',
                                        fontSize: '0.8rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: selectedGrnForView.is_approved ? '#f1f5f9' : '#ef4444',
                                        color: selectedGrnForView.is_approved ? '#94a3b8' : '#ffffff',
                                        cursor: selectedGrnForView.is_approved ? 'not-allowed' : 'pointer',
                                        fontWeight: '600'
                                    }}
                                    title={selectedGrnForView.is_approved ? 'Cannot cancel approved GRN' : 'Cancel GRN'}
                                >
                                    <Trash2 size={14} />
                                    <span>Cancel GRN</span>
                                </Button>
                                <CloseButton onClick={() => setShowViewModal(false)}>✕</CloseButton>
                            </div>
                        </ModalHeader>

                        <ModalBody style={{ padding: '16px' }}>
                            <StoresGRNDocument 
                                grn={selectedGrnForView}
                                vendorName={getVendorName(selectedGrnForView.vendor_id)}
                                items={selectedGrnForView.items}
                                getDepartmentName={getDepartmentName}
                            />
                            
                            {/* Modal Footer Actions */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                                <Button secondary onClick={() => setShowViewModal(false)} style={{ padding: '8px 22px' }}>
                                    Close
                                </Button>
                                <Button 
                                    disabled={selectedGrnForView.is_approved}
                                    onClick={() => {
                                        setShowViewModal(false);
                                        navigate('/StoresGRNGeneration', { state: { editGrn: selectedGrnForView, fromAnalysis: true } });
                                    }}
                                    style={{
                                        padding: '8px 22px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: selectedGrnForView.is_approved ? '#f1f5f9' : '#0d9488',
                                        color: selectedGrnForView.is_approved ? '#94a3b8' : '#ffffff',
                                        cursor: selectedGrnForView.is_approved ? 'not-allowed' : 'pointer',
                                        fontWeight: '600'
                                    }}
                                    title={selectedGrnForView.is_approved ? 'Cannot edit approved GRN' : 'Edit GRN'}
                                >
                                    <Pencil size={16} />
                                    <span>Edit</span>
                                </Button>
                                <Button 
                                    disabled={selectedGrnForView.is_approved}
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleApprove(selectedGrnForView);
                                    }}
                                    style={{
                                        padding: '8px 22px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: selectedGrnForView.is_approved ? '#ecfdf5' : '#ea580c',
                                        color: selectedGrnForView.is_approved ? '#059669' : '#ffffff',
                                        cursor: selectedGrnForView.is_approved ? 'not-allowed' : 'pointer',
                                        fontWeight: '600'
                                    }}
                                    title={selectedGrnForView.is_approved ? 'Already approved' : 'Confirm & Approve GRN'}
                                >
                                    <CheckCheck size={16} />
                                    <span>{selectedGrnForView.is_approved ? 'Verified' : 'Confirm'}</span>
                                </Button>
                                {!selectedGrnForView.is_approved && (
                                    <Button 
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleOpenCancelModal(selectedGrnForView);
                                        }}
                                        style={{
                                            padding: '8px 22px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: '#ef4444',
                                            color: '#ffffff',
                                            fontWeight: '600'
                                        }}
                                        title="Cancel GRN"
                                    >
                                        <Trash2 size={16} />
                                        <span>Cancel GRN</span>
                                    </Button>
                                )}
                                <Button 
                                    onClick={() => handlePrintRow(selectedGrnForView)}
                                    style={{
                                        padding: '8px 22px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#7c3aed',
                                        color: '#ffffff',
                                        fontWeight: '600'
                                    }}
                                    title="Print GRN Voucher"
                                >
                                    <Printer size={16} />
                                    <span>Print Voucher</span>
                                </Button>
                            </div>
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}

            {/* Cancel GRN Modal */}
            {showCancelModal && selectedGrnForCancel && (
                <ModalOverlay onClick={e => e.target === e.currentTarget && handleCloseCancelModal()}>
                    <ModalContainer style={{ maxWidth: '540px', width: '92%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <ModalHeader style={{ background: '#dc2626', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ModalTitle style={{ color: 'white', margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={20} color="#fef08a" />
                                <span>Cancel GRN:</span>
                                <span style={{ fontWeight: '800', letterSpacing: '0.5px' }}>{selectedGrnForCancel.grn_number}</span>
                            </ModalTitle>
                            <CloseButton style={{ color: 'white', opacity: 0.9 }} onClick={handleCloseCancelModal}>✕</CloseButton>
                        </ModalHeader>
                        <ModalBody style={{ padding: '24px' }}>
                            {/* Warning message banner */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                marginBottom: '18px'
                            }}>
                                <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ fontSize: '0.85rem', color: '#991b1b', lineHeight: '1.4' }}>
                                    <strong>Are you sure you want to cancel this GRN?</strong>
                                    <div style={{ marginTop: '2px', color: '#b91c1c' }}>
                                        Cancelling will deactivate this GRN record. You must provide a valid remark/reason below.
                                    </div>
                                </div>
                            </div>

                            {/* GRN Summary Info */}
                            <div style={{
                                background: '#f8fafc',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '10px',
                                padding: '14px 16px',
                                marginBottom: '20px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px 16px',
                                fontSize: '0.82rem'
                            }}>
                                <div>
                                    <span style={{ color: colors.textMuted, display: 'block', fontSize: '0.72rem' }}>Vendor:</span>
                                    <strong style={{ color: '#1e293b' }}>{getVendorName(selectedGrnForCancel.vendor_id)}</strong>
                                </div>
                                <div>
                                    <span style={{ color: colors.textMuted, display: 'block', fontSize: '0.72rem' }}>Invoice No:</span>
                                    <strong style={{ color: '#1e293b' }}>{selectedGrnForCancel.invoice_no || selectedGrnForCancel.invoice_number || '—'}</strong>
                                </div>
                                <div>
                                    <span style={{ color: colors.textMuted, display: 'block', fontSize: '0.72rem' }}>GRN Date:</span>
                                    <strong style={{ color: '#1e293b' }}>
                                        {selectedGrnForCancel.date ? dayjs(selectedGrnForCancel.date).format('DD/MM/YYYY') : '—'}
                                    </strong>
                                </div>
                                <div>
                                    <span style={{ color: colors.textMuted, display: 'block', fontSize: '0.72rem' }}>Net Amount:</span>
                                    <strong style={{ color: '#0f766e', fontSize: '0.9rem' }}>
                                        ₹{parseFloat(selectedGrnForCancel.net_invoice_amount?.$numberDecimal || selectedGrnForCancel.net_invoice_amount || 0).toFixed(2)}
                                    </strong>
                                </div>
                            </div>

                            {/* Required Cancellation Remark */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <Label style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e293b', margin: 0 }}>
                                        Cancellation Remark <span style={{ color: '#dc2626' }}>*</span>
                                    </Label>
                                    <span style={{ fontSize: '0.75rem', color: cancelRemark.trim() ? '#16a34a' : '#94a3b8' }}>
                                        {cancelRemark.trim() ? '✓ Remark provided' : 'Required'}
                                    </span>
                                </div>
                                <textarea
                                    rows={4}
                                    value={cancelRemark}
                                    onChange={(e) => {
                                        setCancelRemark(e.target.value);
                                        if (cancelError) setCancelError('');
                                    }}
                                    placeholder="Enter the mandatory reason for cancelling this GRN (e.g. incorrect invoice details, duplicate GRN created, supplier cancelled shipment, wrong pricing applied)..."
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: cancelError ? '1.5px solid #ef4444' : `1.5px solid ${colors.border}`,
                                        fontSize: '0.88rem',
                                        lineHeight: '1.4',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s',
                                        background: '#ffffff'
                                    }}
                                    onFocus={(e) => {
                                        if (!cancelError) e.target.style.borderColor = '#dc2626';
                                    }}
                                    onBlur={(e) => {
                                        if (!cancelError) e.target.style.borderColor = colors.border;
                                    }}
                                />
                                {cancelError && (
                                    <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                        <AlertCircle size={14} />
                                        <span>{cancelError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: `1px solid ${colors.border}`, paddingTop: '16px' }}>
                                <Button
                                    type="button"
                                    secondary
                                    onClick={handleCloseCancelModal}
                                    disabled={cancelling}
                                    style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: '600' }}
                                >
                                    Go Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleConfirmCancel}
                                    disabled={cancelling || !cancelRemark.trim()}
                                    style={{
                                        background: cancelling || !cancelRemark.trim() ? '#f87171' : '#dc2626',
                                        color: 'white',
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: cancelling || !cancelRemark.trim() ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                                    }}
                                >
                                    <Trash2 size={16} />
                                    {cancelling ? 'Cancelling GRN...' : 'Confirm Cancellation'}
                                </Button>
                            </div>
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}
        </PageWrapper>
    );
};

export default StoresGRNReport;
