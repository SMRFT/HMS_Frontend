import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled, { keyframes, css, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import DietOrderModal from "./DietOrderModal";
import { PageWrapper } from "../GlobalStyles";
import {
    FiSearch, FiRefreshCcw, FiFilter, FiClock,
    FiPrinter, FiFileText, FiX, FiCheckSquare,
    FiChevronDown, FiAlertCircle, FiInbox, FiEdit2
} from "react-icons/fi";
import * as XLSX from "xlsx";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
    bg: "#f8fafc",
    surface: "#ffffff",
    surface2: "#f1f5f9",
    surfaceOffset: "#e2e8f0",
    border: "rgba(15, 23, 42, 0.08)",
    borderStrong: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#475569",
    textFaint: "#94a3b8",
    primary: "#0d9488",
    primaryDark: "#0f766e",
    primaryHover: "#0f766e",
    primaryTint: "#f0fdfa",
    primaryBorder: "#99f6e4",
    indigo: "#4f46e5",
    indigoBg: "#eef2ff",
    indigoBorder: "#c7d2fe",
    // status
    delivered: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    received: { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
    cancelled: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    ordered: { bg: "#f0f9ff", text: "#0369a1", border: "#7dd3fc" },
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
`;

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Global Font & Scroll Lock ────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap');
  
  /* Lock the body scroll when on this report page */
  body.diet-report-active {
    overflow: hidden !important;
  }
`;

// ─── Page Shell ──────────────────────────────────────────────────────────────
const Shell = styled.div`
  height: calc(100vh - 110px);
  background: ${C.bg};
  padding: 0; /* Removing padding here to let the table fill better */
  font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: calc(100vh - 80px);
    gap: 16px;
  }
`;

// ─── Top Bar ─────────────────────────────────────────────────────────────────
const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${C.text};
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 10px;

  .icon {
    width: 36px;
    height: 36px;
    background: ${C.primaryTint};
    border: 1px solid ${C.primaryBorder};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${C.primary};
    flex-shrink: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

// ─── Primary / Outline Buttons ────────────────────────────────────────────────
const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  border: 1px solid transparent;

  ${({ variant }) => variant === "primary" && css`
    background: ${C.primary};
    color: #fff;
    border-color: ${C.primaryDark};
    box-shadow: 0 1px 3px rgba(13,148,136,0.25);
    &:hover:not(:disabled) { background: ${C.primaryDark}; box-shadow: 0 4px 10px rgba(13,148,136,0.3); transform: translateY(-1px); }
  `}

  ${({ variant }) => variant === "success" && css`
    background: #059669;
    color: #fff;
    border-color: #047857;
    box-shadow: 0 1px 3px rgba(5,150,105,0.25);
    &:hover:not(:disabled) { background: #047857; box-shadow: 0 4px 10px rgba(5,150,105,0.3); transform: translateY(-1px); }
  `}

  ${({ variant }) => variant === "outline" && css`
    background: ${C.surface};
    color: ${C.textMuted};
    border-color: ${C.borderStrong};
    &:hover:not(:disabled) { background: ${C.surface2}; color: ${C.text}; border-color: #cbd5e1; }
  `}

  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
  &:active:not(:disabled) { transform: scale(0.97); }
`;

const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid ${C.borderStrong};
  background: ${C.surface};
  color: ${C.textMuted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  &:hover { background: ${C.surface2}; color: ${C.primary}; border-color: #cbd5e1; }
  &:active { transform: scale(0.95); }
`;

// ─── Filter Bar ───────────────────────────────────────────────────────────────
const FilterCard = styled.div`
  background: ${C.surface};
  border: 1px solid ${C.borderStrong};
  border-radius: 16px;
  padding: 18px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  align-items: end;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${C.textFaint};
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

const inputBase = css`
  background: ${C.surface};
  border: 1px solid ${C.borderStrong};
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  color: ${C.text};
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
  &::placeholder { color: ${C.textFaint}; font-weight: 400; }
`;

const StyledInput = styled.input`${inputBase}`;
const StyledSelect = styled.select`
  ${inputBase}
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 34px;
`;

const SearchWrapper = styled.div`
  position: relative;
  svg.search-icon {
    position: absolute;
    left: 12px; top: 50%;
    transform: translateY(-50%);
    color: ${C.textFaint};
    pointer-events: none;
  }
  svg.clear-icon {
    position: absolute;
    right: 11px; top: 50%;
    transform: translateY(-50%);
    color: ${C.textFaint};
    cursor: pointer;
    &:hover { color: ${C.text}; }
  }
  input { padding-left: 36px; padding-right: 34px; }
`;

const RefreshBtn = styled.button`
  ${inputBase}
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${C.primary};
  border-color: ${C.primaryDark};
  color: #fff;
  gap: 6px;
  font-weight: 600;
  font-size: 0.82rem;
  transition: all 0.18s;
  &:hover { background: ${C.primaryDark}; transform: translateY(-1px); }
  &:active { transform: scale(0.97); }
`;

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const StatChip = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid ${({ color }) => color.border};
  background: ${({ color }) => color.bg};
  color: ${({ color }) => color.text};
`;

// ─── Table Container ──────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: ${C.surface};
  border: 1px solid ${C.borderStrong};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  flex: 1;
  display: flex;
  flex-direction: column;
  ${css`animation: ${fadeUp} 0.35s ease-out;`}
`;

const TableScrollArea = styled.div`
  overflow: auto;
  flex: 1;
  &::-webkit-scrollbar { width: 5px; height: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
`;

const Thead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 5;
  background: ${C.surface2};
`;

const Th = styled.th`
  padding: 13px 20px;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 800;
  color: ${C.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 1px solid ${C.borderStrong};
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #f8fafc;
  transition: background 0.12s;
  &:hover td { background: #fafafa; }
  &:last-child { border-bottom: none; }
`;

const Td = styled.td`
  padding: 16px 20px;
  font-size: 0.875rem;
  color: ${C.textMuted};
  vertical-align: top;
  background: ${C.surface};
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusMap = {
    Delivered: C.delivered,
    Received: C.received,
    Cancelled: C.cancelled,
    Ordered: C.ordered,
};

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  background:  ${({ status }) => (statusMap[status] || statusMap.Ordered).bg};
  color:       ${({ status }) => (statusMap[status] || statusMap.Ordered).text};
  border: 1px solid ${({ status }) => (statusMap[status] || statusMap.Ordered).border};
`;

const Dot = styled.span`
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor; display: inline-block;
`;

// ─── Pill Tags ────────────────────────────────────────────────────────────────
const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${C.surface2};
  color: ${C.textMuted};
  border: 1px solid ${C.borderStrong};
  white-space: nowrap;
`;

const ExtraTag = styled(Tag)`
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
`;

// ─── Inline Select (status update) ────────────────────────────────────────────
const InlineSelect = styled.select`
  ${inputBase}
  font-size: 0.78rem;
  padding: 6px 28px 6px 9px;
  width: 120px;
  border-radius: 8px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 9px center;
  appearance: none;
`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonPulse = styled.div`
  height: ${({ h }) => h || "14px"};
  width: ${({ w }) => w || "100%"};
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 600px 100%;
  ${css`animation: ${shimmer} 1.6s ease-in-out infinite;`}
`;

const SkeletonRow = () => (
    <Tr>
        <Td><SkeletonPulse w="70%" /><SkeletonPulse w="50%" h="10px" style={{ marginTop: 6 }} /></Td>
        <Td><SkeletonPulse w="55%" /></Td>
        <Td><SkeletonPulse w="80%" /><SkeletonPulse w="90%" h="10px" style={{ marginTop: 6 }} /></Td>
        <Td><SkeletonPulse w="70px" /></Td>
        <Td><SkeletonPulse w="120px" /></Td>
    </Tr>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyWrap = styled.div`
  padding: 80px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: ${C.textFaint};

  .icon-box {
    width: 56px; height: 56px;
    border-radius: 14px;
    background: ${C.surface2};
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 4px;
  }

  h4 { margin: 0; font-size: 1rem; color: ${C.textMuted}; font-weight: 600; }
  p  { margin: 0; font-size: 0.85rem; max-width: 28ch; line-height: 1.5; }
`;

// ─── Table Footer ─────────────────────────────────────────────────────────────
const TableFooter = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${C.borderStrong};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${C.surface2};
  font-size: 0.78rem;
  color: ${C.textFaint};
  font-weight: 500;
  flex-wrap: wrap;
  gap: 8px;
`;

// ─── Spinner (for buttons) ────────────────────────────────────────────────────
const Spinner = styled.span`
  display: inline-block;
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  ${css`animation: ${spin} 0.7s linear infinite;`}
`;

const RotatingIcon = styled(FiRefreshCcw)`
  ${({ $refreshing }) => $refreshing && css`
    animation: ${spin} 0.7s linear infinite;
  `}
`;

// ─── Component ────────────────────────────────────────────────────────────────
const DietOrderReport = () => {
    const today = new Date().toISOString().split("T")[0];

    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [statusFilter, setStatusFilter] = useState("");
    const [sessionFilter, setSessionFilter] = useState("");
    const [dietTypeFilter, setDietTypeFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [dietMasters, setDietMasters] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // ── Fetch masters once ─────────────────────────────────────────────────────
    const fetchMasters = useCallback(async () => {
        try {
            const [dm] = await Promise.all([
                apiRequest(`${HmsBaseUrl}get_diet_master/`, "GET"),
            ]);
            if (dm.success) {
                setDietMasters(Array.isArray(dm.data) ? dm.data : dm.data?.data || []);
            }
        } catch (e) { console.error(e); }
    }, []);

    // ── Fetch orders ───────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async (opts = {}) => {
        const isRefresh = opts.refresh;
        isRefresh ? setRefreshing(true) : setLoading(true);
        try {
            const q = [
                `from_date=${fromDate}`,
                `to_date=${toDate}`,
                statusFilter ? `status=${statusFilter}` : "",
                sessionFilter ? `meal_time=${sessionFilter}` : "",
                dietTypeFilter ? `diet_type=${dietTypeFilter}` : "",
            ].filter(Boolean).join("&");
            const res = await apiRequest(`${HmsBaseUrl}get_all_diet_orders/?${q}`, "GET");
            setOrders(res.success && res.data
                ? (Array.isArray(res.data) ? res.data : res.data.data || [])
                : []);
        } catch (e) { console.error(e); setOrders([]); }
        finally { setLoading(false); setRefreshing(false); }
    }, [fromDate, toDate, statusFilter, sessionFilter, dietTypeFilter]);

    useEffect(() => { fetchMasters(); }, [fetchMasters]);
    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Body Scroll Lock ───────────────────────────────────────────────────────
    useEffect(() => {
        document.body.classList.add("diet-report-active");
        return () => document.body.classList.remove("diet-report-active");
    }, []);

    // ── Client-side search ─────────────────────────────────────────────────────
    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        const t = searchTerm.toLowerCase();
        return orders.filter(o =>
            (o.patient_name || "").toLowerCase().includes(t) ||
            (o.uhid || "").toLowerCase().includes(t) ||
            (o.inpatient_number || "").toLowerCase().includes(t) ||
            (o.room_no || "").toLowerCase().includes(t)
        );
    }, [orders, searchTerm]);

    // ── Stats counters ─────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const count = (s) => filteredOrders.filter(o => o.status === s).length;
        return {
            total: filteredOrders.length,
            ordered: count("Ordered"),
            received: count("Received"),
            delivered: count("Delivered"),
            cancelled: count("Cancelled"),
        };
    }, [filteredOrders]);

    // ── Status update ──────────────────────────────────────────────────────────
    const updateStatus = async (id, s) => {
        const res = await apiRequest(`${HmsBaseUrl}update_diet_status/`, "PATCH", { diet_id: id, status: s });
        if (res.success) fetchOrders();
    };

    // ── Export XLS ─────────────────────────────────────────────────────────────
    const handleExportXLS = () => {
        const data = filteredOrders.map(o => ({
            "Order Date": o.order_date,
            "Order Time": o.order_time,
            "Patient": o.patient_name,
            "UHID": o.uhid,
            "IP Number": o.inpatient_number,
            "Ward / Room": `${o.ward_name} / ${o.room_no}`,
            "Session": o.meal_time,
            "Diet Type": o.diet_type,
            "Food Items": o.food_items,
            "Extras": (o.extra_items || []).map(e => `${e.item || e.item_name} (x${e.qty})`).join(", "),
            "Attenders": o.attender_count,
            "Status": o.status,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DietOrders");
        XLSX.writeFile(wb, `DietReport_${fromDate}_to_${toDate}.xlsx`);
    };

    // ── Print single slip ──────────────────────────────────────────────────────
    const handlePrintSingleSlip = (o) => {
        const w = window.open("", "_blank", "width=360,height=520");
        w.document.write(`
      <html><head><style>
        body{font-family:monospace;width:80mm;padding:12px;margin:0}
        .center{text-align:center;font-weight:800;font-size:16px;margin-bottom:10px}
        .row{margin:5px 0;font-size:13px}
        hr{border:1px dashed #000;margin:8px 0}
        .box{background:#f5f5f5;padding:8px;font-size:12px;margin-top:6px;border-radius:3px}
        .delivery{margin-top:15px; border:1px solid #000; padding:10px; font-weight:800; text-align:center; font-size:14px}
        .footer{text-align:center;font-size:10px;margin-top:12px;color:#666}
      </style></head><body>
        <div class="center">DIET ORDER SLIP</div><hr/>
        <div class="row"><b>NAME:</b> ${o.patient_name}</div>
        <div class="row"><b>UHID:</b> ${o.uhid} &nbsp; <b>IP:</b> ${o.inpatient_number}</div>
        <div class="row"><b>ROOM:</b> ${o.ward_name} / ${o.room_no}</div>
        <hr/>
        <div class="row"><b>MEAL:</b> ${o.meal_time}</div>
        <div class="row"><b>DIET:</b> ${o.diet_type}</div>
        <div class="box"><b>Base:</b> ${o.food_items || "Normal Diet"}
          ${o.extra_items?.length ? `<hr style="border:1px solid #ccc;margin:5px 0"><b>Extras:</b> ${o.extra_items.map(e => `${e.item || e.item_name} x${e.qty}`).join(", ")}` : ""}
        </div>
        <div class="delivery">DELIVERY: [ ] RECEIVED</div>
        <div class="footer">Printed: ${new Date().toLocaleString()}</div>
        <script>window.onload=()=>{window.print();window.close();}</script>
      </body></html>`);
        w.document.close();
    };

    // ── Print all slips ────────────────────────────────────────────────────────
    const handlePrintAllSlips = () => {
        const w = window.open("", "_blank");
        const slips = filteredOrders.map(o => `
      <div class="slip">
        <div class="header">DIET ORDER SLIP</div>
        <div class="row"><b>Patient:</b> ${o.patient_name}</div>
        <div class="row"><b>UHID:</b> ${o.uhid} | <b>IP:</b> ${o.inpatient_number}</div>
        <div class="row"><b>Location:</b> ${o.ward_name} / ${o.room_no}</div>
        <div class="row"><b>Session:</b> ${o.meal_time} | <b>Diet:</b> ${o.diet_type}</div>
        <div class="items"><b>Base:</b> ${o.food_items || "-"}
          ${o.extra_items?.length ? `<div style="margin-top:4px;border-top:1px solid #ddd;padding-top:4px"><b>Extras:</b> ${o.extra_items.map(e => `${e.item || e.item_name} x${e.qty}`).join(", ")}</div>` : ""}
        </div>
        <div class="footer">${new Date().toLocaleTimeString()}</div>
      </div><div class="pb"></div>
    `).join("");
        w.document.write(`
      <html><head><title>Batch Slips</title>
      <style>
        body{font-family:sans-serif;width:80mm;margin:0;padding:0}
        .slip{padding:10px;border-bottom:1px dashed #000;break-inside:avoid}
        .header{text-align:center;font-weight:800;border-bottom:2px solid #000;margin-bottom:6px;font-size:14px}
        .row{font-size:12px;margin:3px 0}
        .items{font-size:11px;background:#f0f0f0;padding:6px;margin-top:5px;border-radius:3px}
        .footer{font-size:10px;text-align:center;margin-top:5px;color:#666}
        .pb{page-break-after:always}
      </style></head>
      <body>${slips}
        <script>window.onload=()=>{window.print();window.close();}</script>
      </body></html>`);
        w.document.close();
    };

    // ── Delivery checklist ─────────────────────────────────────────────────────
    const handlePrintDeliveryChecklist = () => {
        const w = window.open("", "_blank");
        const sorted = [...filteredOrders].sort((a, b) =>
            a.ward_name !== b.ward_name
                ? a.ward_name.localeCompare(b.ward_name)
                : (a.room_no || "").localeCompare(b.room_no || "")
        );
        const rows = sorted.map((o, i) => `
      <tr>
        <td style="text-align: center;">${i + 1}</td>
        <td><b>${o.ward_name}</b> / ${o.room_no}</td>
        <td>
            <div style="font-weight: 700;">${o.patient_name}</div>
            <div style="font-size: 10px; color: #666;">${o.uhid} | ${o.inpatient_number}</div>
        </td>
        <td>${o.meal_time}<br/><small>${o.diet_type}</small></td>
        <td><div style="max-width: 200px;">${(o.extra_items || []).map(e => `${e.item || e.item_name} x${e.qty}`).join(", ") || "—"}</div></td>
        <td style="text-align:center;"><div style="width: 25px; height: 25px; border: 2px solid #000; margin: 0 auto;"></div></td>
      </tr>`).join("");
        w.document.write(`
      <html><head><title>Delivery Checklist</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body{font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:0; margin:0; color: #111; }
        .container { padding: 20px; }
        .header-box { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
        h2{ margin: 0; font-size: 22px; text-transform: uppercase; }
        .meta-info { font-size: 12px; color: #444; }
        table{width:100%; border-collapse:collapse; }
        th,td{ border: 1px solid #999; padding: 10px; text-align: left; font-size: 11px; }
        th{ background: #f0f0f0; font-weight: 700; text-transform: uppercase; font-size: 10px; }
        .signature-area { margin-top: 50px; display: flex; justify-content: space-between; }
        .sig-line { border-top: 1px solid #000; width: 220px; padding-top: 5px; text-align: center; font-size: 11px; font-weight: 600; }
        @media print {
            .container { padding: 0; }
            th { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
        }
      </style></head>
      <body>
        <div class="container">
            <div class="header-box">
                <div>
                    <h2>Diet Delivery Checklist</h2>
                    <div class="meta-info">Date: <b>${new Date().toLocaleDateString()}</b> | Session: <b>${sessionFilter || "All Sessions"}</b></div>
                </div>
                <div class="meta-info">Total Orders: <b>${sorted.length}</b></div>
            </div>
            <table>
              <thead><tr><th style="width:30px">#</th><th style="width:120px">Location</th><th>Patient Details</th><th style="width:100px">Meal & Diet</th><th>Extras</th><th style="width:50px; text-align:center">✓</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="signature-area">
              <div class="sig-line">Kitchen In-charge</div>
              <div class="sig-line">Ward Nurse / Supervisor</div>
            </div>
        </div>
        <script>window.onload=()=>{window.print();window.close();}</script>
      </body></html>`);
        w.document.close();
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <GlobalStyle />
            <Shell>
                {/* ── Top Bar ─────────────────────────────────────────────────────── */}
                <TopBar>
                    <PageTitle>
                        <span className="icon">🍱</span>
                        Diet Fulfillment Hub
                    </PageTitle>
                    <HeaderActions>
                        <Btn
                            variant="success"
                            onClick={handlePrintDeliveryChecklist}
                            disabled={filteredOrders.length === 0}
                        >
                            <FiCheckSquare size={14} /> Delivery Checklist
                        </Btn>
                        <Btn
                            variant="primary"
                            onClick={handlePrintAllSlips}
                            disabled={filteredOrders.length === 0}
                        >
                            <FiPrinter size={14} /> Print All Slips
                        </Btn>
                        <Btn
                            variant="outline"
                            onClick={handleExportXLS}
                            disabled={filteredOrders.length === 0}
                        >
                            <FiFileText size={14} /> Export XLSX
                        </Btn>
                    </HeaderActions>
                </TopBar>

                {/* ── Filters ──────────────────────────────────────────────────────── */}
                <FilterCard>
                    <FormGroup>
                        <Label>From Date</Label>
                        <StyledInput type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>To Date</Label>
                        <StyledInput type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Meal Session</Label>
                        <StyledSelect value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}>
                            <option value="">All Meals</option>
                            <option>Breakfast</option>
                            <option>Lunch</option>
                            <option>Snacks</option>
                            <option>Dinner</option>
                        </StyledSelect>
                    </FormGroup>
                    <FormGroup>
                        <Label>Diet Type</Label>
                        <StyledSelect value={dietTypeFilter} onChange={e => setDietTypeFilter(e.target.value)}>
                            <option value="">All Types</option>
                            {dietMasters.map(d => (
                                <option key={d.diet_id} value={d.diet_name}>{d.diet_name}</option>
                            ))}
                        </StyledSelect>
                    </FormGroup>
                    <FormGroup>
                        <Label>Status</Label>
                        <StyledSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option>Ordered</option>
                            <option>Received</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                        </StyledSelect>
                    </FormGroup>
                    <FormGroup style={{ minWidth: "180px" }}>
                        <Label>Search</Label>
                        <SearchWrapper>
                            <FiSearch size={14} className="search-icon" />
                            <StyledInput
                                placeholder="Name, UHID, IP, Room…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <FiX size={14} className="clear-icon" onClick={() => setSearchTerm("")} />
                            )}
                        </SearchWrapper>
                    </FormGroup>
                    <FormGroup>
                        <Label>&nbsp;</Label>
                        <RefreshBtn onClick={() => fetchOrders({ refresh: true })} title="Refresh">
                            <RotatingIcon size={14} $refreshing={refreshing} />
                            Refresh
                        </RefreshBtn>
                    </FormGroup>
                </FilterCard>

                {/* ── Stats Row ────────────────────────────────────────────────────── */}
                {!loading && filteredOrders.length > 0 && (
                    <StatsRow>
                        <StatChip color={{ bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" }}>
                            <Dot style={{ background: "#64748b" }} />
                            Total: <strong>{stats.total}</strong>
                        </StatChip>
                        {stats.ordered > 0 && (
                            <StatChip color={C.ordered}>
                                <Dot /> Ordered: <strong>{stats.ordered}</strong>
                            </StatChip>
                        )}
                        {stats.received > 0 && (
                            <StatChip color={C.received}>
                                <Dot /> Received: <strong>{stats.received}</strong>
                            </StatChip>
                        )}
                        {stats.delivered > 0 && (
                            <StatChip color={C.delivered}>
                                <Dot /> Delivered: <strong>{stats.delivered}</strong>
                            </StatChip>
                        )}
                        {stats.cancelled > 0 && (
                            <StatChip color={C.cancelled}>
                                <Dot /> Cancelled: <strong>{stats.cancelled}</strong>
                            </StatChip>
                        )}
                    </StatsRow>
                )}

                {/* ── Table ────────────────────────────────────────────────────────── */}
                <TableCard>
                    <TableScrollArea>
                        <Table>
                            <Thead>
                                <tr>
                                    <Th>Patient</Th>
                                    <Th>Location</Th>
                                    <Th>Meal & Diet</Th>
                                    <Th>Status</Th>
                                    <Th style={{ textAlign: "right" }}>Actions</Th>
                                </tr>
                            </Thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <Td colSpan="5" style={{ padding: 0, border: "none" }}>
                                            <EmptyWrap>
                                                <div className="icon-box">
                                                    <FiInbox size={22} color={C.textFaint} />
                                                </div>
                                                <h4>No orders found</h4>
                                                <p>Try adjusting your filters or date range.</p>
                                            </EmptyWrap>
                                        </Td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(o => (
                                        <Tr key={o.diet_id}>
                                            {/* ── Patient ─────────────────────────────────────── */}
                                            <Td>
                                                <div style={{ fontWeight: 700, color: C.text, marginBottom: 5, fontSize: "0.925rem" }}>
                                                    {o.patient_name}
                                                </div>
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                                                    <Tag>{o.uhid}</Tag>
                                                    <Tag>{o.inpatient_number}</Tag>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: C.textFaint }}>
                                                    <FiClock size={11} />
                                                    {o.order_date} · {o.order_time}
                                                </div>
                                            </Td>

                                            {/* ── Location ─────────────────────────────────────── */}
                                            <Td>
                                                <div style={{ fontWeight: 700, color: C.textMuted, fontSize: "0.82rem", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                                    {o.ward_name}
                                                </div>
                                                <span style={{
                                                    display: "inline-block",
                                                    background: C.indigoBg,
                                                    color: C.indigo,
                                                    border: `1px solid ${C.indigoBorder}`,
                                                    padding: "3px 10px",
                                                    borderRadius: 8,
                                                    fontSize: "0.78rem",
                                                    fontWeight: 700,
                                                }}>
                                                    Room {o.room_no || "—"}
                                                </span>
                                            </Td>

                                            {/* ── Meal & Diet ───────────────────────────────────── */}
                                            <Td>
                                                <div style={{ fontWeight: 700, color: C.text, marginBottom: 5, fontSize: "0.875rem" }}>
                                                    {o.meal_time}
                                                    <span style={{ color: C.textFaint, fontWeight: 500 }}> · {o.diet_type}</span>
                                                </div>
                                                {o.food_items && (
                                                    <div style={{ fontSize: "0.78rem", color: C.textMuted, background: C.surface2, padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.borderStrong}`, marginBottom: 6 }}>
                                                        {o.food_items}
                                                    </div>
                                                )}
                                                {Array.isArray(o.extra_items) && o.extra_items.length > 0 && (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                                        {o.extra_items.map((ex, idx) => (
                                                            <ExtraTag key={idx}>
                                                                {ex.item || ex.item_name} ×{ex.qty}
                                                            </ExtraTag>
                                                        ))}
                                                    </div>
                                                )}
                                            </Td>

                                            {/* ── Status ───────────────────────────────────────── */}
                                            <Td>
                                                <StatusBadge status={o.status}>
                                                    <Dot /> {o.status}
                                                </StatusBadge>
                                            </Td>

                                            {/* ── Actions ──────────────────────────────────────── */}
                                            <Td style={{ textAlign: "right" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                                                    <InlineSelect
                                                        value={o.status}
                                                        onChange={e => updateStatus(o.diet_id, e.target.value)}
                                                    >
                                                        <option>Ordered</option>
                                                        <option>Received</option>
                                                        <option>Delivered</option>
                                                        <option>Cancelled</option>
                                                    </InlineSelect>

                                                    {o.status === "Ordered" && (
                                                        <IconBtn
                                                            onClick={() => {
                                                                setEditingOrder({
                                                                    uhid: o.uhid,
                                                                    ipNumber: o.inpatient_number,
                                                                    firstName: o.patient_name,
                                                                    roomNo: o.room_no,
                                                                    ward_name: o.ward_name
                                                                });
                                                                setShowEditModal(true);
                                                            }}
                                                            title="Edit Order"
                                                            style={{ color: C.primary }}
                                                        >
                                                            <FiEdit2 size={14} />
                                                        </IconBtn>
                                                    )}

                                                    <IconBtn
                                                        onClick={() => handlePrintSingleSlip(o)}
                                                        title="Print slip"
                                                    >
                                                        <FiPrinter size={14} />
                                                    </IconBtn>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </TableScrollArea>

                    {/* ── Footer ──────────────────────────────────────────────────── */}
                    {!loading && filteredOrders.length > 0 && (
                        <TableFooter>
                            <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders</span>
                            <span>{fromDate} → {toDate}</span>
                        </TableFooter>
                    )}
                </TableCard>
            </Shell>

            {showEditModal && editingOrder && (
                <DietOrderModal
                    patient={editingOrder}
                    HmsBaseUrl={HmsBaseUrl}
                    onClose={() => setShowEditModal(false)}
                    onSaved={() => {
                        setShowEditModal(false);
                        fetchOrders();
                    }}
                />
            )}
        </>
    );
};

export default DietOrderReport;