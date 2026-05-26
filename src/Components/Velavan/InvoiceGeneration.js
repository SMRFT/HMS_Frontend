"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, History, ShoppingBag, FileText, Package } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import apiRequest from "../../Auth/apiRequest";
import styled from "styled-components";
import { AddItemMiniModal } from "./AddVelavanItems";
import { AddVendorMiniModal } from "./AddVelavanVendors";

// ─── Import from GlobalStyles ─────────────────────────────────────────────────
import {
  PageWrapper,
  Container,
  Input,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  Label,
  FormRow,
  TextArea,
  FormContent,
  ControlsContainer,
  SearchContainer,
  InputWrapper,
  ButtonContainer,
  TableWrapper,
  colors,
  SectionTitle,
} from "../GlobalStyles";

// ─── Page-specific Styled Components (using GlobalStyles colors) ──────────────

const PageHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${colors.primary} 0%,
    ${colors.primaryDark} 100%
  );
  color: white;
  padding: 14px 22px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const PageSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 0.75rem;
  opacity: 0.8;
`;
const TabRow = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 3px;
`;
const TabBtn = styled.button`
  background: ${(p) => (p.active ? "white" : "transparent")};
  color: ${(p) => (p.active ? colors.primary : "rgba(255,255,255,0.75)")};
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    color: white;
    background: ${(p) => (p.active ? "white" : "rgba(255,255,255,0.15)")};
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  margin-bottom: 14px;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;
const CardHeader = styled.div`
  background: ${colors.tabBg};
  padding: 9px 16px;
  border-bottom: 1px solid ${colors.border};
  font-weight: 600;
  font-size: 0.82rem;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 8px 8px 0 0;
`;
const CardBody = styled.div`
  padding: 14px 16px;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: ${(p) => p.cols || "repeat(4,1fr)"};
  gap: 10px;
  align-items: flex-end;
  margin-bottom: ${(p) => p.mb || "10px"};
  @media (max-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Lbl = styled(Label)`
  font-size: 0.72rem;
  margin-bottom: 3px;
  color: ${colors.textMuted};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const RequiredMark = styled.span`
  color: ${colors.danger};
  margin-left: 2px;
`;

const ReadOnlyInput = styled(Input)`
  background: #f1f5f9 !important;
  cursor: default;
  color: ${colors.textMuted};
  font-size: 0.82rem;
`;

// ─── Items Table ──────────────────────────────────────────────────────────────
const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  font-size: 0.75rem;
  thead tr {
    background: ${colors.primary};
  }
  th {
    background: ${colors.primary};
    color: white;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    font-size: 0.68rem;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  td {
    padding: 7px 10px;
    font-size: 0.75rem;
    border-bottom: 1px solid ${colors.border};
    text-align: left;
    white-space: nowrap;
  }
  tbody tr:nth-child(even) {
    background: #f8fafc;
  }
  tbody tr:hover {
    background: ${colors.tabBg};
  }
`;
const EmptyCell = styled.td`
  text-align: center;
  padding: 32px;
  color: ${colors.textMuted};
  font-size: 0.85rem;
`;
const ActionBtn = styled.button`
  background: none;
  border: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
  &.edit {
    color: #2563eb;
    &:hover {
      background: #eff6ff;
    }
  }
  &.del {
    color: ${colors.danger};
    &:hover {
      background: #fef2f2;
    }
  }
`;

// ─── Summary Section ──────────────────────────────────────────────────────────
const SumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 12px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
const SumField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;
const RupeeWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
const RupeeSymbol = styled.span`
  padding: 5px 8px;
  background: ${colors.tabBg};
  border: 1px solid ${colors.border};
  border-radius: 5px 0 0 5px;
  font-size: 0.82rem;
  color: ${colors.textMuted};
  white-space: nowrap;
`;
const RupeeInput = styled(Input)`
  border-radius: 0 5px 5px 0 !important;
  border-left: none !important;
  font-size: 0.82rem;
`;
const NetAmountBox = styled.div`
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const NetLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
`;
const NetValue = styled.span`
  font-size: 1.1rem;
  font-weight: 800;
`;
const RoundWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
const RoundSignSel = styled(Select)`
  width: 52px !important;
  padding: 5px 4px !important;
  font-size: 0.82rem;
  border-radius: 5px 0 0 5px !important;
`;
const RoundInput = styled(Input)`
  border-radius: 0 5px 5px 0 !important;
  border-left: none !important;
`;

// ─── Modal ────────────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1400; // ← was 1000, now above sidebar (1300)
`;
const ModalBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 92%;
  max-width: 920px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
`;
const ModalHead = styled.div`
  background: ${colors.tabBg};
  padding: 12px 18px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;
const ModalTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${colors.primary};
`;
const ModalScroll = styled.div`
  overflow-y: auto;
  padding: 16px;
  flex: 1;
`;
const ModalFoot = styled.div`
  padding: 10px 16px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: #f8fafc;
  flex-shrink: 0;
`;
const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px;
  &:hover {
    background: ${colors.border};
    color: ${colors.textMain};
  }
`;
const SectionDivider = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.primary};
  padding: 6px 0 4px;
  border-bottom: 1px solid ${colors.tabBg};
  margin-bottom: 8px;
  margin-top: 4px;
`;

// ─── Vendor Autocomplete ──────────────────────────────────────────────────────
const AutoWrap = styled.div`
  position: relative;
`;
const DropList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 999;
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 0 0 6px 6px;
  max-height: 160px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;
const DropItem = styled.li`
  padding: 7px 10px;
  font-size: 0.82rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  &:hover {
    background: ${colors.tabBg};
    color: ${colors.primary};
  }
  &:last-child {
    border-bottom: none;
  }
`;

// ─── History Modal ────────────────────────────────────────────────────────────
const HistOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500; // ← was 1100, now above ModalOverlay
`;

const HistBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 95%;
  max-width: 1100px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;
const HistHead = styled.div`
  background: ${colors.primary};
  color: white;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const HistTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
`;
const HistSubtitle = styled.div`
  font-size: 0.72rem;
  opacity: 0.8;
  margin-top: 2px;
`;
const HistScroll = styled.div`
  overflow: auto;
  flex: 1;
  padding: 12px;
`;

const HistTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  th {
    background: ${colors.tabBg};
    padding: 7px 10px;
    text-align: left;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: ${colors.textMain};
    white-space: nowrap;
  }
  td {
    padding: 7px 10px;
    border-bottom: 1px solid ${colors.border};
  }
  tbody tr:hover {
    background: #f8fafc;
  }
`;

// ─── Invoice Preview ──────────────────────────────────────────────────────────
const InvOverlay = styled(ModalOverlay)`
  z-index: 1450; // ← was 1050, now between Modal and History
`;
const InvBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 96%;
  max-width: 1000px;
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;
const InvBody = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 20px 24px;
`;
// ── Inline style helpers for preview table ──────────────────────────────────
const thStyle = (bg) => ({
  background: bg,
  color: "white",
  padding: "7px 8px",
  fontWeight: 700,
  fontSize: "0.65rem",
  textAlign: "center",
  whiteSpace: "nowrap",
  letterSpacing: 0.3,
  textTransform: "uppercase",
});
const tdBase = {
  padding: "6px 8px",
  fontSize: "0.72rem",
  borderBottom: "1px solid #e2e8f0",
};
const tdCenter = { ...tdBase, textAlign: "center" };
const tdRight = { ...tdBase, textAlign: "right" };
const StatusBadge = styled.span`
  background: ${(p) => (p.active ? "#dcfce7" : "#fef9c3")};
  color: ${(p) => (p.active ? "#166534" : "#854d0e")};
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
`;

// ─── Invoice Saved Dialog ─────────────────────────────────────────────────────
const InvSavedBox = styled.div`
  background: white;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;
const InvSavedHead = styled.div`
  background: ${colors.primary};
  color: white;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const InvSavedBody = styled.div`
  padding: 24px 20px;
  text-align: center;
`;
const InvSavedNumber = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${colors.primary};
  margin: 8px 0;
`;

const SellingAmountBox = styled.div`
  background: linear-gradient(135deg, #166534, #16a34a);
  color: white;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const EMPTY_MODAL = {
  name: "",
  hsn: "",
  batch_no: "",
  expiry: "",
  quantity: "",
  unitPrice: "",
  mrp: "",
  // Purchase Tax
  tax: "",
  cgstPercent: "",
  cgstAmt: "",
  sgstPercent: "",
  sgstAmt: "",
  // Selling Tax
  sellingTax: "",
  sellingCgstPercent: "",
  sellingCgstAmt: "",
  sellingsgstPercent: "",
  sellingSgstAmt: "",
  // Purchase Discount & Cost
  purchaseDiscountPercent: "",
  discountedAmt: "",
  purchaseCost: "",
  unitCostWithGst: "",
  // Selling Pricing
  sellingPricingMode: "markup",
  sellingMarkupPercent: "",
  sellingMarkdownPercent: "",
  sellingUnitCost: "",
  // Selling Discount & Cost
  sellingDiscountPercent: "",
  sellingDiscountedAmt: "",
  sellingCost: "",
  unitSellingCost: "",
  purchaseCostBeforeGst: "",
  sellingCostBeforeGst: "",
};

const EMPTY_FORM = {
  vendor: "",
  vendor_id: "",
  date: new Date().toISOString().split("T")[0],
  supplierAddress: "",
  contactPerson: "",
  phone: "",
  invoiceNo: "",
  invoiceDate: "",
  paymentMode: "CHEQUE",
  ipNumber: "",
  patientName: "",
  surgeonName: "",
  uhid: "",
  salutation: "",
  firstName: "",
  lastName: "",
  customerType: "", // ← new
  companyName: "", // ← new
};
const EMPTY_SUMMARY = {
  nonTaxableAmount: 0,
  taxableAmount: 0,
  taxPaidToSupplier: 0,
  localTax: 0,
  remarks: "",
  cgst: 0,
  sgst: 0,
  igst: 0,
  cess: 0,
  centralSalesTax: 0,
  roundAmount: 0,
  totalAmount: 0,
  taxOnFreeItems: 0,
  totalDiscount: 0,
  netInvoiceAmount: 0,
  quotationRate: 0,
  courierTransportCharge: 0,
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Invoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const record = location.state?.record || null;
  const invoice_number = record?.invoice_number || record?.grn_number || null;

  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [vendors, setVendors] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState(EMPTY_MODAL);
  const [editingItem, setEditingItem] = useState(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInvoiceSavedDialog, setShowInvoiceSavedDialog] = useState(false);
  const [invoiceSavedData, setInvoiceSavedData] = useState({
    invoice_number: "",
    invoice_no: "",
  });
  const [loading, setLoading] = useState(false);
  const [grnList, setGrnList] = useState([]);
  const [listSearch, setListSearch] = useState("");
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [roundSign, setRoundSign] = useState("+");
  const [doctors, setDoctors] = useState([]);
  const [roundAmtDisplay, setRoundAmtDisplay] = useState("");

  const userId = localStorage.getItem("employeeId");

  // ─── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchVendors();
    fetchItems();
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const result = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, "GET");
    if (result.success) setDoctors(result.data || []);
  };

  const fetchIpPatient = async () => {
    if (!formData.ipNumber) {
      toast.error("Please enter IP Number");
      return;
    }
    const result = await apiRequest(
      `${HMSURL}ip-patient/${encodeURIComponent(formData.ipNumber)}/`,
      "GET",
    );
    if (result.success) {
      const data = result.data;
      const fullName = [data.salutation, data.firstName, data.lastName]
        .filter(Boolean)
        .join(" ");
      setFormData((prev) => ({
        ...prev,
        uhid: data.uhid || "",
        salutation: data.salutation || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        patientName: fullName,
        customerType: data.customer_type || "",
        companyName: data.company_name || "",
      }));
    } else {
      toast.error(result.error || "Patient not found");
    }
  };

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const r = await apiRequest(`${HMSURL}velavan_vendors/list/`, "GET");
      if (r.success) setVendors(r.data || []);
      else {
        toast.error("Failed to load vendors");
        setVendors([]);
      }
    } catch {
      toast.error("Error loading vendors");
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const r = await apiRequest(`${HMSURL}velavan_items/list/`, "GET");
      if (r.success) setAvailableItems(r.data || []);
      else {
        toast.error("Failed to load items");
        setAvailableItems([]);
      }
    } catch {
      toast.error("Error loading items");
      setAvailableItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // ─── Load record for editing ───────────────────────────────────────────────
  useEffect(() => {
    if (record) {
      setFormData({
        vendor: record.vendor || "",
        vendor_id: record.vendor_id || "",
        date: record.date || new Date().toISOString().split("T")[0],
        supplierAddress: record.address || "",
        contactPerson: record.contact_person || "",
        phone: record.phone || "",
        invoiceNo: record.invoice_no || "",
        invoiceDate: record.invoice_date || "",
        paymentMode: record.payment_mode || "CHEQUE",
        ipNumber: record.ip_number || "",
        patientName: record.patient_name || "",
        surgeonName: record.surgeon_name || "",
        customerType: record.customer_type || "", // ← new
        companyName: record.company_name || "", // ← new
      });

      setItems(record.items || []);

      setSummary({
        nonTaxableAmount: parseFloat(record.non_taxable_amount || 0),
        taxableAmount: parseFloat(record.taxable_amount || 0),
        taxPaidToSupplier: parseFloat(record.tax_paid_to_supplier || 0),
        localTax: parseFloat(record.local_tax || 0),
        remarks: record.remarks || "",
        cgst: parseFloat(record.cgst || 0),
        sgst: parseFloat(record.sgst || 0),
        igst: parseFloat(record.igst || 0),
        cess: parseFloat(record.cess || 0),
        centralSalesTax: parseFloat(record.central_sales_tax || 0),
        roundAmount: parseFloat(record.round_amount || 0),
        totalAmount: parseFloat(record.total_amount || 0),
        taxOnFreeItems: parseFloat(record.tax_on_free_items || 0),
        totalDiscount: parseFloat(record.total_discount || 0),
        netInvoiceAmount: parseFloat(record.net_invoice_amount || 0),
        quotationRate: parseFloat(record.quotation_rate || 0),
        courierTransportCharge: parseFloat(
          record.courier_transport_charge || 0,
        ),
      });
      const abs = Math.abs(parseFloat(record.round_amount || 0));
      setRoundAmtDisplay(abs > 0 ? String(abs) : "");
      setRoundSign(parseFloat(record.round_amount || 0) < 0 ? "-" : "+");
    }
  }, [record]);

  // ─── Summary auto-calc ─────────────────────────────────────────────────────
  useEffect(() => {
    const round = (v) => Math.round((parseFloat(v) || 0) * 100) / 100;
    const taxableBase = round(
      items.reduce(
        (s, i) =>
          s + (parseFloat(i.unitPrice) || 0) * (parseFloat(i.quantity) || 0),
        0,
      ),
    );
    const totalPurchaseCost = round(
      items.reduce((s, i) => s + (parseFloat(i.purchaseCost) || 0), 0),
    );
    const totalCGST = round(
      items.reduce((s, i) => s + (parseFloat(i.cgstAmt) || 0), 0),
    );
    const totalSGST = round(
      items.reduce((s, i) => s + (parseFloat(i.sgstAmt) || 0), 0),
    );
    const totalDiscount = round(
      items.reduce((s, i) => s + (parseFloat(i.discountedAmt) || 0), 0),
    );
    const taxPaidToSupplier = round(totalCGST + totalSGST);
    const base = round(
      totalPurchaseCost +
        (summary.taxOnFreeItems || 0) +
        (summary.courierTransportCharge || 0) +
        (summary.localTax || 0),
      // discount is already baked into purchaseCost — do NOT subtract again
    );
    const netInvoiceAmount = round(base + (summary.roundAmount || 0));
    setSummary((prev) => ({
      ...prev,
      nonTaxableAmount: taxableBase,
      taxableAmount: totalPurchaseCost,
      cgst: totalCGST,
      sgst: totalSGST,
      totalAmount: totalPurchaseCost,
      totalDiscount,
      taxPaidToSupplier,
      netInvoiceAmount,
    }));
  }, [
    items,
    summary.taxOnFreeItems,
    summary.courierTransportCharge,
    summary.localTax,
    summary.roundAmount,
  ]); // eslint-disable-line

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // ─── Modal Item Logic ──────────────────────────────────────────────────────
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item.id);
      const merged = { ...EMPTY_MODAL, ...item };

      // Back-calculate markup/markdown % if sellingUnitCost is present but % is missing
      const sellingUnitCost = parseFloat(merged.sellingUnitCost) || 0;
      const unitCostWithGst = parseFloat(merged.unitCostWithGst) || 0;
      const mrp = parseFloat(merged.mrp) || 0;

      if (sellingUnitCost > 0) {
        if (!merged.sellingMarkupPercent && !merged.sellingMarkdownPercent) {
          // Try to detect mode and back-calc %
          if (mrp > 0 && sellingUnitCost <= mrp) {
            // Likely markdown from MRP
            merged.sellingPricingMode = "markdown";
            merged.sellingMarkdownPercent = (
              ((mrp - sellingUnitCost) / mrp) *
              100
            ).toFixed(2);
          } else if (unitCostWithGst > 0) {
            // Likely markup from unit cost
            merged.sellingPricingMode = "markup";
            merged.sellingMarkupPercent = (
              ((sellingUnitCost - unitCostWithGst) / unitCostWithGst) *
              100
            ).toFixed(2);
          }
        }
      }

      setModalForm(merged);
    } else {
      setEditingItem(null);
      setModalForm(EMPTY_MODAL);
    }
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // ─── Helper: recalc selling cost from selling unit cost ───────────────────
  // Takes a mutable copy `u` and mutates it in place, returns it
  const calcSellingFromUnitCost = (u) => {
    const qty = parseFloat(u.quantity) || 0;
    const sUnitCost = parseFloat(u.sellingUnitCost) || 0;
    const sellingTaxRate = parseFloat(u.sellingTax) || 0;
    const cgstP = sellingTaxRate / 2;
    const base = sUnitCost * qty;
    const cgstAmt = base > 0 ? ((base * cgstP) / 100).toFixed(2) : "0.00";

    u.sellingCgstPercent = String(cgstP);
    u.sellingsgstPercent = String(cgstP);
    u.sellingCgstAmt = cgstAmt;
    u.sellingSgstAmt = cgstAmt;

    // selling cost = base + taxes - discount
    // selling cost = base - discount + taxes  (discount on base BEFORE GST)
    const sellingBase = base; // sUnitCost × qty, no GST
    const sDiscP = parseFloat(u.sellingDiscountPercent) || 0;
    const sDiscA = parseFloat(u.sellingDiscountedAmt) || 0;
    let sellingDiscount = 0;
    if (sDiscP > 0) {
      sellingDiscount = (sellingBase * sDiscP) / 100;
      u.sellingDiscountedAmt = sellingDiscount.toFixed(2);
    } else if (sDiscA > 0) {
      sellingDiscount = sDiscA;
      u.sellingDiscountPercent =
        sellingBase > 0 ? ((sDiscA / sellingBase) * 100).toFixed(2) : "0.00";
    }
    let sCost = sellingBase - sellingDiscount + parseFloat(cgstAmt) * 2;
    u.sellingCostBeforeGst = (sellingBase - sellingDiscount).toFixed(2);
    u.sellingCost = sCost.toFixed(2);
    u.unitSellingCost = qty > 0 ? (sCost / qty).toFixed(2) : "0.00";
    return u;
  };

  // ─── Helper: recalc selling cost from selling tax + selling discount ───────
  const calcSellingCost = (u, qty) => {
    const sellingBase = (parseFloat(u.unitPrice) || 0) * qty;
    const sDiscP = parseFloat(u.sellingDiscountPercent) || 0;
    const sDiscA = parseFloat(u.sellingDiscountedAmt) || 0;
    let sellingDiscount = 0;
    if (sDiscP > 0) {
      sellingDiscount = (sellingBase * sDiscP) / 100;
      u.sellingDiscountedAmt = sellingDiscount.toFixed(2);
    } else if (sDiscA > 0) {
      sellingDiscount = sDiscA;
      u.sellingDiscountPercent =
        sellingBase > 0 ? ((sDiscA / sellingBase) * 100).toFixed(2) : "0.00";
    }
    let sCost =
      sellingBase -
      sellingDiscount +
      (parseFloat(u.sellingCgstAmt) || 0) +
      (parseFloat(u.sellingSgstAmt) || 0);
    u.sellingCostBeforeGst = (sellingBase - sellingDiscount).toFixed(2);
    u.sellingCost = sCost.toFixed(2);
    u.unitSellingCost = qty > 0 ? (sCost / qty).toFixed(2) : "0.00";
    return u;
  };

  // ─── Helper: derive sellingUnitCost from mode + percentages ───────────────
  const deriveSellingUnitCost = (u) => {
    const unitCostWithGst = parseFloat(u.unitCostWithGst) || 0;
    const mrp = parseFloat(u.mrp) || 0;
    if (u.sellingPricingMode === "markup") {
      const pct = parseFloat(u.sellingMarkupPercent) || 0;
      if (unitCostWithGst > 0 && pct > 0) {
        u.sellingUnitCost = (unitCostWithGst * (1 + pct / 100)).toFixed(2);
      }
    } else {
      // markdown
      const pct = parseFloat(u.sellingMarkdownPercent) || 0;
      const base = mrp > 0 ? mrp : unitCostWithGst;
      if (base > 0 && pct > 0) {
        u.sellingUnitCost = (base * (1 - pct / 100)).toFixed(2);
      }
    }
    return u;
  };

  const handleTaxChange = (taxValue, isSelling = false) => {
    const cgst = parseFloat(taxValue) / 2;
    setModalForm((prev) => {
      const u = { ...prev };
      const qty = parseFloat(u.quantity) || 0;
      const base = (parseFloat(u.unitPrice) || 0) * qty;
      const discountedAmt = parseFloat(u.discountedAmt) || 0;
      const taxableBase = base - discountedAmt;
      const cgstAmt =
        taxableBase > 0 ? ((taxableBase * cgst) / 100).toFixed(2) : "0.00";
      if (isSelling) {
        u.sellingTax = String(taxValue);
        u.sellingCgstPercent = String(cgst);
        u.sellingsgstPercent = String(cgst);
        // If we have a sellingUnitCost, recalc from that
        if (parseFloat(u.sellingUnitCost) > 0) {
          calcSellingFromUnitCost(u);
        } else {
          u.sellingCgstAmt = cgstAmt;
          u.sellingSgstAmt = cgstAmt;
          calcSellingCost(u, qty);
        }
      } else {
        u.tax = String(taxValue);
        u.cgstPercent = String(cgst);
        u.sgstPercent = String(cgst);
        u.cgstAmt = cgstAmt;
        u.sgstAmt = cgstAmt;
        // auto-mirror to selling tax
        u.sellingTax = String(taxValue);
        u.sellingCgstPercent = String(cgst);
        u.sellingsgstPercent = String(cgst);
        u.sellingCgstAmt = cgstAmt;
        u.sellingSgstAmt = cgstAmt;
        // recalc purchase cost
        let cost = base + parseFloat(cgstAmt) * 2;
        const disc = parseFloat(u.purchaseDiscountPercent) || 0;
        if (disc > 0) {
          const da =
            disc > 0 ? (base * disc) / 100 : parseFloat(u.discountedAmt) || 0;
          u.discountedAmt = da.toFixed(2);
          let cost = base - da + parseFloat(cgstAmt) * 2;
        }
        u.purchaseCost = cost.toFixed(2);
        u.unitCostWithGst = qty > 0 ? (cost / qty).toFixed(2) : "0.00";
        u.purchaseCostBeforeGst = (base - (parseFloat(u.discountedAmt) || 0)) // ← use `base` which is defined above in handleTaxChange
          .toFixed(2);
        // re-derive selling unit cost from updated unitCostWithGst
        deriveSellingUnitCost(u);
        // recalc selling cost
        if (parseFloat(u.sellingUnitCost) > 0) {
          calcSellingFromUnitCost(u);
        } else {
          calcSellingCost(u, qty);
        }
      }
      return u;
    });
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const sel = availableItems
        .filter((i) => i.hsn && String(i.hsn).trim())
        .find((i) => i.itemName === value);
      setModalForm((prev) => ({
        ...prev,
        name: value,
        hsn: sel ? sel.hsn : "",
      }));
      return;
    }
    if (name === "tax") {
      handleTaxChange(value, false);
      return;
    }
    if (name === "sellingTax") {
      handleTaxChange(value, true);
      return;
    }

    // ── Selling Pricing Mode ──
    if (name === "sellingPricingMode") {
      setModalForm((prev) => {
        const u = { ...prev, sellingPricingMode: value };
        // reset the other % when switching
        if (value === "markup") {
          u.sellingMarkdownPercent = "";
        } else {
          u.sellingMarkupPercent = "";
        }
        // re-derive selling unit cost with new mode
        deriveSellingUnitCost(u);
        if (parseFloat(u.sellingUnitCost) > 0) {
          calcSellingFromUnitCost(u);
        }
        return u;
      });
      return;
    }

    // ── Selling Markup % ──
    if (name === "sellingMarkupPercent") {
      setModalForm((prev) => {
        const u = { ...prev, sellingMarkupPercent: value };
        const unitCostWithGst = parseFloat(u.unitCostWithGst) || 0;
        const pct = parseFloat(value) || 0;
        if (unitCostWithGst > 0 && pct >= 0) {
          u.sellingUnitCost = (unitCostWithGst * (1 + pct / 100)).toFixed(2);
          calcSellingFromUnitCost(u);
        }
        return u;
      });
      return;
    }

    // ── Selling Markdown % ──
    if (name === "sellingMarkdownPercent") {
      setModalForm((prev) => {
        const u = { ...prev, sellingMarkdownPercent: value };
        const mrp = parseFloat(u.mrp) || 0;
        const unitCostWithGst = parseFloat(u.unitCostWithGst) || 0;
        const base = mrp > 0 ? mrp : unitCostWithGst;
        const pct = parseFloat(value) || 0;
        if (base > 0 && pct >= 0) {
          u.sellingUnitCost = (base * (1 - pct / 100)).toFixed(2);
          calcSellingFromUnitCost(u);
        }
        return u;
      });
      return;
    }

    // ── Manual Selling Unit Cost override ──
    if (name === "sellingUnitCost") {
      setModalForm((prev) => {
        const u = { ...prev, sellingUnitCost: value };
        calcSellingFromUnitCost(u);
        return u;
      });
      return;
    }

    setModalForm((prev) => {
      const u = { ...prev, [name]: value };
      const unitPrice = parseFloat(u.unitPrice) || 0;
      const qty = parseFloat(u.quantity) || 0;
      const base = unitPrice * qty;
      const cgstP = parseFloat(u.cgstPercent) || 0;
      const sgstP = parseFloat(u.sgstPercent) || 0;

      // Recalc tax amounts when unitPrice or quantity changes
      if (name === "unitPrice" || name === "quantity") {
        const existingDisc = parseFloat(u.discountedAmt) || 0;
        const taxableBase = base - existingDisc;
        u.cgstAmt = ((taxableBase * cgstP) / 100).toFixed(2);
        u.sgstAmt = ((taxableBase * sgstP) / 100).toFixed(2);
        u.sellingCgstAmt = u.cgstAmt;
        u.sellingSgstAmt = u.sgstAmt;
      }

      // ── Purchase cost ──
      // REPLACE WITH — discounts applied on base (before GST), then GST added:
      // ── Purchase cost — GST calculated on (base - discount) ──
      const baseCostBeforeGst = base; // unitPrice × qty, no GST

      let discountAmt = 0;
      if (name === "purchaseDiscountPercent") {
        const discP = parseFloat(value) || 0;
        discountAmt = discP > 0 ? (baseCostBeforeGst * discP) / 100 : 0;
        u.discountedAmt = discountAmt.toFixed(2);
      } else if (name === "discountedAmt") {
        discountAmt = parseFloat(value) || 0;
        if (discountAmt > 0 && baseCostBeforeGst > 0) {
          u.purchaseDiscountPercent = (
            (discountAmt / baseCostBeforeGst) *
            100
          ).toFixed(2);
        }
      } else {
        const ep = parseFloat(u.purchaseDiscountPercent) || 0;
        const ed = parseFloat(u.discountedAmt) || 0;
        if (ep > 0) {
          discountAmt = (baseCostBeforeGst * ep) / 100;
          u.discountedAmt = discountAmt.toFixed(2);
        } else if (ed > 0) {
          discountAmt = ed;
          u.purchaseDiscountPercent = ((ed / baseCostBeforeGst) * 100).toFixed(
            2,
          );
        }
      }

      // GST must be on discounted base, not full base
      const discountedBase = baseCostBeforeGst - discountAmt;
      u.cgstAmt = ((discountedBase * cgstP) / 100).toFixed(2);
      u.sgstAmt = ((discountedBase * sgstP) / 100).toFixed(2);
      u.sellingCgstAmt = u.cgstAmt;
      u.sellingSgstAmt = u.sgstAmt;

      const cost =
        discountedBase + parseFloat(u.cgstAmt) + parseFloat(u.sgstAmt);
      u.purchaseCost = cost.toFixed(2);
      u.unitCostWithGst = qty > 0 ? (cost / qty).toFixed(2) : "0.00";
      u.purchaseCostBeforeGst = discountedBase.toFixed(2);

      // ── When unitPrice / quantity / mrp changes, re-derive sellingUnitCost ──
      if (name === "unitPrice" || name === "quantity" || name === "mrp") {
        deriveSellingUnitCost(u);
      }

      // ── Selling cost ──
      // If sellingUnitCost is set (via pricing mode), use that path
      if (parseFloat(u.sellingUnitCost) > 0) {
        calcSellingFromUnitCost(u);
      } else {
        // fallback: compute from base + selling taxes
        let sCost =
          base +
          (parseFloat(u.sellingCgstAmt) || 0) +
          (parseFloat(u.sellingSgstAmt) || 0);
        // sellingBase here = base (unitPrice × qty), GST amounts already in u.sellingCgstAmt / sellingSgstAmt
        const sellingBaseAmt = base; // pre-GST selling base
        if (name === "sellingDiscountPercent") {
          const sDiscP = parseFloat(value) || 0;
          const da = sDiscP > 0 ? (sellingBaseAmt * sDiscP) / 100 : 0;
          u.sellingDiscountedAmt = da.toFixed(2);
          sCost =
            sellingBaseAmt -
            da +
            (parseFloat(u.sellingCgstAmt) || 0) +
            (parseFloat(u.sellingSgstAmt) || 0);
        } else if (name === "sellingDiscountedAmt") {
          const da = parseFloat(value) || 0;
          if (da > 0 && sellingBaseAmt > 0) {
            u.sellingDiscountPercent = ((da / sellingBaseAmt) * 100).toFixed(2);
            sCost =
              sellingBaseAmt -
              da +
              (parseFloat(u.sellingCgstAmt) || 0) +
              (parseFloat(u.sellingSgstAmt) || 0);
          }
        } else {
          const sed = parseFloat(u.sellingDiscountedAmt) || 0;
          const sep = parseFloat(u.sellingDiscountPercent) || 0;
          if (sep > 0) {
            const da = (sellingBaseAmt * sep) / 100;
            u.sellingDiscountedAmt = da.toFixed(2);
            sCost =
              sellingBaseAmt -
              da +
              (parseFloat(u.sellingCgstAmt) || 0) +
              (parseFloat(u.sellingSgstAmt) || 0);
          } else if (sed > 0) {
            u.sellingDiscountPercent = ((sed / sellingBaseAmt) * 100).toFixed(
              2,
            );
            sCost =
              sellingBaseAmt -
              sed +
              (parseFloat(u.sellingCgstAmt) || 0) +
              (parseFloat(u.sellingSgstAmt) || 0);
          }
        }
        u.sellingCostBeforeGst = (
          sellingBaseAmt - (parseFloat(u.sellingDiscountedAmt) || 0)
        ).toFixed(2);
        u.sellingCost = sCost.toFixed(2);
        u.unitSellingCost = qty > 0 ? (sCost / qty).toFixed(2) : "0.00";
      }

      return u;
    });
  };

  const handleAddItem = () => {
    // Mandatory field checks
    if (!modalForm.name) {
      toast.error("Item Name is required");
      return;
    }
    if (!modalForm.batch_no) {
      toast.error("Batch Number is required");
      return;
    }
    if (!modalForm.expiry) {
      toast.error("Expiry Date is required");
      return;
    }
    if (!modalForm.quantity) {
      toast.error("Quantity is required");
      return;
    }
    if (!modalForm.sellingPricingMode) {
      toast.error("Pricing Mode is required");
      return;
    }

    const pctField =
      modalForm.sellingPricingMode === "markup"
        ? modalForm.sellingMarkupPercent
        : modalForm.sellingMarkdownPercent;
    if (!pctField) {
      toast.error(
        modalForm.sellingPricingMode === "markup"
          ? "Markup % is required"
          : "Markdown % is required",
      );
      return;
    }
    if (!modalForm.sellingUnitCost) {
      toast.error("Selling Unit Cost is required");
      return;
    }

    // ── NEW: Warn if Selling Unit Cost exceeds MRP ──
    const sellingUnitCost = parseFloat(modalForm.sellingUnitCost) || 0;
    const mrp = parseFloat(modalForm.mrp) || 0;

    if (mrp > 0 && sellingUnitCost > mrp) {
      toast.error(
        `Selling Unit Cost ₹${sellingUnitCost.toFixed(2)} cannot exceed MRP ₹${mrp.toFixed(2)}`,
      );
      return; // hard stop — no override
    }
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem ? { ...modalForm, id: editingItem } : i,
        ),
      );
    } else {
      setItems((prev) => [...prev, { ...modalForm, id: Date.now() }]);
    }
    setModalForm(EMPTY_MODAL);
  };
  const handleDeleteItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  // ─── History ───────────────────────────────────────────────────────────────
  const handleShowHistory = async (item) => {
    const hsn = String(item?.hsn ?? "").trim();
    const itemName = String(item?.name ?? "").trim();
    if (!itemName) {
      toast.error("Please select an item first");
      return;
    }
    if (!hsn) {
      toast.error("HSN code is required");
      return;
    }
    setSelectedItemForHistory({ ...item, hsn, itemName });
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const url = `${HMSURL}velavan/previous-purchases/?hsn=${encodeURIComponent(hsn)}&item_name=${encodeURIComponent(itemName)}`;
      const r = await apiRequest(url, "GET");
      if (r.success && r.data?.status === "success")
        setHistoryData(r.data.data || []);
      else setHistoryData([]);
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!formData.invoiceNo?.trim()) {
      toast.error("Invoice Number is required");
      return;
    }
    if (!formData.invoiceDate?.trim()) {
      toast.error("Invoice Date is required");
      return;
    }
    if (!formData.vendor_id) {
      toast.error("Vendor is required");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    setShowInvoicePreview(true);
  };

  const handleConfirmSubmit = async () => {
    const fmt = (d) => {
      if (!d) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      try {
        const dt = new Date(d);
        return isNaN(dt) ? "" : dt.toISOString().split("T")[0];
      } catch {
        return "";
      }
    };
    const payload = {
      ...formData,
      customer_type: formData.customerType,
      company_name: formData.companyName,
      invoiceDate: fmt(formData.invoiceDate),
      date: fmt(formData.date || new Date().toISOString().split("T")[0]),
      vendor_id: formData.vendor_id?.trim() || null,
      items,
      summary,
      created_date: new Date().toISOString(),
      lastmodified_date: new Date().toISOString(),
    };
    setLoading(true);
    try {
      let result;
      if (invoice_number) {
        result = await apiRequest(
          `${HMSURL}velavan/invoices/update/${encodeURIComponent(invoice_number)}/`,
          "PATCH",
          payload,
        );
      } else {
        result = await apiRequest(
          `${HMSURL}velavan/invoices/`,
          "POST",
          payload,
        );
      }
      if (result.success) {
        setInvoiceSavedData({
          invoice_number:
            result.data?.invoice_number || result.data?.grn_number || "",
          invoice_no: payload.invoiceNo,
        });
        setShowInvoiceSavedDialog(true);
        setTimeout(() => setShowInvoicePreview(false), 400);
      } else {
        const errs = result.data?.errors;
        if (result.data?.status === "duplicate") {
          toast.error(
            `Duplicate Invoice: ${result.data?.message || "This invoice already exists."}`,
          );
        } else if (errs) {
          Object.entries(errs).forEach(([f, m]) =>
            toast.error(`${f}: ${Array.isArray(m) ? m.join(", ") : m}`),
          );
        } else {
          toast.error(result.error || "Submission failed");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setItems([]);
    setSummary(EMPTY_SUMMARY);
    setRoundSign("+");
    setRoundAmtDisplay(""); // ← add this
    navigate("/InvoiceGeneration", { replace: true, state: {} });
  };

  const handleInvoiceSavedDialogClose = () => {
    setShowInvoiceSavedDialog(false);
    resetForm();
  };

  const numberToWords = (amount) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const c = (n) => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + c(n % 100) : "")
        );
      if (n < 100000)
        return (
          c(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + c(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          c(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + c(n % 100000) : "")
        );
      return (
        c(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + c(n % 10000000) : "")
      );
    };
    const r = Math.floor(amount),
      p = Math.round((amount - r) * 100);
    return (
      "Rupee(s) " + c(r) + (p > 0 ? " and " + c(p) + " Paise" : "") + " Only /-"
    );
  };

  // ─── Vendor Dropdown Sub-component ────────────────────────────────────────
  const VendorDropdown = () => {
    const [search, setSearch] = useState(formData.vendor || "");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const filtered = vendors.filter((v) =>
      v.name.toLowerCase().includes(search.toLowerCase()),
    );
    useEffect(() => {
      const handler = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);
    const select = (v) => {
      setSearch(v.name);
      setOpen(false);
      const addr = [v.addressLine1, v.addressLine2, v.city, v.state, v.pincode]
        .filter(Boolean)
        .join(", ");
      setFormData((prev) => ({
        ...prev,
        vendor: v.name,
        vendor_id: v.vendor_id || "",
        supplierAddress: addr,
        contactPerson: v.contactPerson || "",
        phone: v.phone || "",
      }));
    };
    return (
      <InputWrapper style={{ margin: 0 }}>
        <Lbl style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Vendor <RequiredMark>*</RequiredMark>
          <button
            onClick={() => setShowAddVendorModal(true)}
            style={{
              background: "none",
              border: "1px solid #cbd5e1",
              borderRadius: 4,
              padding: "1px 6px",
              marginLeft: 6,
              cursor: "pointer",
              fontSize: "0.75rem",
              color: colors.primary,
            }}
          >
            +
          </button>
        </Lbl>
        <AutoWrap ref={ref}>
          <div style={{ position: "relative" }}>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={loadingVendors ? "Loading…" : "Select vendor"}
              style={{ paddingRight: 28, fontSize: "0.82rem" }}
            />
            <FaChevronDown
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: 11,
                pointerEvents: "none",
              }}
            />
          </div>
          {open && filtered.length > 0 && (
            <DropList>
              {filtered.map((v) => (
                <DropItem key={v.vendor_id} onMouseDown={() => select(v)}>
                  {v.name}
                </DropItem>
              ))}
            </DropList>
          )}
        </AutoWrap>
      </InputWrapper>
    );
  };

  const R = ({ label, value, readOnly, name, onChange }) => (
    <SumField>
      <Lbl>{label}</Lbl>
      <RupeeWrap>
        <RupeeSymbol>₹</RupeeSymbol>
        <RupeeInput
          type="number"
          step="0.01"
          name={name}
          value={typeof value === "number" ? value.toFixed(2) : value}
          readOnly={readOnly}
          onChange={onChange}
          style={
            readOnly ? { background: "#f1f5f9", color: colors.textMuted } : {}
          }
        />
      </RupeeWrap>
    </SumField>
  );

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        <ToastContainer position="top-right" autoClose={3000} />

        {/* ── Page Header ── */}
        <PageHeader>
          <div>
            <PageTitle>
              <ShoppingBag size={18} /> Invoice Entry
            </PageTitle>
            <PageSubtitle>Purchase Invoice Management</PageSubtitle>
          </div>
          <TabRow>
            <TabBtn
              active={activeTab === "create"}
              onClick={() => setActiveTab("create")}
            >
              <FileText size={13} />{" "}
              {invoice_number ? "Edit Invoice" : "New Invoice"}
            </TabBtn>
            <TabBtn onClick={() => navigate("/InvoiceReport")}>
              <Package size={13} /> Invoice List
            </TabBtn>
          </TabRow>
        </PageHeader>

        <FormContent>
          {activeTab === "create" && (
            <>
              {/* ── Card 1: Basic Information ── */}
              <Card>
                <CardHeader>
                  <span>📋 Basic Information</span>
                  {invoice_number && (
                    <StatusBadge active>Editing: {invoice_number}</StatusBadge>
                  )}
                </CardHeader>
                <CardBody>
                  {/* Row 1 */}
                  <GridRow cols="repeat(6,1fr)">
                    <VendorDropdown />
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Invoice Date (Entry)</Lbl>
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        disabled
                        style={{ fontSize: "0.82rem" }}
                      />
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Vendor ID</Lbl>
                      <ReadOnlyInput
                        value={formData.vendor_id}
                        readOnly
                        placeholder="Auto-filled"
                      />
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Supplier Address</Lbl>
                      <ReadOnlyInput
                        value={formData.supplierAddress}
                        readOnly
                        placeholder="Auto-filled"
                      />
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Contact Person</Lbl>
                      <ReadOnlyInput
                        value={formData.contactPerson}
                        readOnly
                        placeholder="Auto-filled"
                      />
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Phone</Lbl>
                      <ReadOnlyInput
                        value={formData.phone}
                        readOnly
                        placeholder="Auto-filled"
                      />
                    </InputWrapper>
                  </GridRow>

                  {/* Row 2 */}
                  <GridRow cols="repeat(6,1fr)" mb="0">
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>
                        Invoice No <RequiredMark>*</RequiredMark>
                      </Lbl>
                      <Input
                        name="invoiceNo"
                        value={formData.invoiceNo}
                        onChange={handleFormChange}
                        placeholder="INV-001"
                        style={{ fontSize: "0.82rem" }}
                      />
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>
                        Invoice Date <RequiredMark>*</RequiredMark>
                      </Lbl>
                      <Input
                        type="date"
                        name="invoiceDate"
                        value={formData.invoiceDate}
                        onChange={handleFormChange}
                        max={new Date().toISOString().split("T")[0]}
                        style={{ fontSize: "0.82rem" }}
                      />
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Payment Mode</Lbl>
                      <Select
                        name="paymentMode"
                        value={formData.paymentMode}
                        onChange={handleFormChange}
                        style={{ fontSize: "0.82rem" }}
                      >
                        <option>CHEQUE</option>
                        <option>CASH</option>
                        <option>NEFT</option>
                        <option>RTGS</option>
                        <option>UPI</option>
                      </Select>
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>IP Number</Lbl>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Input
                          name="ipNumber"
                          value={formData.ipNumber}
                          onChange={handleFormChange}
                          placeholder="XXXX/000001"
                          style={{ fontSize: "0.82rem", flex: 1 }}
                          onKeyDown={(e) =>
                            e.key === "Enter" && fetchIpPatient()
                          }
                        />
                        <button
                          onClick={fetchIpPatient}
                          style={{
                            padding: "0 8px",
                            background: colors.primary,
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          🔍
                        </button>
                      </div>
                    </InputWrapper>
                    {/* ← Patient Name now editable, auto-filled from IP search but also manually typeable */}
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Patient Name</Lbl>
                      <Input
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleFormChange}
                        placeholder="Auto-fill or type name"
                        style={{ fontSize: "0.82rem" }}
                      />
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Surgeon Name</Lbl>
                      <AutoWrap>
                        <Input
                          name="surgeonName"
                          value={formData.surgeonName}
                          onChange={(e) => {
                            handleFormChange(e);
                          }}
                          placeholder="Type or select surgeon"
                          style={{ fontSize: "0.82rem" }}
                        />
                        {formData.surgeonName && doctors.length > 0 && (
                          <DropList>
                            {doctors
                              .filter((d) =>
                                d.employeeName
                                  .toLowerCase()
                                  .includes(formData.surgeonName.toLowerCase()),
                              )
                              .map((d) => (
                                <DropItem
                                  key={d.employeeId}
                                  onMouseDown={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      surgeonName: d.employeeName,
                                    }))
                                  }
                                >
                                  {d.employeeName}
                                </DropItem>
                              ))}
                          </DropList>
                        )}
                      </AutoWrap>
                    </InputWrapper>
                  </GridRow>

                  {/* Row 3 — Customer Type + Company Name */}
                  <GridRow
                    cols="repeat(6,1fr)"
                    mb="0"
                    style={{ marginTop: 10 }}
                  >
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>Customer Type</Lbl>
                      <Input
                        name="customerType"
                        value={formData.customerType}
                        onChange={handleFormChange}
                        placeholder="Auto-fill or type"
                        style={{ fontSize: "0.82rem" }}
                      />
                    </InputWrapper>
                    <InputWrapper style={{ margin: 0, gridColumn: "span 2" }}>
                      <Lbl>Company Name</Lbl>
                      <Input
                        name="companyName"
                        value={formData.companyName || ""}
                        onChange={handleFormChange}
                        placeholder="Auto-fill or type"
                        style={{ fontSize: "0.82rem" }}
                      />
                    </InputWrapper>
                  </GridRow>
                </CardBody>
              </Card>

              {/* ── Card 2: Items ── */}
              <Card>
                <CardHeader>
                  <span>💊 Items</span>
                  <Button
                    onClick={() => openModal()}
                    style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                  >
                    <Plus size={13} /> Add Item
                  </Button>
                </CardHeader>
                <CardBody style={{ padding: "0" }}>
                  <TableWrapper
                    style={{ borderRadius: "0 0 8px 8px", border: "none" }}
                  >
                    <ItemsTable>
                      <thead>
                        <tr>
                          <th rowSpan="2">#</th>
                          <th rowSpan="2">Name</th>
                          <th rowSpan="2">HSN</th>
                          <th rowSpan="2">Batch No</th>
                          <th rowSpan="2">Expiry Date</th>
                          <th rowSpan="2">Qty</th>
                          <th rowSpan="2">Unit Price ₹</th>
                          <th
                            colSpan="4"
                            style={{
                              textAlign: "center",
                              background: "#1d4ed8",
                            }}
                          >
                            Purchase Tax
                          </th>
                          <th
                            colSpan="4"
                            style={{
                              textAlign: "center",
                              background: "#166534",
                            }}
                          >
                            Selling Tax
                          </th>
                          <th
                            colSpan="4"
                            style={{
                              textAlign: "center",
                              background: "#1e40af",
                            }}
                          >
                            Purchase Disc &amp; Cost
                          </th>
                          <th
                            colSpan="4"
                            style={{
                              textAlign: "center",
                              background: "#14532d",
                            }}
                          >
                            Selling Disc &amp; Cost
                          </th>
                          <th rowSpan="2">MRP ₹</th>
                          <th rowSpan="2">Actions</th>
                        </tr>
                        <tr>
                          <th style={{ background: "#2563eb" }}>CGST%</th>
                          <th style={{ background: "#2563eb" }}>CGST Amt</th>
                          <th style={{ background: "#2563eb" }}>SGST%</th>
                          <th style={{ background: "#2563eb" }}>SGST Amt</th>
                          <th style={{ background: "#16a34a" }}>CGST%</th>
                          <th style={{ background: "#16a34a" }}>CGST Amt</th>
                          <th style={{ background: "#16a34a" }}>SGST%</th>
                          <th style={{ background: "#16a34a" }}>SGST Amt</th>
                          <th style={{ background: "#3b82f6" }}>Disc%</th>
                          <th style={{ background: "#3b82f6" }}>Disc Amt</th>
                          <th style={{ background: "#3b82f6" }}>P.Cost</th>
                          <th style={{ background: "#3b82f6" }}>Unit Cost</th>
                          <th style={{ background: "#22c55e" }}>Disc%</th>
                          <th style={{ background: "#22c55e" }}>Disc Amt</th>
                          <th style={{ background: "#22c55e" }}>S.Cost</th>
                          <th style={{ background: "#22c55e" }}>Unit Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 ? (
                          <tr>
                            <EmptyCell colSpan="25">
                              No items added yet. Click "Add Item" to get
                              started.
                            </EmptyCell>
                          </tr>
                        ) : (
                          items.map((it, idx) => (
                            <tr key={it.id ?? idx}>
                              <td>{idx + 1}</td>
                              <td style={{ fontWeight: 600, minWidth: 120 }}>
                                {it.name}
                              </td>
                              <td>{it.hsn}</td>
                              <td>{it.batch_no || "—"}</td>
                              <td>{it.expiry}</td>
                              <td style={{ fontWeight: 600 }}>{it.quantity}</td>
                              <td>
                                ₹{parseFloat(it.unitPrice || 0).toFixed(2)}
                              </td>
                              {/* Purchase Tax */}
                              <td>{it.cgstPercent}%</td>
                              <td>₹{parseFloat(it.cgstAmt || 0).toFixed(2)}</td>
                              <td>{it.sgstPercent}%</td>
                              <td>₹{parseFloat(it.sgstAmt || 0).toFixed(2)}</td>
                              {/* Selling Tax */}
                              <td>
                                {it.sellingCgstPercent || it.cgstPercent}%
                              </td>
                              <td>
                                ₹
                                {parseFloat(
                                  it.sellingCgstAmt || it.cgstAmt || 0,
                                ).toFixed(2)}
                              </td>
                              <td>
                                {it.sellingsgstPercent || it.sgstPercent}%
                              </td>
                              <td>
                                ₹
                                {parseFloat(
                                  it.sellingSgstAmt || it.sgstAmt || 0,
                                ).toFixed(2)}
                              </td>
                              {/* Purchase Disc & Cost */}
                              <td>{it.purchaseDiscountPercent || 0}%</td>
                              <td>
                                ₹{parseFloat(it.discountedAmt || 0).toFixed(2)}
                              </td>
                              <td style={{ fontWeight: 700, color: "#1d4ed8" }}>
                                ₹{parseFloat(it.purchaseCost || 0).toFixed(2)}
                              </td>
                              <td style={{ color: "#1e40af" }}>
                                ₹
                                {parseFloat(it.unitCostWithGst || 0).toFixed(2)}
                              </td>
                              {/* Selling Disc & Cost */}
                              <td>{it.sellingDiscountPercent || 0}%</td>
                              <td>
                                ₹
                                {parseFloat(
                                  it.sellingDiscountedAmt || 0,
                                ).toFixed(2)}
                              </td>
                              <td style={{ fontWeight: 700, color: "#166534" }}>
                                ₹{parseFloat(it.sellingCost || 0).toFixed(2)}
                              </td>
                              <td style={{ color: "#14532d" }}>
                                ₹
                                {parseFloat(it.unitSellingCost || 0).toFixed(2)}
                              </td>
                              <td>₹{parseFloat(it.mrp || 0).toFixed(2)}</td>
                              <td>
                                <ActionBtn
                                  className="edit"
                                  onClick={() => openModal(it)}
                                >
                                  <FaEdit />
                                </ActionBtn>
                                <ActionBtn
                                  className="del"
                                  onClick={() => handleDeleteItem(it.id)}
                                >
                                  <FaTrash />
                                </ActionBtn>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </ItemsTable>
                  </TableWrapper>
                </CardBody>
              </Card>

              {/* ── Card 3: Summary ── */}
              <Card>
                <CardHeader>💰 Summary</CardHeader>
                <CardBody>
                  <SumGrid>
                    <R
                      label="Non Taxable Amount"
                      value={summary.nonTaxableAmount}
                      readOnly
                    />
                    <R label="CGST" value={summary.cgst} readOnly />
                    <R label="SGST" value={summary.sgst} readOnly />
                    <R
                      label="Total Amount"
                      value={summary.totalAmount}
                      readOnly
                    />
                    <R
                      label="Quotation Rate"
                      name="quotationRate"
                      value={summary.quotationRate}
                      onChange={handleSummaryChange}
                    />
                  </SumGrid>
                  <SumGrid>
                    <R
                      label="Taxable Amount"
                      value={summary.taxableAmount}
                      readOnly
                    />
                    <R
                      label="IGST"
                      name="igst"
                      value={summary.igst}
                      onChange={handleSummaryChange}
                    />
                    <R
                      label="Cess"
                      name="cess"
                      value={summary.cess}
                      onChange={handleSummaryChange}
                    />
                    <R
                      label="Tax On Free Items"
                      name="taxOnFreeItems"
                      value={summary.taxOnFreeItems}
                      onChange={handleSummaryChange}
                    />
                    <R
                      label="Courier / Transport"
                      name="courierTransportCharge"
                      value={summary.courierTransportCharge}
                      onChange={handleSummaryChange}
                    />
                  </SumGrid>
                  <SumGrid>
                    <R
                      label="Tax Paid To Supplier"
                      value={summary.taxPaidToSupplier}
                      readOnly
                    />
                    <R
                      label="Central Sales Tax"
                      name="centralSalesTax"
                      value={summary.centralSalesTax}
                      onChange={handleSummaryChange}
                    />
                    {/* Round Off with +/- */}
                    <SumField>
                      <Lbl>Round Amount</Lbl>
                      <RoundWrap>
                        <RoundSignSel
                          value={roundSign}
                          onChange={(e) => {
                            const sign = e.target.value;
                            setRoundSign(sign);
                            const abs = Math.abs(summary.roundAmount || 0);
                            if (abs > 0) {
                              setSummary((prev) => ({
                                ...prev,
                                roundAmount: sign === "+" ? abs : -abs,
                              }));
                            }
                          }}
                        >
                          <option value="+">+</option>
                          <option value="-">−</option>
                        </RoundSignSel>
                        <RoundInput
                          type="text"
                          value={roundAmtDisplay}
                          placeholder="0.00"
                          onChange={(e) => {
                            const raw = e.target.value;
                            // Allow only digits and a single decimal point
                            if (!/^(\d*\.?\d*)$/.test(raw)) return;
                            setRoundAmtDisplay(raw);
                            const v = parseFloat(raw) || 0;
                            setSummary((prev) => ({
                              ...prev,
                              roundAmount: roundSign === "+" ? v : -v,
                            }));
                          }}
                          onBlur={() => {
                            // Normalize display on blur (e.g. "0." → "0.00")
                            const v = parseFloat(roundAmtDisplay) || 0;
                            setRoundAmtDisplay(v === 0 ? "" : String(v));
                          }}
                          style={{ fontSize: "0.82rem" }}
                        />
                      </RoundWrap>
                    </SumField>
                    <R
                      label="Total Discount"
                      value={summary.totalDiscount}
                      readOnly
                    />
                    <R
                      label="Local Tax"
                      name="localTax"
                      value={summary.localTax}
                      onChange={handleSummaryChange}
                    />
                  </SumGrid>

                  {/* Net Invoice Amount Highlight */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: 14,
                    }}
                  >
                    <NetAmountBox>
                      <NetLabel>Net Invoice Amount</NetLabel>
                      <NetValue>
                        ₹ {summary.netInvoiceAmount.toFixed(2)}
                      </NetValue>
                    </NetAmountBox>
                    <SellingAmountBox>
                      <NetLabel>Total Selling Amount</NetLabel>
                      <NetValue>
                        ₹{" "}
                        {items
                          .reduce(
                            (s, i) => s + (parseFloat(i.sellingCost) || 0),
                            0,
                          )
                          .toFixed(2)}
                      </NetValue>
                    </SellingAmountBox>
                  </div>

                  <div>
                    <Lbl>Remarks</Lbl>
                    <TextArea
                      name="remarks"
                      value={summary.remarks}
                      onChange={(e) =>
                        setSummary((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                      placeholder="Any remarks…"
                      rows={3}
                      style={{
                        width: "100%",
                        marginTop: 3,
                        fontSize: "0.82rem",
                      }}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* ── Action Buttons ── */}
              <ButtonContainer>
                <Button secondary onClick={() => setShowConfirmDialog(true)}>
                  <X size={13} /> Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? "Saving…"
                    : invoice_number
                      ? "Update Invoice"
                      : "Submit Invoice"}
                </Button>
              </ButtonContainer>
            </>
          )}
        </FormContent>
      </Container>

      {/* ═══════════════ ADD / EDIT ITEM MODAL ═══════════════ */}
      {showModal && (
        <ModalOverlay>
          <ModalBox>
            <ModalHead>
              <ModalTitle>
                {editingItem ? "Edit Item" : "Add New Item"}
              </ModalTitle>
              <CloseBtn onClick={closeModal}>
                <X size={18} />
              </CloseBtn>
            </ModalHead>
            <ModalScroll>
              {/* ── Section 1: Item Details ── */}
              <SectionDivider>Item Details</SectionDivider>
              <GridRow cols="repeat(5,1fr)">
                <InputWrapper style={{ margin: 0, gridColumn: "span 2" }}>
                  <Lbl>
                    Item Name *
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      style={{
                        background: "none",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        padding: "1px 6px",
                        marginLeft: 6,
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        color: colors.primary,
                      }}
                    >
                      +
                    </button>
                  </Lbl>
                  <Select
                    name="name"
                    value={modalForm.name}
                    onChange={handleModalChange}
                    style={{ fontSize: "0.82rem" }}
                  >
                    <option value="">Select item</option>
                    {[...availableItems]
                      .filter((i) => String(i.hsn ?? "").trim())
                      .sort((a, b) => a.itemName.localeCompare(b.itemName))
                      .map((i) => (
                        <option key={i.itemName} value={i.itemName}>
                          {i.itemName}
                        </option>
                      ))}
                  </Select>
                </InputWrapper>
                <InputWrapper style={{ margin: 0 }}>
                  <Lbl
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    HSN Code
                    <History
                      size={15}
                      style={{
                        cursor: modalForm.name ? "pointer" : "not-allowed",
                        color: modalForm.name ? "#2563eb" : "#94a3b8",
                      }}
                      onClick={() =>
                        modalForm.name && handleShowHistory(modalForm)
                      }
                      title="View purchase history"
                    />
                  </Lbl>
                  <Input
                    name="hsn"
                    value={modalForm.hsn}
                    onChange={handleModalChange}
                    style={{ fontSize: "0.82rem" }}
                  />
                </InputWrapper>
                <InputWrapper style={{ margin: 0 }}>
                  <Lbl>Batch No</Lbl>
                  <Input
                    name="batch_no"
                    value={modalForm.batch_no}
                    onChange={handleModalChange}
                    placeholder="e.g. BT-2025-001"
                    style={{ fontSize: "0.82rem" }}
                  />
                </InputWrapper>
                <InputWrapper style={{ margin: 0 }}>
                  <Lbl>Expiry Date</Lbl>
                  <Input
                    type="text"
                    name="expiry"
                    value={modalForm.expiry || ""}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);
                      let formatted = "";
                      if (raw.length <= 2) {
                        formatted = raw;
                      } else {
                        formatted = raw.slice(0, 2) + "-" + raw.slice(2);
                      }
                      handleModalChange({
                        target: { name: "expiry", value: formatted },
                      });
                    }}
                    onBlur={(e) => {
                      const parts = e.target.value.split("-");
                      if (parts.length === 2 && parts[0].length === 2) {
                        let mm = parseInt(parts[0], 10);
                        if (mm < 1) mm = 1;
                        if (mm > 12) mm = 12;
                        const corrected =
                          String(mm).padStart(2, "0") + "-" + parts[1];
                        handleModalChange({
                          target: { name: "expiry", value: corrected },
                        });
                      }
                    }}
                    placeholder="MM-YYYY"
                    maxLength={7}
                    style={{ fontSize: "0.82rem", letterSpacing: "0.1em" }}
                  />
                </InputWrapper>
              </GridRow>

              {/* ── Section 2: Purchase Pricing Details ── */}
              <SectionDivider>Purchase Pricing Details</SectionDivider>
              <GridRow cols="repeat(3,1fr)">
                <InputWrapper style={{ margin: 0 }}>
                  <Lbl>Quantity *</Lbl>
                  <Input
                    type="number"
                    name="quantity"
                    value={modalForm.quantity}
                    onChange={handleModalChange}
                    placeholder="0"
                    style={{ fontSize: "0.82rem" }}
                  />
                </InputWrapper>
                <InputWrapper style={{ margin: 0 }}>
                  <Lbl>Unit Price ₹</Lbl>
                  <Input
                    type="number"
                    step="0.01"
                    name="unitPrice"
                    value={modalForm.unitPrice}
                    onChange={handleModalChange}
                    placeholder="0.00"
                    style={{ fontSize: "0.82rem" }}
                  />
                </InputWrapper>
                <InputWrapper style={{ margin: 0 }}>
                  <Lbl>MRP ₹</Lbl>
                  <Input
                    type="number"
                    step="0.01"
                    name="mrp"
                    value={modalForm.mrp}
                    onChange={handleModalChange}
                    placeholder="0.00"
                    style={{ fontSize: "0.82rem" }}
                  />
                </InputWrapper>
              </GridRow>

              {/* ── Section 3: Purchase Tax ── */}
              <SectionDivider>Purchase Tax</SectionDivider>
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <GridRow cols="repeat(5,1fr)" mb="0">
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Tax Rate</Lbl>
                    <Select
                      name="tax"
                      value={modalForm.tax}
                      onChange={handleModalChange}
                      style={{ fontSize: "0.82rem" }}
                    >
                      <option value="">Select %</option>
                      {[0, 5, 12, 18, 28].map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </Select>
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>CGST %</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="cgstPercent"
                      value={modalForm.cgstPercent}
                      readOnly
                      style={{ fontSize: "0.82rem", background: "#dbeafe" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>CGST Amt ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="cgstAmt"
                      value={modalForm.cgstAmt}
                      onChange={handleModalChange}
                      style={{ fontSize: "0.82rem" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>SGST %</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sgstPercent"
                      value={modalForm.sgstPercent}
                      readOnly
                      style={{ fontSize: "0.82rem", background: "#dbeafe" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>SGST Amt ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sgstAmt"
                      value={modalForm.sgstAmt}
                      onChange={handleModalChange}
                      style={{ fontSize: "0.82rem" }}
                    />
                  </InputWrapper>
                </GridRow>
              </div>

              {/* ── Section 4: Purchase Discount & Cost ── */}
              <SectionDivider>Purchase Discount &amp; Cost</SectionDivider>
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <GridRow cols="repeat(5,1fr)" mb="0">
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Dis. %</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="purchaseDiscountPercent"
                      value={modalForm.purchaseDiscountPercent}
                      onChange={handleModalChange}
                      placeholder="0.00"
                      style={{ fontSize: "0.82rem" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Dis. Amt ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="discountedAmt"
                      value={modalForm.discountedAmt}
                      onChange={handleModalChange}
                      placeholder="0.00"
                      style={{ fontSize: "0.82rem" }}
                    />
                  </InputWrapper>
                  {/* ADD this 5th field: */}
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Purchase Cost ₹</Lbl>
                    <Input
                      readOnly
                      value={modalForm.purchaseCostBeforeGst}
                      style={{
                        fontSize: "0.82rem",
                        background: "#f1f5f9",
                        color: "#64748b",
                      }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Pur. Cost (with GST) ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="purchaseCost"
                      value={modalForm.purchaseCost}
                      onChange={handleModalChange}
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "#1d4ed8",
                      }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Unit Cost (with GST) ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="unitCostWithGst"
                      value={modalForm.unitCostWithGst}
                      readOnly
                      style={{
                        fontSize: "0.82rem",
                        background: "#dbeafe",
                        color: "#1e40af",
                        fontWeight: 600,
                      }}
                    />
                  </InputWrapper>
                </GridRow>
              </div>

              {/* ── Section 5: Selling Pricing Details ── */}
              <SectionDivider>Selling Pricing Details</SectionDivider>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <GridRow
                  cols="repeat(3,1fr)"
                  mb={parseFloat(modalForm.mrp) > 0 ? "6px" : "0"}
                >
                  {/* Pricing Mode */}
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>
                      Pricing Mode <RequiredMark>*</RequiredMark>
                    </Lbl>
                    <Select
                      name="sellingPricingMode"
                      value={modalForm.sellingPricingMode}
                      onChange={handleModalChange}
                      style={{ fontSize: "0.82rem" }}
                    >
                      <option value="markup">Unit Cost + % (Markup)</option>
                      <option value="markdown">MRP − % (Markdown)</option>
                    </Select>
                  </InputWrapper>

                  {/* Conditional % input */}
                  {modalForm.sellingPricingMode === "markup" ? (
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>
                        Markup % &nbsp;<RequiredMark>*</RequiredMark>
                        <span
                          style={{
                            color: "#16a34a",
                            fontStyle: "italic",
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          (on Unit Cost ₹
                          {parseFloat(modalForm.unitCostWithGst || 0).toFixed(
                            2,
                          )}
                          )
                        </span>
                      </Lbl>
                      <Input
                        type="number"
                        step="0.01"
                        name="sellingMarkupPercent"
                        value={modalForm.sellingMarkupPercent}
                        onChange={handleModalChange}
                        placeholder="e.g. 20"
                        style={{ fontSize: "0.82rem" }}
                      />
                    </InputWrapper>
                  ) : (
                    <InputWrapper style={{ margin: 0 }}>
                      <Lbl>
                        Markdown % &nbsp;<RequiredMark>*</RequiredMark>
                        <span
                          style={{
                            color: "#16a34a",
                            fontStyle: "italic",
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          {parseFloat(modalForm.mrp) > 0
                            ? `(on MRP ₹${parseFloat(modalForm.mrp).toFixed(2)})`
                            : `(on Unit Cost ₹${parseFloat(modalForm.unitCostWithGst || 0).toFixed(2)})`}
                        </span>
                      </Lbl>
                      <Input
                        type="number"
                        step="0.01"
                        name="sellingMarkdownPercent"
                        value={modalForm.sellingMarkdownPercent}
                        onChange={handleModalChange}
                        placeholder="e.g. 10"
                        style={{ fontSize: "0.82rem" }}
                      />
                    </InputWrapper>
                  )}

                  {/* Selling Unit Cost — editable override */}
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>
                      Selling Unit Cost ₹ <RequiredMark>*</RequiredMark>
                    </Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sellingUnitCost"
                      value={modalForm.sellingUnitCost}
                      onChange={handleModalChange}
                      placeholder="Auto-calculated"
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "#166534",
                        background: "#dcfce7",
                      }}
                    />
                  </InputWrapper>

                  {/* Reference: Purchase Unit Cost
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Ref: Purchase Unit Cost ₹</Lbl>
                    <Input
                      value={parseFloat(modalForm.unitCostWithGst || 0).toFixed(
                        2,
                      )}
                      readOnly
                      style={{
                        fontSize: "0.82rem",
                        background: "#f1f5f9",
                        color: "#64748b",
                      }}
                    />
                  </InputWrapper> */}
                </GridRow>

                {/* Info strip when MRP is available */}
                {parseFloat(modalForm.mrp) > 0 && (
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "#15803d",
                      background: "#dcfce7",
                      border: "1px solid #bbf7d0",
                      borderRadius: 5,
                      padding: "5px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>ℹ️</span>
                    MRP ₹{parseFloat(modalForm.mrp).toFixed(2)} is available.
                    Switch to <strong>MRP − %</strong> mode to calculate selling
                    price as a markdown from MRP.
                    <strong>Unit Cost + %</strong> mode, selling price is
                    calculated as a markup on the purchase unit cost.
                  </div>
                )}
              </div>

              {/* ── Section 6: Selling Tax ── */}
              <SectionDivider>Selling Tax</SectionDivider>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <GridRow cols="repeat(5,1fr)" mb="0">
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Tax Rate</Lbl>
                    <Select
                      name="sellingTax"
                      value={modalForm.sellingTax}
                      onChange={handleModalChange}
                      style={{ fontSize: "0.82rem" }}
                    >
                      <option value="">Select %</option>
                      {[0, 5, 12, 18, 28].map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </Select>
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>CGST %</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sellingCgstPercent"
                      value={modalForm.sellingCgstPercent}
                      readOnly
                      style={{ fontSize: "0.82rem", background: "#dcfce7" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>CGST Amt ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sellingCgstAmt"
                      value={modalForm.sellingCgstAmt}
                      onChange={handleModalChange}
                      style={{ fontSize: "0.82rem" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>SGST %</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sellingsgstPercent"
                      value={modalForm.sellingsgstPercent}
                      readOnly
                      style={{ fontSize: "0.82rem", background: "#dcfce7" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>SGST Amt ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sellingSgstAmt"
                      value={modalForm.sellingSgstAmt}
                      onChange={handleModalChange}
                      style={{ fontSize: "0.82rem" }}
                    />
                  </InputWrapper>
                </GridRow>
              </div>

              {/* ── Section 7: Selling Discount & Cost ── */}
              <SectionDivider>Selling Discount &amp; Cost</SectionDivider>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <GridRow cols="repeat(5,1fr)" mb="0">
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Discount %</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sellingDiscountPercent"
                      value={modalForm.sellingDiscountPercent}
                      onChange={handleModalChange}
                      placeholder="0.00"
                      style={{ fontSize: "0.82rem" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Discounted Amt ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sellingDiscountedAmt"
                      value={modalForm.sellingDiscountedAmt}
                      onChange={handleModalChange}
                      placeholder="0.00"
                      style={{ fontSize: "0.82rem" }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Selling Cost ₹</Lbl>
                    <Input
                      readOnly
                      value={modalForm.sellingCostBeforeGst}
                      style={{
                        fontSize: "0.82rem",
                        background: "#f1f5f9",
                        color: "#64748b",
                      }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Selling Cost (with GST) ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="sellingCost"
                      value={modalForm.sellingCost}
                      onChange={handleModalChange}
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "#166534",
                      }}
                    />
                  </InputWrapper>
                  <InputWrapper style={{ margin: 0 }}>
                    <Lbl>Unit Selling Cost ₹</Lbl>
                    <Input
                      type="number"
                      step="0.01"
                      name="unitSellingCost"
                      value={modalForm.unitSellingCost}
                      readOnly
                      style={{
                        fontSize: "0.82rem",
                        background: "#dcfce7",
                        color: "#14532d",
                        fontWeight: 600,
                      }}
                    />
                  </InputWrapper>
                </GridRow>
              </div>
            </ModalScroll>
            <ModalFoot>
              <Button
                secondary
                onClick={closeModal}
                style={{ fontSize: "0.82rem" }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem} style={{ fontSize: "0.82rem" }}>
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </ModalFoot>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* ═══════════════ HISTORY MODAL ═══════════════ */}
      {showHistoryModal && selectedItemForHistory && (
        <HistOverlay
          onClick={() => {
            setShowHistoryModal(false);
            setHistoryData([]);
          }}
        >
          <HistBox onClick={(e) => e.stopPropagation()}>
            <HistHead>
              <div>
                <HistTitle>
                  Purchase History —{" "}
                  {selectedItemForHistory.itemName ||
                    selectedItemForHistory.name}
                </HistTitle>
                <HistSubtitle>
                  HSN: {selectedItemForHistory.hsn}
                  {historyData.length > 0 &&
                    (() => {
                      const prices = historyData.map((h) =>
                        parseFloat(
                          (h.matched_item || selectedItemForHistory)
                            .unitPrice || 0,
                        ),
                      );
                      const mn = Math.min(...prices);
                      const mx = Math.max(...prices);
                      const avg =
                        prices.reduce((a, b) => a + b, 0) / prices.length;
                      return (
                        <span style={{ marginLeft: 12, opacity: 0.9 }}>
                          &nbsp;|&nbsp; Range: ₹{mn.toFixed(2)} – ₹
                          {mx.toFixed(2)}
                          &nbsp;|&nbsp; Avg: ₹{avg.toFixed(2)}
                          &nbsp;|&nbsp; {prices.length} record
                          {prices.length !== 1 ? "s" : ""}
                        </span>
                      );
                    })()}
                </HistSubtitle>
              </div>
              <CloseBtn
                onClick={() => setShowHistoryModal(false)}
                style={{ color: "white" }}
              >
                <X size={18} />
              </CloseBtn>
            </HistHead>
            <HistScroll>
              {historyLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: colors.textMuted,
                  }}
                >
                  Loading history…
                </div>
              ) : historyData.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: colors.textMuted,
                  }}
                >
                  No previous purchase history found.
                </div>
              ) : (
                <HistTable>
                  <thead>
                    <tr>
                      {[
                        "Invoice No",
                        "Invoice Date",
                        "Vendor",
                        "HSN",
                        "Item",
                        "Unit Price",
                        "Purchase Cost",
                        "Qty",
                        "MRP",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // ── Resolve matched items first, then compute price stats ──
                      const resolved = historyData.map((h) => {
                        let it = selectedItemForHistory;
                        try {
                          const its = JSON.parse(h.items);
                          const m = its.find(
                            (x) => x.hsn === selectedItemForHistory.hsn,
                          );
                          if (m) it = m;
                        } catch {}
                        if (h.matched_item) it = h.matched_item;
                        return { h, it };
                      });

                      const prices = resolved.map(({ it }) =>
                        parseFloat(it.unitPrice || 0),
                      );
                      const maxPrice = Math.max(...prices);
                      const minPrice = Math.min(...prices);
                      const hasRange = maxPrice > minPrice;

                      return resolved.map(({ h, it }, i) => {
                        const unitPrice = parseFloat(it.unitPrice || 0);
                        const isHigh = hasRange && unitPrice === maxPrice;
                        const isLow = hasRange && unitPrice === minPrice;

                        return (
                          <tr
                            key={i}
                            style={{
                              background: isHigh
                                ? "#fff1f2"
                                : isLow
                                  ? "#f0fdf4"
                                  : "transparent",
                            }}
                          >
                            <td>{h.invoice_no}</td>
                            <td>
                              {new Date(h.invoice_date).toLocaleDateString(
                                "en-IN",
                              )}
                            </td>
                            <td>{h.vendor_name}</td>
                            <td>{it.hsn || "—"}</td>
                            <td style={{ fontWeight: 600 }}>
                              {it.name || it.item_name || "—"}
                            </td>
                            <td
                              style={{
                                fontWeight: 700,
                                color: isHigh
                                  ? "#dc2626"
                                  : isLow
                                    ? "#16a34a"
                                    : colors.primary,
                              }}
                            >
                              ₹{unitPrice.toFixed(2)}
                            </td>
                            <td>
                              ₹{parseFloat(it.purchaseCost || 0).toFixed(2)}
                            </td>
                            <td>{it.quantity}</td>
                            <td>₹{parseFloat(it.mrp || 0).toFixed(2)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </HistTable>
              )}
            </HistScroll>
          </HistBox>
        </HistOverlay>
      )}

      {/* ═══════════════ INVOICE PREVIEW ═══════════════ */}
      {showInvoicePreview && (
        <InvOverlay>
          <InvBox style={{ maxWidth: 1100 }}>
            {/* ── Modal Header ── */}
            <ModalHead
              style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
                borderBottom: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={18} color="white" />
                </div>
                <div>
                  <ModalTitle style={{ color: "white", fontSize: "1rem" }}>
                    Invoice Preview
                  </ModalTitle>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 1,
                    }}
                  >
                    Review before confirming submission
                  </div>
                </div>
              </div>
              <CloseBtn
                onClick={() => setShowInvoicePreview(false)}
                style={{ color: "white" }}
              >
                <X size={18} />
              </CloseBtn>
            </ModalHead>

            <InvBody style={{ background: "#f0f4f8", padding: "20px 24px" }}>
              {/* ── Hospital Header Card ── */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
                  borderRadius: 10,
                  padding: "18px 24px",
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 15px rgba(30,58,95,0.3)",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "white",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      letterSpacing: 0.5,
                    }}
                  >
                    SHANMUGA HOSPITAL LIMITED
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.72rem",
                      marginTop: 3,
                    }}
                  >
                    51/24, Saradha College Road, Salem - 636007
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.72rem",
                    }}
                  >
                    Ph: 04272706666 &nbsp;|&nbsp; info@smrft.org
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: 20,
                      padding: "4px 14px",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    GOODS RECEIPT NOTE
                  </div>
                  {invoice_number && (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.72rem",
                      }}
                    >
                      GRN:{" "}
                      <strong style={{ color: "white" }}>
                        {invoice_number}
                      </strong>
                    </div>
                  )}
                  <div
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.72rem",
                    }}
                  >
                    Date:{" "}
                    <strong style={{ color: "white" }}>{formData.date}</strong>
                  </div>
                </div>
              </div>

              {/* ── 3-column Info Cards ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {/* Invoice Details */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 8,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      background: "#1e3a5f",
                      color: "white",
                      padding: "7px 12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FileText size={11} /> Invoice Details
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    {[
                      ["Invoice No", formData.invoiceNo],
                      ["Invoice Date", formData.invoiceDate],
                      ["Purchase Date", formData.date],
                      ["Payment Mode", formData.paymentMode],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.75rem",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>{label}</span>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          {val || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supplier Details */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 8,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      background: "#1e3a5f",
                      color: "white",
                      padding: "7px 12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <ShoppingBag size={11} /> Supplier Details
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    {[
                      ["Supplier", formData.vendor],
                      ["Address", formData.supplierAddress],
                      ["Phone", formData.phone],
                      ["Vendor ID", formData.vendor_id],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.75rem",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{ color: "#64748b", whiteSpace: "nowrap" }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#1e293b",
                            textAlign: "right",
                            wordBreak: "break-word",
                          }}
                        >
                          {val || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient Details */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 8,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      background: "#1e3a5f",
                      color: "white",
                      padding: "7px 12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Package size={11} /> Patient Details
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    {[
                      ["IP Number", formData.ipNumber],
                      ["Patient Name", formData.patientName],
                      [
                        "Customer Type",
                        formData.customerType && formData.companyName
                          ? `${formData.customerType} - ${formData.companyName}`
                          : formData.customerType ||
                            formData.companyName ||
                            "—",
                      ],
                      ["Surgeon", formData.surgeonName],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.75rem",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>{label}</span>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          {val || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Items Table ── */}
              <div
                style={{
                  background: "white",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: "#1e3a5f",
                    color: "white",
                    padding: "8px 14px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Package size={12} /> Items — {items.length} line
                    {items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.72rem",
                      minWidth: 900,
                    }}
                  >
                    <thead>
                      <tr>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          #
                        </th>
                        <th
                          rowSpan="2"
                          style={{
                            ...thStyle("#1e3a5f"),
                            textAlign: "left",
                            minWidth: 130,
                          }}
                        >
                          Product
                        </th>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          HSN
                        </th>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          Batch No
                        </th>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          Expiry
                        </th>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          Qty
                        </th>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          Unit Price
                        </th>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          MRP
                        </th>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          Discount
                        </th>
                        <th rowSpan="2" style={thStyle("#1e3a5f")}>
                          Non-Taxable Amt
                        </th>
                        <th colSpan="2" style={thStyle("#1d4ed8")}>
                          CGST
                        </th>
                        <th colSpan="2" style={thStyle("#166534")}>
                          SGST
                        </th>
                        <th colSpan="2" style={thStyle("#4c1d95")}>
                          IGST
                        </th>
                        <th rowSpan="2" style={thStyle("#1d4ed8")}>
                          P.Cost
                        </th>
                        <th rowSpan="2" style={thStyle("#166534")}>
                          S.Cost
                        </th>
                      </tr>
                      <tr>
                        <th style={thStyle("#2563eb")}>Rate</th>
                        <th style={thStyle("#2563eb")}>Amt</th>
                        <th style={thStyle("#16a34a")}>Rate</th>
                        <th style={thStyle("#16a34a")}>Amt</th>
                        <th style={thStyle("#7c3aed")}>Rate</th>
                        <th style={thStyle("#7c3aed")}>Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, i) => {
                        const unitPrice = parseFloat(it.unitPrice || 0);
                        const qty = parseFloat(it.quantity || 0);
                        const NonTaxableAmt = (unitPrice * qty).toFixed(2);
                        const isEven = i % 2 === 0;
                        return (
                          <tr
                            key={it.id || i}
                            style={{ background: isEven ? "#f8fafc" : "white" }}
                          >
                            <td style={tdCenter}>{i + 1}</td>
                            <td
                              style={{
                                ...tdBase,
                                fontWeight: 600,
                                color: "#1e293b",
                              }}
                            >
                              {it.name}
                            </td>
                            <td style={tdCenter}>{it.hsn}</td>
                            <td style={tdCenter}>{it.batch_no || "—"}</td>
                            <td style={tdCenter}>{it.expiry || "—"}</td>
                            <td style={{ ...tdCenter, fontWeight: 700 }}>
                              {it.quantity}
                            </td>
                            <td style={tdRight}>{unitPrice.toFixed(2)}</td>
                            <td style={tdRight}>
                              {parseFloat(it.mrp || 0).toFixed(2)}
                            </td>
                            <td style={{ ...tdRight, color: "#dc2626" }}>
                              {parseFloat(it.discountedAmt || 0).toFixed(2)}
                            </td>
                            <td style={tdRight}>{NonTaxableAmt}</td>
                            <td style={tdCenter}>{it.cgstPercent || 0}%</td>
                            <td style={tdRight}>
                              {parseFloat(it.cgstAmt || 0).toFixed(4)}
                            </td>
                            <td style={tdCenter}>{it.sgstPercent || 0}%</td>
                            <td style={tdRight}>
                              {parseFloat(it.sgstAmt || 0).toFixed(4)}
                            </td>
                            <td style={tdCenter}>—</td>
                            <td style={tdRight}>0.00</td>
                            <td
                              style={{
                                ...tdRight,
                                fontWeight: 700,
                                color: "#1d4ed8",
                              }}
                            >
                              {parseFloat(it.purchaseCost || 0).toFixed(2)}
                            </td>
                            <td
                              style={{
                                ...tdRight,
                                fontWeight: 700,
                                color: "#166534",
                              }}
                            >
                              {parseFloat(it.sellingCost || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Totals row */}
                      <tr style={{ background: "#1e3a5f" }}>
                        <td
                          colSpan="9"
                          style={{
                            padding: "8px 10px",
                            fontWeight: 800,
                            color: "white",
                            fontSize: "0.72rem",
                            textAlign: "center",
                            letterSpacing: 0.5,
                          }}
                        >
                          TOTALS
                        </td>
                        <td
                          style={{
                            ...tdRight,
                            background: "#1e3a5f",
                            color: "white",
                            fontWeight: 700,
                          }}
                        >
                          {items
                            .reduce(
                              (s, i) =>
                                s +
                                parseFloat(i.unitPrice || 0) *
                                  parseFloat(i.quantity || 0),
                              0,
                            )
                            .toFixed(2)}
                        </td>
                        <td style={{ background: "#1e3a5f" }} />
                        <td
                          style={{
                            ...tdRight,
                            background: "#1e3a5f",
                            color: "#93c5fd",
                            fontWeight: 700,
                          }}
                        >
                          {summary.cgst.toFixed(2)}
                        </td>
                        <td style={{ background: "#1e3a5f" }} />
                        <td
                          style={{
                            ...tdRight,
                            background: "#1e3a5f",
                            color: "#86efac",
                            fontWeight: 700,
                          }}
                        >
                          {summary.sgst.toFixed(2)}
                        </td>
                        <td style={{ background: "#1e3a5f" }} />
                        <td
                          style={{
                            ...tdRight,
                            background: "#1e3a5f",
                            color: "#c4b5fd",
                            fontWeight: 700,
                          }}
                        >
                          0.00
                        </td>
                        <td
                          style={{
                            ...tdRight,
                            background: "#1e3a5f",
                            color: "#93c5fd",
                            fontWeight: 800,
                          }}
                        >
                          {summary.totalAmount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            ...tdRight,
                            background: "#1e3a5f",
                            color: "#86efac",
                            fontWeight: 800,
                          }}
                        >
                          {items
                            .reduce(
                              (s, i) => s + parseFloat(i.sellingCost || 0),
                              0,
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Summary + Amount in Words ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                {/* GST Breakdown */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 8,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      background: "#1e3a5f",
                      color: "white",
                      padding: "7px 12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Tax Summary
                  </div>
                  <div style={{ padding: "10px 14px" }}>
                    {[
                      ["CGST Amount", summary.cgst, "#2563eb"],
                      ["SGST Amount", summary.sgst, "#16a34a"],
                      ["IGST Amount", summary.igst, "#7c3aed"],
                      [
                        "Total GST",
                        summary.cgst + summary.sgst + summary.igst,
                        "#1e3a5f",
                      ],
                    ].map(([label, val, color]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "5px 0",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.78rem",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>{label}</span>
                        <span style={{ fontWeight: 700, color }}>
                          ₹ {val.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 8,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      background: "#1e3a5f",
                      color: "white",
                      padding: "7px 12px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Amount Summary
                  </div>
                  <div style={{ padding: "10px 14px" }}>
                    {[
                      [
                        "Taxable Total",
                        summary.taxableAmount,
                        "#1e293b",
                        false,
                      ],
                      [
                        "Total Discount",
                        summary.totalDiscount,
                        "#dc2626",
                        false,
                      ],
                      [
                        "Courier/Transport",
                        summary.courierTransportCharge,
                        "#1e293b",
                        false,
                      ],
                      ["Local Tax", summary.localTax, "#1e293b", false],
                      ["Round Off", summary.roundAmount, "#1e293b", false],
                    ].map(([label, val, color]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "4px 0",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.75rem",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>{label}</span>
                        <span style={{ fontWeight: 600, color }}>
                          ₹ {parseFloat(val || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Net Amount Hero ── */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
                  borderRadius: 10,
                  padding: "16px 24px",
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 15px rgba(30,58,95,0.3)",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    Amount in Words
                  </div>
                  <div
                    style={{
                      color: "white",
                      fontSize: "0.82rem",
                      fontStyle: "italic",
                    }}
                  >
                    {numberToWords(summary.netInvoiceAmount)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 2,
                    }}
                  >
                    Net Invoice Amount
                  </div>
                  <div
                    style={{
                      color: "white",
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    ₹ {summary.netInvoiceAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "white",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: "0.75rem",
                  color: "#64748b",
                }}
              >
                <span>
                  Prepared by:{" "}
                  <strong style={{ color: "#1e293b" }}>
                    {userId || "N/A"}
                  </strong>
                </span>
                <span>
                  Generated on:{" "}
                  <strong style={{ color: "#1e293b" }}>
                    {new Date().toLocaleString("en-IN")}
                  </strong>
                </span>
              </div>
            </InvBody>

            <ModalFoot
              style={{
                background: "white",
                borderTop: "2px solid #e2e8f0",
                padding: "12px 20px",
              }}
            >
              <Button secondary onClick={() => setShowInvoicePreview(false)}>
                <X size={13} style={{ marginRight: 4 }} /> Cancel
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #1e3a5f, #2d6a9f)",
                  minWidth: 160,
                }}
              >
                {loading ? "Submitting…" : "✓ Confirm & Submit"}
              </Button>
            </ModalFoot>
          </InvBox>
        </InvOverlay>
      )}

      {/* ═══════════════ CONFIRM CANCEL DIALOG ═══════════════ */}
      {showConfirmDialog && (
        <ModalOverlay>
          <div
            style={{
              background: "white",
              borderRadius: 10,
              width: 380,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <ModalHead>
              <ModalTitle>Confirm Cancel</ModalTitle>
            </ModalHead>
            <div
              style={{
                padding: "20px 18px",
                color: colors.textMuted,
                fontSize: "0.88rem",
              }}
            >
              Are you sure you want to cancel? All unsaved data will be lost.
            </div>
            <ModalFoot>
              <Button secondary onClick={() => setShowConfirmDialog(false)}>
                Keep Editing
              </Button>
              <Button
                danger
                onClick={() => {
                  resetForm();
                  setShowConfirmDialog(false);
                }}
              >
                Yes, Cancel
              </Button>
            </ModalFoot>
          </div>
        </ModalOverlay>
      )}

      {/* ═══════════════ INVOICE SAVED DIALOG ═══════════════ */}
      {showInvoiceSavedDialog && (
        <ModalOverlay>
          <InvSavedBox>
            <InvSavedHead>
              <span style={{ fontWeight: 700 }}>
                Invoice Saved Successfully
              </span>
              <CloseBtn
                onClick={handleInvoiceSavedDialogClose}
                style={{ color: "white" }}
              >
                <X size={16} />
              </CloseBtn>
            </InvSavedHead>
            <InvSavedBody>
              <div style={{ fontSize: "0.85rem", color: colors.textMuted }}>
                Invoice Number
              </div>
              <InvSavedNumber>{invoiceSavedData.invoice_number}</InvSavedNumber>
              <div style={{ fontSize: "0.82rem", color: colors.textMuted }}>
                For Invoice No: <strong>{invoiceSavedData.invoice_no}</strong>
              </div>
            </InvSavedBody>
            <ModalFoot>
              <Button
                onClick={handleInvoiceSavedDialogClose}
                style={{ width: "100%" }}
              >
                OK
              </Button>
            </ModalFoot>
          </InvSavedBox>
        </ModalOverlay>
      )}
      {showAddItemModal && (
        <AddItemMiniModal
          onClose={() => setShowAddItemModal(false)}
          onSuccess={() => fetchItems()} // refreshes the item dropdown after saving
        />
      )}
      {showAddVendorModal && (
        <AddVendorMiniModal
          onClose={() => setShowAddVendorModal(false)}
          onSuccess={() => fetchVendors()} // refreshes the vendor dropdown after saving
        />
      )}
    </PageWrapper>
  );
};

export default Invoice;
