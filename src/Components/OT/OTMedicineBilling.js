import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Package as PackageIcon,
  Eye,
  Printer,
  Search,
  ClipboardList,
  Plus,
  X,
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import OTPrintModal from "./OTPrintModal";
import {
  generateMedicineOverallPrintHtml,
  generateMedicineSingleSlipHtml,
  getQty,
  getDispatchedQty,
  getPendingQty,
  getItemDispatchStatus,
  getRequestDispatchStatus,
  getDispatchStatusColor,
} from "./otPrintUtils";

const colors = {
  primary: "#136A63",
  primaryDark: "#0B4C47",
  orange: "#F88C22",
  orangeHover: "#E67D1E",
  dark: "#37474F",
  border: "#CFD8DC",
  background: "#F5F7F8",
  textMain: "#263238",
  textMuted: "#78909C",
  white: "#FFFFFF",
  headerBg: "#546E7A",
  legPending: "#FFC107",
  legSubstituted: "#B366CC",
  legBilled: "#28A745",
  legCancelled: "#6C757D",
  legStopped: "#FA6680",
  legEmergency: "#DC3545",
  legInsurance: "#007BFF",
  legDischarge: "#48D1CC",
  legRegular: "#136A63",
  legProcessed: "#8b5edd",
  packageTag: "#1d4ed8",
};

// ─── Pending Print HTML generator (bill-wise pending list) ────────────────────
const escHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
      c
      ],
  );

const generateMedicinePendingPrintHtml = ({ patient = {}, requests = [] }) => {
  const bills = (requests || [])
    .filter((r) => (r.billingStatus || "Pending") !== "Cancelled")
    .map((r) => ({
      req: r,
      items: (r.medicines || []).filter((m) => getPendingQty(m) > 0),
    }))
    .filter((b) => b.items.length > 0);

  const totalPendingItems = bills.reduce((a, b) => a + b.items.length, 0);
  const printedOn = new Date().toLocaleString("en-IN");

  const billBlocks = bills
    .map(({ req, items }) => {
      const rows = items
        .map(
          (m, i) => `
        <tr>
          <td class="c">${i + 1}</td>
          <td>${escHtml(m.itemName || m.name)}</td>
          <td class="r">${getQty(m)}</td>
          <td class="r">${getDispatchedQty(m)}</td>
          <td class="r pend">${getPendingQty(m)}</td>
          <td>${escHtml(m.remark || "-")}</td>
        </tr>`,
        )
        .join("");
      return `
      <div class="bill">
        <div class="bill-head">
          <span><b>Bill No:</b> ${escHtml(req.bill_id || req.Bill_id || "-")}</span>
          <span><b>Date:</b> ${escHtml(req.reqDate || "")} ${escHtml(req.reqTime || "")}</span>
          <span><b>Doctor:</b> ${escHtml(req.doctorName || req.doctor || "-")}</span>
          <span><b>Dispatch:</b> ${escHtml(getRequestDispatchStatus(req))}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th>Medicine / Item</th>
              <th style="width:80px">Qty</th>
              <th style="width:110px">Dispatched Qty</th>
              <th style="width:90px">Pending Qty</th>
              <th style="width:160px">Remark</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>OT Medicine Pending List</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 12px; margin: 0; padding: 0; }
  h2 { margin: 0 0 4px 0; text-align: center; font-size: 17px; color: #136A63; }
  .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 10px; }
  .patient { border: 1px solid #999; padding: 8px 10px; margin-bottom: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 14px; }
  .patient div span { color: #555; }
  .bill { margin-bottom: 14px; page-break-inside: avoid; }
  .bill-head { background: #eef3f4; border: 1px solid #999; border-bottom: none; padding: 6px 8px; display: flex; flex-wrap: wrap; gap: 6px 18px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #999; padding: 5px 7px; text-align: left; }
  th { background: #546E7A; color: #fff; font-size: 11px; }
  td.r, th.r { text-align: right; }
  td.c { text-align: center; }
  td.pend { font-weight: 700; color: #c2410c; }
  .summary { margin-top: 10px; font-weight: 700; }
  .empty { text-align: center; padding: 40px; color: #666; border: 1px dashed #999; }
  .foot { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #444; }
</style>
</head>
<body>
  <h2>OT Medicine - Pending Items (Bill Wise)</h2>
  <div class="sub">Printed on ${escHtml(printedOn)}</div>

  <div class="patient">
    <div><span>IP No:</span> <b>${escHtml(patient.ipNo)}</b></div>
    <div><span>UHID:</span> <b>${escHtml(patient.uhid)}</b></div>
    <div><span>Patient:</span> <b>${escHtml(patient.name)}</b></div>
    <div><span>Age / Gender:</span> <b>${escHtml(patient.age)} / ${escHtml(patient.gender)}</b></div>
    <div><span>Admitting Dr:</span> <b>${escHtml(patient.admittingDr)}</b></div>
    <div><span>Room | Bed:</span> <b>${escHtml(patient.roomBed)}</b></div>
    <div><span>Customer Type:</span> <b>${escHtml(patient.customerType)}</b></div>
    <div><span>Company:</span> <b>${escHtml(patient.companyName)}</b></div>
    ${patient.surgeryRef ? `<div><span>Surgery Ref:</span> <b>${escHtml(patient.surgeryRef)}</b></div>` : ""}
  </div>

  ${bills.length
      ? billBlocks +
      `<div class="summary">Total bills with pending items: ${bills.length} &nbsp;|&nbsp; Total pending item lines: ${totalPendingItems}</div>`
      : `<div class="empty">No pending items found.</div>`
    }

  <div class="foot">
    <span>Prepared by: ____________________</span>
    <span>Received by: ____________________</span>
  </div>
</body>
</html>`;
};

// ─── Styled components ────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${colors.background};
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: #ffffff;
  border-bottom: 1px solid ${colors.border};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid ${colors.primary};
  color: ${colors.primary};
  border-radius: 6px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${colors.primary};
    color: #fff;
  }
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SurgeryRefChip = styled.span`
  font-size: 0.74rem;
  font-weight: 600;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 2px 10px;
`;

const EmergencyChip = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 20px;
  padding: 2px 10px;
  animation: blink 1s step-start infinite;
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;
const ModalContainer = styled.div`
  background: ${colors.background};
  width: 96%;
  max-width: 1500px;
  height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background: ${colors.primary};
  color: white;
  button {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
`;
const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;
const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const PatientPanel = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 15px 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;
const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px 16px;
  @media (max-width: 1300px) {
    grid-template-columns: repeat(4, 2fr);
  }
`;
const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const FieldLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
const FieldValue = styled.div`
  background: #f1f5f7;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.85rem;
  color: ${colors.textMain};
  min-height: 32px;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;
const RequestBtn = styled.button`
  background: ${colors.orange};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
  box-shadow: 0 4px 6px rgba(248, 140, 34, 0.2);
  &:hover {
    background: ${colors.orangeHover};
    transform: translateY(-1px);
  }
`;

const EditModeBanner = styled.div`
  background: #fffbeb;
  border: 1.5px solid #f59e0b;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
`;

const PackageModeBanner = styled.div`
  background: #eff6ff;
  border: 1.5px solid #1d4ed8;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d4ed8;
`;

const ClearPackageBtn = styled.button`
  background: white;
  border: 1px solid #1d4ed8;
  color: #1d4ed8;
  border-radius: 5px;
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: #1d4ed8;
    color: white;
  }
`;

const RequestFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 0;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 25px;
  background: ${colors.white};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;
const FormPanel = styled.div`
  padding: 24px;
  border-right: 1px solid ${colors.border};
`;
const SidePanel = styled.div`
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
`;
const SidePanelHeader = styled.div`
  background: #f1f5f7;
  padding: 12px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${colors.dark};
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
`;
const SidePanelContent = styled.div`
  flex: 1;
  padding: 10px 20px;
  max-height: 500px;
  overflow-y: auto;
`;
const SidePanelFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${colors.border};
  background: #f9fbfc;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px 20px;
  margin-bottom: 20px;
`;
const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;
const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.textMuted};
`;

const StyledInput = styled.input`
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(19, 106, 99, 0.1);
  }
`;

const StyledSelect = styled.select`
  border: 1px solid ${colors.border};
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  width: 100%;
  background-color: white;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;
const AddBtn = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: ${colors.primaryDark};
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;
const CancelBtn = styled.button`
  background: ${colors.textMuted};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-weight: 600;
  cursor: pointer;
`;

const TabsBar = styled.div`
  display: flex;
  gap: 15px;
  margin: 30px 0 15px 0;
  border-bottom: 2px solid ${colors.border};
  padding-bottom: 0;
`;
const Tab = styled.div`
  padding: 8px 25px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  color: ${(p) => (p.active ? colors.primary : colors.textMuted)};
  border-bottom: 3px solid ${(p) => (p.active ? colors.primary : "transparent")};
  margin-bottom: -2px;
  transition: all 0.2s;
  &:hover {
    color: ${colors.primary};
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  th {
    background: ${colors.headerBg};
    color: white;
    padding: 12px 15px;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 600;
  }
  td {
    padding: 12px 15px;
    font-size: 0.88rem;
    border-bottom: 1px solid #edf2f4;
    color: ${colors.textMain};
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover {
    background: #f8fafb;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 25px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  flex-wrap: wrap;
`;
const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${(p) => p.color};
  color: white;
`;

// ─── Dropdown shared styles ───────────────────────────────────────────────────
const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 240px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 0 0 6px 6px;
`;

const DropdownItem = styled.li`
  padding: 10px 15px;
  font-size: 0.88rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  color: ${colors.textMain};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${colors.background};
    color: ${colors.primaryDark};
    font-weight: 600;
  }
`;

const PackageOptionItem = styled.li`
  padding: 10px 15px;
  font-size: 0.88rem;
  cursor: pointer;
  border-bottom: 2px solid ${colors.border};
  background: #f0f6ff;
  color: ${colors.packageTag};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #e0edff;
  }
`;

// ─── Searchable Dropdown (used for Doctor field) ──────────────────────────────
const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  displayKey = "name",
  valueKey = "id",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (value) {
      const sel = options.find((o) =>
        typeof o === "string" ? o === value : o[valueKey] === value,
      );
      if (sel) setSearchTerm(typeof sel === "string" ? sel : sel[displayKey]);
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  const filtered = options.filter((o) => {
    const txt = typeof o === "string" ? o : o[displayKey];
    return txt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectOption = (o) => {
    const val = typeof o === "string" ? o : o[valueKey];
    const txt = typeof o === "string" ? o : o[displayKey];
    onChange(val);
    setSearchTerm(txt);
    setIsOpen(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setIsOpen(true);
      setActiveIdx(0);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => (p + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => (p - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && filtered[activeIdx]) {
        selectOption(filtered[activeIdx]);
      } else if (filtered.length === 1) {
        selectOption(filtered[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIdx(-1);
    } else if (e.key === "Tab") {
      if (isOpen && filtered.length > 0) {
        const pick = activeIdx >= 0 ? filtered[activeIdx] : filtered[0];
        selectOption(pick);
      }
      setIsOpen(false);
      setActiveIdx(-1);
    }
  };

  return (
    <SearchWrapper ref={wrapperRef}>
      <StyledInput
        type="text"
        value={searchTerm}
        placeholder={placeholder}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setActiveIdx(-1);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />
      {isOpen && filtered.length > 0 && (
        <DropdownList ref={listRef} role="listbox">
          {filtered.map((o, i) => (
            <DropdownItem
              key={i}
              data-idx={i}
              role="option"
              aria-selected={activeIdx === i}
              style={{
                background: activeIdx === i ? "#f0fdf4" : undefined,
                fontWeight: activeIdx === i ? 600 : undefined,
                color: activeIdx === i ? colors.primary : undefined,
              }}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => selectOption(o)}
            >
              {typeof o === "string" ? o : o[displayKey]}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

// ─── Medicine Name Field — inline keyboard-navigable dropdown ─────────────────
const MedicineNameField = ({
  searchQuery,
  setSearchQuery,
  selectedDrug,
  setSelectedDrug,
  onOpenPackageList,
  disabled,
  onSearch,
  searchResults,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  const selectItem = (item) => {
    setSelectedDrug(item);
    setSearchQuery(item.name);
    setIsOpen(false);
    setActiveIdx(-1);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (selectedDrug) setSelectedDrug(null);
    setSearchQuery(val);
    setActiveIdx(-1);

    clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      setIsOpen(true);
      debounceRef.current = setTimeout(() => onSearch(val), 300);
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    const total = 1 + searchResults.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIdx((p) => (p + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => (p - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) return;
      if (activeIdx === 0) {
        setIsOpen(false);
        setActiveIdx(-1);
        onOpenPackageList();
      } else if (activeIdx > 0) {
        selectItem(searchResults[activeIdx - 1]);
      } else if (searchResults.length === 1) {
        selectItem(searchResults[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIdx(-1);
    } else if (e.key === "Tab") {
      setIsOpen(false);
      setActiveIdx(-1);
    }
  };

  const displayValue = selectedDrug ? selectedDrug.name : searchQuery;

  return (
    <SearchWrapper ref={wrapperRef}>
      <StyledInput
        type="text"
        disabled={disabled}
        placeholder="Search medicine (min 2 chars)..."
        value={displayValue}
        onChange={handleChange}
        onFocus={() => {
          if (searchQuery.length >= 2 || searchResults.length > 0)
            setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />

      {isOpen && !disabled && (
        <DropdownList ref={listRef} role="listbox">
          <PackageOptionItem
            data-idx={0}
            role="option"
            aria-selected={activeIdx === 0}
            style={{
              background: activeIdx === 0 ? "#dbeafe" : undefined,
              outline: "none",
            }}
            onMouseEnter={() => setActiveIdx(0)}
            onClick={() => {
              setIsOpen(false);
              setActiveIdx(-1);
              onOpenPackageList();
            }}
          >
            <PackageIcon size={15} aria-hidden="true" /> Select from Package
          </PackageOptionItem>

          {searchResults.length === 0 && searchQuery.length >= 2 && (
            <DropdownItem
              style={{
                color: colors.textMuted,
                fontStyle: "italic",
                cursor: "default",
              }}
            >
              No items found
            </DropdownItem>
          )}
          {searchResults.map((item, i) => {
            const idx = i + 1;
            return (
              <DropdownItem
                key={item.item_id}
                data-idx={idx}
                role="option"
                aria-selected={activeIdx === idx}
                style={{
                  background: activeIdx === idx ? "#f0fdf4" : undefined,
                  fontWeight: activeIdx === idx ? 600 : undefined,
                  color: activeIdx === idx ? colors.primary : undefined,
                  outline: "none",
                }}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => selectItem(item)}
              >
                {item.name}
              </DropdownItem>
            );
          })}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

// ─── View Medicines Modal (Qty / Dispatched Qty / Pending Qty / Status) ───────
const ViewMedicinesModal = ({ request, onClose, onPrint }) => {
  if (!request) return null;
  const medicines = request.medicines || [];

  const totals = medicines.reduce(
    (a, m) => ({
      qty: a.qty + getQty(m),
      dispatched: a.dispatched + getDispatchedQty(m),
      pending: a.pending + getPendingQty(m),
    }),
    { qty: 0, dispatched: 0, pending: 0 },
  );

  const requestStatus = getRequestDispatchStatus(request);

  const thStyle = { padding: "10px", textAlign: "left" };
  const thRight = { padding: "10px", textAlign: "right" };

  return (
    <ModalOverlay style={{ zIndex: 2100 }}>
      <ModalContainer
        style={{ width: "75%", height: "70%", maxWidth: "1000px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <HeaderTitle>
            <Eye
              size={20}
              style={{ verticalAlign: "middle", marginRight: "8px" }}
            />
            Medicine Details
            {request.packageName && (
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  marginLeft: "12px",
                  background: "rgba(255,255,255,0.2)",
                  padding: "2px 10px",
                  borderRadius: "12px",
                }}
              >
                📦 {request.packageName}
              </span>
            )}
          </HeaderTitle>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => onPrint && onPrint(request)}
              style={{
                background: colors.orange,
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "5px 12px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
              title="Print requisition slip"
            >
              <Printer size={14} /> Print Slip
            </button>
            <button onClick={onClose} style={{ fontSize: "1.5rem", lineHeight: 1 }}>
              ×
            </button>
          </div>
        </Header>
        <ContentBody>
          <div
            style={{
              marginBottom: "16px",
              fontSize: "0.85rem",
              color: colors.textMuted,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span>
              {request.reqDate} {request.reqTime} · Doctor:{" "}
              <strong style={{ color: colors.textMain }}>
                {request.doctorName || request.doctor || "-"}
              </strong>
            </span>
            <span
              style={{
                background: getDispatchStatusColor(requestStatus),
                color: "white",
                fontWeight: 700,
                fontSize: "0.72rem",
                padding: "2px 10px",
                borderRadius: "12px",
              }}
            >
              {requestStatus}
            </span>
          </div>
          {medicines.length > 0 ? (
            <div
              style={{
                overflowX: "auto",
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.88rem",
                }}
              >
                <thead>
                  <tr style={{ background: colors.headerBg, color: "#fff" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Medicine Name</th>
                    <th style={thStyle}>Dosage</th>
                    <th style={thRight}>No. of Days</th>
                    <th style={thRight}>Quantity</th>
                    <th style={thRight}>Dispatched Qty</th>
                    <th style={thRight}>Pending Qty</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m, i) => {
                    const pending = getPendingQty(m);
                    const itemStatus = getItemDispatchStatus(m);
                    return (
                      <tr
                        key={i}
                        style={{ borderBottom: `1px solid ${colors.border}` }}
                      >
                        <td style={{ padding: "10px", color: colors.textMuted }}>
                          {i + 1}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            fontWeight: 600,
                            color: colors.primary,
                          }}
                        >
                          {m.itemName || m.name}
                        </td>
                        <td style={{ padding: "10px" }}>{m.dosage || "-"}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {m.noOfDays || "-"}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {getQty(m)}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {getDispatchedQty(m)}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: pending > 0 ? "#c2410c" : colors.legBilled,
                          }}
                        >
                          {pending}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            color: getDispatchStatusColor(itemStatus),
                            whiteSpace: "nowrap",
                          }}
                        >
                          {itemStatus}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            fontStyle: m.remark ? "italic" : "normal",
                            color: m.remark ? colors.orange : colors.textMuted,
                          }}
                        >
                          {m.remark || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f1f5f7", fontWeight: 700 }}>
                    <td style={{ padding: "10px" }} colSpan={4}>
                      Total
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      {totals.qty}
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      {totals.dispatched}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "right",
                        color: totals.pending > 0 ? "#c2410c" : colors.legBilled,
                      }}
                    >
                      {totals.pending}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        color: getDispatchStatusColor(requestStatus),
                        whiteSpace: "nowrap",
                      }}
                    >
                      {requestStatus}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: colors.textMuted,
              }}
            >
              No medicines found for this request.
            </div>
          )}
        </ContentBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OTMedicineBilling = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const pd = location.state?.patientData || {};

  const resolvedPatient = {
    ipNo: pd.ipNumber || "-",
    uhid: pd.uhid || "-",
    name: pd.patient_name || pd.firstName || "Unknown Patient",
    age: pd.age || "-",
    gender: pd.gender || "-",
    admittingDr: pd.admittingDoctor || "-",
    roomBed: `${pd.roomNo || "-"} | ${pd.bedNo || "-"}`,
    customerType: pd.customerType || pd.customer_type || "-",
    companyName: pd.companyName || pd.company_name || "-",
    surgeryRef: pd.surgeryRef || "",
    is_emergency: !!pd.is_emergency,
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);

  const [packages, setPackages] = useState([]);
  const [packageSearch, setPackageSearch] = useState("");
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedPackageName, setSelectedPackageName] = useState("");
  const [packageLoading, setPackageLoading] = useState(false);

  const [viewingRequest, setViewingRequest] = useState(null);
  const [overallPrintOpen, setOverallPrintOpen] = useState(false);
  const [pendingPrintOpen, setPendingPrintOpen] = useState(false);
  const [printSingleRequest, setPrintSingleRequest] = useState(null);

  const pharmacyDept = "OLET001";

  const [selectedDrug, setSelectedDrug] = useState(null);
  const [doctor, setDoctor] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [qty, setQty] = useState("");
  const [remark, setRemark] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dosage, setDosage] = useState("");
  const [noOfDays, setNoOfDays] = useState("");
  const [dosageOptions, setDosageOptions] = useState([]);
  const [showDosageModal, setShowDosageModal] = useState(false);
  const [newDosageName, setNewDosageName] = useState("");

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRequests();
    fetchDoctors();
    fetchDosages();
    fetchPackages();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!doctors.length || !pd.admittingDoctor) return;
    const match = doctors.find(
      (d) =>
        d.employeeId === pd.admittingDoctor ||
        d.employeeName === pd.admittingDoctor,
    );
    if (match) {
      setDoctor(match.employeeId);
      setDoctorName(match.employeeName);
    } else setDoctor(pd.admittingDoctor);
  }, [doctors, pd.admittingDoctor]); // eslint-disable-line

  // ── API calls ──────────────────────────────────────────────────────────────
  const fetchDosages = async () => {
    const res = await apiRequest(`${HmsBaseUrl}dosage_master/`, "GET");
    if (res.success) setDosageOptions(res.data?.data || []);
  };

  const handleSaveDosage = async () => {
    if (!newDosageName) return alert("Enter dosage name");
    const res = await apiRequest(`${HmsBaseUrl}dosage_master/`, "POST", {
      dosage_name: newDosageName,
    });
    if (res.success) {
      setNewDosageName("");
      setShowDosageModal(false);
      fetchDosages();
    }
  };

  const fetchRequests = async () => {
    const res = await apiRequest(
      `${HmsBaseUrl}get_ot_medicine_ward_requests/?uhid=${pd.uhid || ""}&ipNumber=${pd.ipNumber || ""}`,
      "GET",
    );
    if (res.success) setRequests(res.data?.data || []);
  };

  const fetchDoctors = async () => {
    const res = await apiRequest(
      `${HmsBaseUrl}doctor_list_diagnostics/`,
      "GET",
    );
    if (res.success) {
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setDoctors(list);
    }
  };

  // ── Medicine search — queries item master directly (no stock/batch) ────────
  const handleMedicineSearch = async (val) => {
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await apiRequest(
      `${HmsBaseUrl}get_pharmacy_items/?search=${encodeURIComponent(val)}`,
      "GET",
    );
    const list = res.success
      ? Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : []
      : [];
    setSearchResults(
      list.map((i) => ({
        id: i.item_id,
        item_id: i.item_id,
        name: i.item_name,
      })),
    );
  };

  // ── Package helpers ────────────────────────────────────────────────────────
  const fetchPackages = async () => {
    const res = await apiRequest(
      `${HmsBaseUrl}get_medicine_packages/?outlet_code=${pharmacyDept}`,
      "GET",
    );
    const list = res.success
      ? Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : []
      : [];
    setPackages(list.filter((p) => p.is_active !== false));
  };

  const handleOpenPackageList = () => {
    setIsPackageModalOpen(true);
    setPackageSearch("");
    fetchPackages();
  };

  const filteredPackages = useMemo(() => {
    if (!packageSearch.trim()) return packages;
    const q = packageSearch.toLowerCase().trim();
    return packages.filter(
      (p) =>
        (p.medPackage_name || "").toLowerCase().includes(q) ||
        String(p.medPackage_id || "").toLowerCase().includes(q),
    );
  }, [packages, packageSearch]);


  const handleSelectPackage = (pkg) => {
    if (
      selectedMedicines.length > 0 &&
      !window.confirm(
        "This will replace the items already selected with the package items. Continue?",
      )
    )
      return;

    setIsPackageModalOpen(false);

    const items = (pkg.items || []).map((it) => ({
      item_id: it.item_id,
      itemName: it.item_name,
      qty: it.qty,
      price: 0, // price resolved at billing time
      dispatched_qty: null,
      dosage: "",
      noOfDays: "",
      remark: "",
    }));

    setSelectedMedicines(items);
    setSelectedPackageId(pkg.medPackage_id);
    setSelectedPackageName(pkg.medPackage_name);
    resetDrugFields();
  };

  const handleClearPackage = () => {
    if (
      selectedMedicines.length > 0 &&
      !window.confirm("Clear the package and all selected items?")
    )
      return;
    setSelectedPackageId(null);
    setSelectedPackageName("");
    setSelectedMedicines([]);
  };

  // ── Auto-calculate qty when BOTH dosage and days are entered (optional) ───
  useEffect(() => {
    if (dosage && noOfDays) {
      const times = dosage.includes("-")
        ? dosage.split("-").reduce((a, p) => a + (Number(p) || 0), 0)
        : Number(dosage) || 0;
      const days = Number(noOfDays) || 0;
      if (times > 0 && days > 0) setQty(times * days);
    }
  }, [dosage, noOfDays]);

  // ── Add medicine (works with or without a package selected) ───────────────
  const handleAddMedicine = () => {
    if (!selectedDrug) return alert("Select a drug from search.");
    if (!qty || Number(qty) <= 0) return alert("Enter Quantity.");

    const exists = selectedMedicines.some(
      (m) => String(m.item_id) === String(selectedDrug.item_id),
    );
    if (
      exists &&
      !window.confirm(
        `${selectedDrug.name} is already in the list. Add it again?`,
      )
    )
      return;

    const newMed = {
      item_id: selectedDrug.item_id,
      itemName: selectedDrug.name,
      qty: Number(qty),
      price: 0, // price resolved at billing time
      dispatched_qty: null,
      dosage, // optional
      noOfDays, // optional
      remark,
    };
    setSelectedMedicines((p) => [...p, newMed]);
    resetDrugFields();
  };

  const resetDrugFields = () => {
    setSelectedDrug(null);
    setQty("");
    setDosage("");
    setNoOfDays("");
    setRemark("");
    setSearchQuery("");
    setSearchResults([]);
  };

  const resetForm = () => {
    resetDrugFields();
    setEditMode(false);
    setEditingRequestId(null);
    setSelectedMedicines([]);
    setSelectedPackageId(null);
    setSelectedPackageName("");
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEditModal = (req) => {
    const match = doctors.find(
      (d) =>
        d.employeeId === req.doctor_id ||
        d.employeeName === (req.doctorName || req.doctor),
    );
    setDoctor(match ? match.employeeId : req.doctor_id || "");
    setDoctorName(
      match ? match.employeeName : req.doctorName || req.doctor || "",
    );

    const prefilled = (req.medicines || []).map((m) => ({
      item_id: m.item_id,
      itemName: m.itemName || m.name,
      qty: m.qty,
      price: m.price || 0,
      // keep whatever the backend already has (null when nothing dispatched)
      dispatched_qty: m.dispatched_qty ?? m.dispatchedQty ?? null,
      dosage: m.dosage || "",
      noOfDays: m.noOfDays || "",
      remark: m.remark || "",
    }));
    setSelectedMedicines(prefilled);

    if (req.Package_id || req.package_id) {
      setSelectedPackageId(req.Package_id || req.package_id);
      setSelectedPackageName(req.packageName || req.package_name || "");
    } else {
      setSelectedPackageId(null);
      setSelectedPackageName("");
    }

    setEditMode(true);
    setEditingRequestId(req.bill_id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarkReceived = async (req) => {
    if (!window.confirm("Mark this request as Received?")) return;
    const res = await apiRequest(
      `${HmsBaseUrl}mark_ot_medicine_received/`,
      "PUT",
      {
        bill_id: req.bill_id,
      },
    );
    if (res.success) {
      alert("Marked as received successfully");
      fetchRequests();
    } else alert(res.error || res.message || "Failed to mark as received");
  };

  const handleDelete = async (req) => {
    if (!window.confirm("Are you sure you want to delete this ward request?"))
      return;
    const res = await apiRequest(
      `${HmsBaseUrl}delete_ot_medicine_ward_request/`,
      "PUT",
      {
        bill_id: req.bill_id || req.Bill_id,
      },
    );
    if (res.success) {
      alert("Ward request deleted successfully");
      fetchRequests();
    } else alert(res.error || res.message || "Delete failed");
  };

  // ── Confirm / Update ───────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedMedicines.length) return alert("No medicines added.");

    // Normalised payload — dispatched_qty is always sent (null for new items)
    const medicine_particulars = selectedMedicines.map((m) => ({
      item_id: m.item_id,
      itemName: m.itemName,
      qty: Number(m.qty) || 0,
      price: Number(m.price) || 0,
      dispatched_qty: m.dispatched_qty ?? null,
      dosage: m.dosage || "",
      noOfDays: m.noOfDays || "",
      remark: m.remark || "",
    }));

    const total = medicine_particulars.reduce(
      (a, m) => a + m.price * m.qty,
      0,
    );

    if (editMode) {
      const payload = {
        bill_id: editingRequestId,
        medicine_particulars,
        total_amount: total,
        doctor_id: doctor,
        Package_id: selectedPackageId || "",
      };
      const res = await apiRequest(
        `${HmsBaseUrl}update_ot_medicine_ward_request/`,
        "PUT",
        payload,
      );
      if (res.success) {
        alert("Request updated successfully");
        resetForm();
        setShowForm(false);
        fetchRequests();
      } else alert(res.error || "Update failed");
    } else {
      const payload = {
        uhid: resolvedPatient.uhid,
        ipNumber: resolvedPatient.ipNo,
        patient_name: resolvedPatient.name,
        wardName: resolvedPatient.roomBed?.split("|")[0].trim() || "-",
        medicine_particulars,
        total_amount: total,
        doctor_id: doctor,
        surgeryRef: resolvedPatient.surgeryRef,
        Package_id: selectedPackageId || "",
      };
      const res = await apiRequest(
        `${HmsBaseUrl}save_ot_medicine_ward_request/`,
        "POST",
        payload,
      );
      if (res.success) {
        alert("Ward Request saved successfully");
        resetForm();
        setShowForm(false);
        fetchRequests();
      } else alert(res.error || "Save failed");
    }
  };

  // Removing an item no longer drops the package — the user can keep editing
  const removeSelectedMed = (i) => {
    setSelectedMedicines((p) => p.filter((_, idx) => idx !== i));
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return colors.legPending;
    if (status === "Processed") return colors.legProcessed;
    if (status === "Cancelled") return colors.legCancelled;
    if (status === "Billed") return colors.legBilled;
    return colors.legRegular;
  };

  // Dispatch badge colour — driven by the quantity-based status
  const getDispatchBadgeColor = (status) => {
    if (status === "Dispatched") return "#136A63";
    if (status === "Partially Dispatched") return "#0288D1";
    return "#F88C22";
  };

  const handleToggleForm = () => {
    if (showForm) {
      setShowForm(false);
      resetForm();
    } else {
      setEditMode(false);
      setShowForm(true);
    }
  };

  // How many bills still have pending (undispatched) quantity
  const pendingBillCount = useMemo(
    () =>
      requests.filter(
        (r) =>
          (r.billingStatus || "Pending") !== "Cancelled" &&
          (r.medicines || []).some((m) => getPendingQty(m) > 0),
      ).length,
    [requests],
  );

  // ─── JSX ───────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <TopBar>
        <BackBtn onClick={() => navigate(-1)}>← Back</BackBtn>
        <PageTitle>
          💊 OT Medicine Request
          {resolvedPatient.surgeryRef && (
            <SurgeryRefChip>🔗 {resolvedPatient.surgeryRef}</SurgeryRefChip>
          )}
          {resolvedPatient.is_emergency && (
            <EmergencyChip>⚡ EMERGENCY</EmergencyChip>
          )}
        </PageTitle>
      </TopBar>

      <div style={{ padding: "20px" }}>
        {/* Patient panel */}
        <PatientPanel>
          <PatientGrid>
            {[
              ["IP No", resolvedPatient.ipNo],
              ["UHID", resolvedPatient.uhid],
              ["Name", resolvedPatient.name],
              ["Age", resolvedPatient.age],
              ["Gender", resolvedPatient.gender],
              ["Admitting Dr", resolvedPatient.admittingDr],
              ["Room | Bed", resolvedPatient.roomBed],
              ["Customer Type", resolvedPatient.customerType],
              ["Company", resolvedPatient.companyName],
            ].map(([label, val]) => (
              <FieldBox key={label}>
                <FieldLabel>{label}</FieldLabel>
                <FieldValue>{val}</FieldValue>
              </FieldBox>
            ))}
          </PatientGrid>
        </PatientPanel>

        {/* Toggle form button */}
        <TopActionBar>
          <RequestBtn onClick={handleToggleForm}>
            {showForm
              ? "✕ Close Form"
              : editMode
                ? "✏️ Edit Medicine Request"
                : "＋ New Medicine Request"}
          </RequestBtn>
        </TopActionBar>

        {/* Form */}
        {showForm && (
          <>
            {editMode && (
              <EditModeBanner>
                ✏️ You are editing an existing request. Modify the medicines in
                the panel on the right, then click{" "}
                <strong>Update Request</strong> to save.
              </EditModeBanner>
            )}

            {selectedPackageId && (
              <PackageModeBanner>
                <span>
                  📦 Package selected: <strong>{selectedPackageName}</strong>{" "}
                  (ID: {selectedPackageId}). You can still search and add more
                  medicines, or remove items from the list.
                </span>
                <ClearPackageBtn onClick={handleClearPackage}>
                  ✕ Clear Package
                </ClearPackageBtn>
              </PackageModeBanner>
            )}

            <RequestFormWrapper>
              <FormPanel>
                <FormGrid>
                  {/* Bill type — read-only */}
                  <FormItem>
                    <FormLabel>Medicine Bill Type</FormLabel>
                    <StyledInput
                      value="IP Pharmacy (Credit)"
                      readOnly
                      style={{
                        background: "#f1f5f7",
                        color: colors.primary,
                        fontWeight: 700,
                      }}
                    />
                  </FormItem>

                  {/* Medicine Name — inline dropdown */}
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <FormLabel>
                      Medicine Name{" "}
                      {(editMode || selectedPackageId) && (
                        <span
                          style={{
                            color: colors.orange,
                            fontStyle: "italic",
                            fontWeight: 400,
                          }}
                        >
                          (search to add more medicines)
                        </span>
                      )}
                    </FormLabel>
                    <MedicineNameField
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedDrug={selectedDrug}
                      setSelectedDrug={setSelectedDrug}
                      onOpenPackageList={handleOpenPackageList}
                      disabled={false}
                      onSearch={handleMedicineSearch}
                      searchResults={searchResults}
                    />
                  </FormItem>

                  {/* Doctor */}
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <SearchableDropdown
                      value={doctor}
                      onChange={(val) => {
                        setDoctor(val);
                        const d = doctors.find((x) => x.employeeId === val);
                        if (d) setDoctorName(d.employeeName);
                      }}
                      options={doctors.map((d) => ({
                        id: d.employeeId,
                        name: d.employeeName,
                      }))}
                    />
                  </FormItem>

                  {/* Dosage (optional) */}
                  <FormItem>
                    <FormLabel>Dosage (optional)</FormLabel>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <StyledSelect
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="">Select Dosage</option>
                        <option value="1-0-0">1-0-0 (Morning)</option>
                        <option value="0-1-0">0-1-0 (Noon)</option>
                        <option value="0-0-1">0-0-1 (Night)</option>
                        <option value="1-0-1">1-0-1 (Morn-Night)</option>
                        <option value="1-1-1">1-1-1 (Thrice)</option>
                        {dosageOptions.map((o, i) => (
                          <option key={i} value={o.dosage_name}>
                            {o.dosage_name}
                          </option>
                        ))}
                      </StyledSelect>
                      <button
                        type="button"
                        title="Add new dosage"
                        onClick={() => setShowDosageModal(true)}
                        style={{
                          background: colors.primary,
                          color: "white",
                          width: "38px",
                          height: "38px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </FormItem>

                  {/* No. of Days (optional) */}
                  <FormItem>
                    <FormLabel>No. of Days (optional)</FormLabel>
                    <StyledInput
                      type="number"
                      min="1"
                      value={noOfDays}
                      onChange={(e) => setNoOfDays(e.target.value)}
                    />
                  </FormItem>

                  {/* Quantity — the only mandatory per-item entry */}
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <StyledInput
                      type="number"
                      min="1"
                      value={qty}
                      placeholder="Enter quantity"
                      onChange={(e) => setQty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMedicine();
                        }
                      }}
                    />
                  </FormItem>

                  {/* Remark (optional) */}
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <FormLabel>Remark (optional)</FormLabel>
                    <StyledInput
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMedicine();
                        }
                      }}
                    />
                  </FormItem>
                </FormGrid>

                <ActionButtons>
                  <CancelBtn onClick={resetDrugFields}>✕ Reset</CancelBtn>
                  <AddBtn onClick={handleAddMedicine}>＋ Add Medicine</AddBtn>
                </ActionButtons>
              </FormPanel>

              {/* Side panel */}
              <SidePanel>
                <SidePanelHeader>
                  {selectedPackageId
                    ? "📦 Package Items"
                    : editMode
                      ? "✏️ Editing Medicines"
                      : "Selected Items"}{" "}
                  ({selectedMedicines.length})
                </SidePanelHeader>
                <SidePanelContent>
                  {packageLoading ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: colors.textMuted,
                        marginTop: "40px",
                        fontSize: "0.85rem",
                      }}
                    >
                      Loading package items...
                    </div>
                  ) : selectedMedicines.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: colors.textMuted,
                        marginTop: "40px",
                        fontSize: "0.85rem",
                      }}
                    >
                      {editMode
                        ? "All medicines removed. Add new ones using the form."
                        : "No medicines added yet."}
                    </div>
                  ) : (
                    selectedMedicines.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "12px 0",
                          borderBottom: "1px solid #F0F0F0",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            color: colors.primary,
                            paddingRight: "24px",
                          }}
                        >
                          {m.itemName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: colors.textMuted,
                            marginTop: "4px",
                          }}
                        >
                          {m.dosage ? `${m.dosage} | ` : ""}
                          {m.noOfDays ? `${m.noOfDays} Days | ` : ""}
                          Qty: {m.qty}
                        </div>
                        {m.remark && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: colors.orange,
                              marginTop: "2px",
                              fontStyle: "italic",
                            }}
                          >
                            Remark: {m.remark}
                          </div>
                        )}
                        <button
                          onClick={() => removeSelectedMed(i)}
                          style={{
                            position: "absolute",
                            right: "0",
                            top: "12px",
                            background: "none",
                            border: "none",
                            color: "#e53935",
                            cursor: "pointer",
                            fontSize: "1rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </SidePanelContent>
                <SidePanelFooter>
                  <AddBtn
                    style={{ width: "100%", padding: "12px" }}
                    onClick={handleConfirm}
                  >
                    {editMode ? "💾 Update Request" : "✅ Confirm Request"}
                  </AddBtn>
                </SidePanelFooter>
              </SidePanel>
            </RequestFormWrapper>
          </>
        )}

        {/* Request History */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "30px 0 15px 0",
            borderBottom: `2px solid ${colors.border}`,
            paddingBottom: "4px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <TabsBar style={{ margin: 0, borderBottom: "none" }}>
            <Tab active={true}>📋 Request History ({requests.length})</Tab>
          </TabsBar>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Pending Print */}
            <button
              type="button"
              disabled={pendingBillCount === 0}
              onClick={() => setPendingPrintOpen(true)}
              style={{
                background: pendingBillCount === 0 ? "#cbd5e1" : colors.orange,
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "7px 16px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: pendingBillCount === 0 ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow:
                  pendingBillCount === 0
                    ? "none"
                    : "0 2px 6px rgba(248, 140, 34, 0.3)",
                transition: "all 0.15s",
              }}
              title="Print bill-wise pending items list"
            >
              <ClipboardList size={15} /> Pending Print
              {pendingBillCount > 0 && (
                <span
                  style={{
                    background: "rgba(255,255,255,0.3)",
                    borderRadius: "10px",
                    padding: "0 7px",
                    fontSize: "0.75rem",
                  }}
                >
                  {pendingBillCount}
                </span>
              )}
            </button>

            {/* Overall Print */}
            <button
              type="button"
              disabled={requests.length === 0}
              onClick={() => setOverallPrintOpen(true)}
              style={{
                background: requests.length === 0 ? "#cbd5e1" : colors.primary,
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "7px 16px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: requests.length === 0 ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow:
                  requests.length === 0
                    ? "none"
                    : "0 2px 6px rgba(19, 106, 99, 0.25)",
                transition: "all 0.15s",
              }}
              title="Print consolidated statement of all medicine requests"
            >
              <Printer size={15} /> Overall Print
            </button>
          </div>
        </div>

        <StyledTable>
          <thead>
            <tr>
              <th>Req Date & Time</th>
              <th>Medicine Details</th>
              <th>Raised From</th>
              <th>Doctor</th>
              <th>Bill Name</th>
              <th>Dispatch Status</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: colors.textMuted,
                  }}
                >
                  No request history found.
                </td>
              </tr>
            ) : (
              requests.map((req, i) => {
                // Quantity-based dispatch status (Dispatched / Partially Dispatched / Pending)
                const dispatchStatus = getRequestDispatchStatus(req);
                return (
                  <tr key={i}>
                    <td>
                      {req.reqDate} {req.reqTime}
                    </td>
                    <td>
                      <button
                        title="View medicine details"
                        onClick={() => setViewingRequest(req)}
                        style={{
                          background: "none",
                          border: "none",
                          color: colors.primary,
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                    <td>{req.wardName || ""}</td>
                    <td>{req.doctorName || req.doctor}</td>
                    <td>{req.billName}</td>
                    <td>
                      <LegendItem color={getDispatchBadgeColor(dispatchStatus)}>
                        {dispatchStatus}
                      </LegendItem>
                    </td>
                    <td>
                      <LegendItem
                        color={getStatusColor(req.billingStatus || "Pending")}
                      >
                        {req.billingStatus || "Pending"}
                      </LegendItem>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          title="Print requisition slip"
                          onClick={() => setPrintSingleRequest(req)}
                          style={{
                            background: "#f0fdfa",
                            color: colors.primary,
                            border: `1px solid ${colors.primary}`,
                            borderRadius: "5px",
                            padding: "5px 10px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.15s",
                          }}
                        >
                          <Printer size={13} /> Print
                        </button>

                        <button
                          disabled={
                            (req.billingStatus || "Pending") !== "Pending"
                          }
                          onClick={() => openEditModal(req)}
                          style={{
                            background:
                              (req.billingStatus || "Pending") === "Pending"
                                ? colors.primary
                                : "#cbd5e1",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            padding: "5px 12px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor:
                              (req.billingStatus || "Pending") === "Pending"
                                ? "pointer"
                                : "not-allowed",
                            opacity:
                              (req.billingStatus || "Pending") === "Pending"
                                ? 1
                                : 0.5,
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          disabled={
                            (req.billingStatus || "Pending") !== "Pending"
                          }
                          onClick={() => handleDelete(req)}
                          style={{
                            background:
                              (req.billingStatus || "Pending") === "Pending"
                                ? "#e53935"
                                : "#cbd5e1",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            padding: "5px 12px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor:
                              (req.billingStatus || "Pending") === "Pending"
                                ? "pointer"
                                : "not-allowed",
                            opacity:
                              (req.billingStatus || "Pending") === "Pending"
                                ? 1
                                : 0.5,
                          }}
                        >
                          🗑️ Delete
                        </button>

                        {req.is_dispatched && !req.is_received && (
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              color: colors.primary,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleMarkReceived(req)}
                              style={{
                                cursor: "pointer",
                                accentColor: colors.primary,
                              }}
                            />
                            Received
                          </label>
                        )}

                        {req.is_dispatched && req.is_received && (
                          <span
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              color: colors.legBilled,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            ✅ Received
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </StyledTable>

        <LegendContainer>
          <LegendItem color={colors.legPending}>Pending</LegendItem>
          <LegendItem color="#0288D1">Partially Dispatched</LegendItem>
          <LegendItem color={colors.legSubstituted}>Substituted</LegendItem>
          <LegendItem color={colors.legBilled}>Billed</LegendItem>
          <LegendItem color={colors.legCancelled}>Cancelled</LegendItem>
          <LegendItem color={colors.legStopped}>Stopped</LegendItem>
          <LegendItem color={colors.legEmergency}>Emergency</LegendItem>
          <LegendItem color={colors.legInsurance}>Insurance Item</LegendItem>
          <LegendItem color={colors.legDischarge}>Discharge Med</LegendItem>
          <LegendItem color={colors.legRegular}>Regular Med</LegendItem>
          <LegendItem color={colors.legProcessed}>Processed</LegendItem>
        </LegendContainer>
      </div>

      {/* Package Selection Modal */}
      {isPackageModalOpen && (
        <ModalOverlay
          style={{ zIndex: 2000 }}
          onClick={() => setIsPackageModalOpen(false)}
        >
          <ModalContainer
            style={{
              width: "75%",
              height: "82%",
              maxWidth: "850px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header
              style={{
                background: "linear-gradient(135deg, #136A63 0%, #0d504b 100%)",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <HeaderTitle
                  style={{
                    fontSize: "1.05rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  <PackageIcon size={20} />
                  Select OT Medicine Package ({pharmacyDept})
                </HeaderTitle>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.82)",
                    marginTop: "3px",
                  }}
                >
                  Pre-configured surgery kits with standard drug quantities
                  &amp; live prices
                </div>
              </div>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                }}
              >
                ×
              </button>
            </Header>

            {/* Search Bar & Stats */}
            <div
              style={{
                padding: "12px 24px",
                background: "#f8fafc",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: "12px",
                    color: colors.textMuted,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search packages by kit name or ID..."
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.border}`,
                    fontSize: "0.86rem",
                    outline: "none",
                  }}
                  autoFocus
                />
                {packageSearch && (
                  <button
                    onClick={() => setPackageSearch("")}
                    style={{
                      position: "absolute",
                      right: "10px",
                      background: "none",
                      border: "none",
                      color: colors.textMuted,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: colors.textMuted,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {filteredPackages.length} package
                {filteredPackages.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Package Cards List */}
            <ContentBody
              style={{
                padding: "18px 24px",
                overflowY: "auto",
                flex: 1,
                background: "#f1f5f9",
              }}
            >
              {packageLoading ? (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: colors.primary,
                    fontWeight: 600,
                  }}
                >
                  ⏳ Loading package items &amp; calculating pharmacy stock
                  prices...
                </div>
              ) : filteredPackages.length > 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  {filteredPackages.map((pkg) => {
                    const isSelected =
                      String(selectedPackageId) === String(pkg.medPackage_id);
                    const items = pkg.items || [];
                    return (
                      <div
                        key={pkg.medPackage_id}
                        style={{
                          background: "#ffffff",
                          border: isSelected
                            ? `2px solid ${colors.primary}`
                            : "1px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "16px 20px",
                          boxShadow: isSelected
                            ? "0 4px 14px rgba(19, 106, 99, 0.16)"
                            : "0 2px 4px rgba(0,0,0,0.03)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "18px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.98rem",
                                fontWeight: 700,
                                color: colors.primary,
                              }}
                            >
                              {pkg.medPackage_name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                background: "#f1f5f9",
                                color: "#475569",
                                padding: "2px 8px",
                                borderRadius: "10px",
                              }}
                            >
                              #{pkg.medPackage_id}
                            </span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                background: "#e0f2fe",
                                color: "#0369a1",
                                padding: "2px 8px",
                                borderRadius: "10px",
                              }}
                            >
                              {items.length} item{items.length !== 1 ? "s" : ""}
                            </span>
                            {isSelected && (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  background: "#dcfce7",
                                  color: "#15803d",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                }}
                              >
                                ✓ Active Selection
                              </span>
                            )}
                          </div>

                          {items.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                                marginTop: "8px",
                              }}
                            >
                              {items.slice(0, 8).map((it, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: "0.73rem",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    color: "#334155",
                                    borderRadius: "5px",
                                    padding: "2px 8px",
                                  }}
                                >
                                  {it.item_name}{" "}
                                  <strong style={{ color: colors.primary }}>
                                    ×{it.qty}
                                  </strong>
                                </span>
                              ))}
                              {items.length > 8 && (
                                <span
                                  style={{
                                    fontSize: "0.73rem",
                                    color: colors.textMuted,
                                    padding: "2px 6px",
                                    fontWeight: 600,
                                  }}
                                >
                                  +{items.length - 8} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: colors.textMuted,
                                fontStyle: "italic",
                              }}
                            >
                              No items in this package kit
                            </div>
                          )}
                        </div>

                        <div>
                          {isSelected ? (
                            <button
                              type="button"
                              onClick={() => {
                                handleClearPackage();
                                setIsPackageModalOpen(false);
                              }}
                              style={{
                                background: "#fee2e2",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                                borderRadius: "6px",
                                padding: "8px 16px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ✕ Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectPackage(pkg)}
                              style={{
                                background: colors.primary,
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 18px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 2px 4px rgba(19,106,99,0.2)",
                                transition: "all 0.15s ease",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ✓ Select Package
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: colors.textMuted,
                  }}
                >
                  {packageSearch
                    ? `No packages match "${packageSearch}".`
                    : `No medicine packages found for outlet ${pharmacyDept}.`}
                </div>
              )}
            </ContentBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* View Medicines Modal */}
      {viewingRequest && (
        <ViewMedicinesModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
          onPrint={(req) => setPrintSingleRequest(req)}
        />
      )}

      {/* Overall Consolidated Print Modal */}
      {overallPrintOpen && (
        <OTPrintModal
          title={`OT Medicine Requisition Statement - ${resolvedPatient.ipNo || "IP"}`}
          htmlGenerator={generateMedicineOverallPrintHtml}
          data={{
            patient: resolvedPatient,
            requests: requests,
          }}
          onClose={() => setOverallPrintOpen(false)}
        />
      )}

      {/* Pending Items (Bill-wise) Print Modal */}
      {pendingPrintOpen && (
        <OTPrintModal
          title={`OT Medicine Pending List - ${resolvedPatient.ipNo || "IP"}`}
          htmlGenerator={generateMedicinePendingPrintHtml}
          data={{
            patient: resolvedPatient,
            requests: requests,
          }}
          onClose={() => setPendingPrintOpen(false)}
        />
      )}

      {/* Single Request Slip Print Modal */}
      {printSingleRequest && (
        <OTPrintModal
          title={`OT Medicine Requisition Slip - ${printSingleRequest.bill_id || printSingleRequest.Bill_id || "Req"}`}
          htmlGenerator={generateMedicineSingleSlipHtml}
          data={{
            patient: resolvedPatient,
            request: printSingleRequest,
          }}
          onClose={() => setPrintSingleRequest(null)}
        />
      )}
      {/* Add Dosage Modal */}
      {showDosageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2200,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0 }}>Add New Dosage</h3>
              <X
                size={20}
                style={{ cursor: "pointer" }}
                onClick={() => setShowDosageModal(false)}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Dosage Name (e.g. 1-1-1)
              </label>
              <input
                value={newDosageName}
                onChange={(e) => setNewDosageName(e.target.value)}
                placeholder="Enter dosage..."
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowDosageModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDosage}
                style={{
                  background: colors.primary,
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Dosage
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default OTMedicineBilling;