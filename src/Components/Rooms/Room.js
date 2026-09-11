import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  PageWrapper,
  InputWrapper,
  Label,
  Input,
  Button,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  Select,
  colors,
} from "../GlobalStyles";
import styled, { keyframes } from "styled-components";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Sparkles,
  Package as PackageIcon,
  Check,
  RotateCcw,
} from "lucide-react";

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { max-height: 0; opacity: 0; }
  to { max-height: 2400px; opacity: 1; }
`;

// ─── Header & Drawer Styled Components ─────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px 10px 0 0;
  color: #fff;
  flex-wrap: wrap;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
`;

const PageTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageSubtitle = styled.p`
  margin: 3px 0 0;
  font-size: 0.8rem;
  color: #ccfbf1;
  font-weight: 400;
`;

const HeaderBtn = styled(Button)`
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const Drawer = styled.div`
  background: #ffffff;
  border-bottom: 2px solid #0d9488;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  display: ${(p) => (p.open ? "block" : "none")};
  animation: ${slideDown} 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #f0fdf4;
  border-bottom: 1px solid #d1fae5;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f766e;
`;

const DrawerBody = styled.div`
  padding: 22px 24px;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100px);
`;

const DrawerLayout = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 22px;
  align-items: flex-start;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FormSection = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
`;

const SectionLabel = styled.div`
  font-size: 0.78rem;
  font-weight: 800;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 14px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
`;

const TabButton = styled.button`
  padding: 10px 18px;
  background: ${(p) => (p.active ? "#fff" : "transparent")};
  border: 1px solid ${(p) => (p.active ? "#e2e8f0" : "transparent")};
  border-bottom: ${(p) => (p.active ? "2px solid #fff" : "none")};
  margin-bottom: ${(p) => (p.active ? "-2px" : "0")};
  cursor: pointer;
  font-weight: ${(p) => (p.active ? "700" : "600")};
  color: ${(p) => (p.active ? "#0d9488" : "#64748b")};
  font-size: 0.82rem;
  outline: none;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 6px 6px 0 0;
  &:hover {
    color: #0d9488;
    background: #fff;
  }
`;

const TabPanel = styled.div`
  border: 1px solid #e2e8f0;
  border-top: none;
  padding: 16px;
  background: #fff;
  border-radius: 0 0 10px 10px;
  min-height: 280px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
`;

const ToggleSwitch = styled.button`
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: ${(p) => (p.on ? "#ef4444" : "#cbd5e1")};
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(p) => (p.on ? "18px" : "2px")};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  }
`;

// ─── Filter & Search Bar ───────────────────────────────────────────────────────
const FilterContainer = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.1fr 1.1fr 1.1fr auto;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 36px;
  padding: 0 12px 0 36px;
  font-size: 0.82rem;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #f8fafc;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    background: #fff;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }
  &::placeholder { color: #94a3b8; }
`;

const SearchIconWrap = styled.span`
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const FilterSelect = styled.select`
  width: 100%;
  height: 36px;
  padding: 0 10px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #f8fafc;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &:focus {
    background: #ffffff;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }
`;

const ClearFilterBtn = styled.button`
  height: 36px;
  padding: 0 12px;
  font-size: 0.76rem;
  font-weight: 700;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #b91c1c;
  }
`;

const CountBadge = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: #0f766e;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const ResponsiveTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: #ffffff;
  &::-webkit-scrollbar {
    height: 6px;
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

const StyledTable = styled(Table)`
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
`;

// ─── Status & Icon Action Buttons ──────────────────────────────────────────────
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${(p) =>
    p.status === "Available"
      ? "#ecfdf5"
      : p.status === "Blocked"
      ? "#fef2f2"
      : p.status === "Maintenance"
      ? "#fffbeb"
      : "#f8fafc"};
  color: ${(p) =>
    p.status === "Available"
      ? "#059669"
      : p.status === "Blocked"
      ? "#dc2626"
      : p.status === "Maintenance"
      ? "#d97706"
      : "#64748b"};
  border: 1px solid
    ${(p) =>
      p.status === "Available"
        ? "#a7f3d0"
        : p.status === "Blocked"
        ? "#fecaca"
        : p.status === "Maintenance"
        ? "#fde68a"
        : "#e2e8f0"};

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) =>
      p.status === "Available"
        ? "#10b981"
        : p.status === "Blocked"
        ? "#ef4444"
        : p.status === "Maintenance"
        ? "#f59e0b"
        : "#94a3b8"};
  }
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(p) => (p.danger ? "#fecaca" : "#ccfbf1")};
  background: ${(p) => (p.danger ? "#fff1f2" : "#f0fdfa")};
  color: ${(p) => (p.danger ? "#e11d48" : "#0d9488")};
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  &:hover {
    background: ${(p) => (p.danger ? "#ffe4e6" : "#ccfbf1")};
    color: ${(p) => (p.danger ? "#be123c" : "#0f766e")};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MiniIconButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(p) => (p.danger ? "#fecaca" : "#ccfbf1")};
  background: ${(p) => (p.danger ? "#fff1f2" : "#f0fdfa")};
  color: ${(p) => (p.danger ? "#e11d48" : "#0d9488")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(p) => (p.danger ? "#ffe4e6" : "#ccfbf1")};
    color: ${(p) => (p.danger ? "#be123c" : "#0f766e")};
  }
`;

const AnimatedTr = styled(Tr)`
  animation: ${fadeIn} 0.25s ease both;
  &:hover {
    background: #f8fafc;
  }
`;

// ─── Pagination ────────────────────────────────────────────────────────────────
const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.8rem;
  color: #64748b;
  flex-wrap: wrap;
  gap: 8px;
  background: #fff;
  border-radius: 0 0 10px 10px;
`;

const PageBtn = styled.button`
  height: 32px;
  min-width: 32px;
  padding: 0 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid ${(p) => (p.active ? "#0d9488" : "#e2e8f0")};
  border-radius: 6px;
  background: ${(p) => (p.active ? "#0d9488" : "#fff")};
  color: ${(p) => (p.active ? "#fff" : "#334155")};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: ${(p) => (p.active ? "#0f766e" : "#f1f5f9")};
  }
`;

const MiniPager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 0.74rem;
  color: #64748b;
  border-radius: 0 0 6px 6px;
`;

const MiniPageBtn = styled.button`
  height: 24px;
  width: 24px;
  padding: 0;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  color: #334155;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: #e2e8f0;
  }
`;

// ─── Searchable Dropdown ──────────────────────────────────────────────────────
const DropWrapper = styled.div`
  position: relative;
`;

const DropBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: #fff;
  height: 34px;
  overflow: hidden;
  &:focus-within {
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.12);
  }
`;

const DropList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 180px;
  overflow-y: auto;
  z-index: 999;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
`;

const DropItem = styled.div`
  padding: 7px 10px;
  cursor: pointer;
  font-size: 0.82rem;
  background: ${(p) => (p.selected ? "#f0fdf4" : "#fff")};
  color: ${(p) => (p.selected ? "#0d9488" : "#1e293b")};
  border-bottom: 1px solid #f3f4f6;
  &:hover {
    background: #f0fdf4;
  }
`;

const SearchableDropdown = ({
  apiEndpoint,
  value,
  onChange,
  placeholder = "Search...",
  labelField = "description",
  valueField = "id",
}) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayLabel, setDisplayLabel] = useState("");
  const wrapRef = useRef(null);
  const debRef = useRef(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!value) {
      setDisplayLabel("");
      setQuery("");
      return;
    }
    const cached = options.find((o) => String(o[valueField]) === String(value));
    if (cached) {
      setDisplayLabel(cached[labelField]);
      return;
    }
    apiRequest(`${HmsBaseUrl}${apiEndpoint}`, "GET")
      .then((res) => {
        const all = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.results)
          ? res.results
          : [];
        const found = all.find((o) => String(o[valueField]) === String(value));
        if (found) setDisplayLabel(found[labelField]);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const fetchOptions = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `${HmsBaseUrl}${apiEndpoint}?search=${encodeURIComponent(search)}`
        : `${HmsBaseUrl}${apiEndpoint}`;
      const res = await apiRequest(url, "GET");
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.results)
        ? res.results
        : [];
      setOptions(list.filter((o) => o.is_active !== false));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropWrapper ref={wrapRef}>
      <DropBox>
        <input
          type="text"
          value={open ? query : displayLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            clearTimeout(debRef.current);
            debRef.current = setTimeout(() => fetchOptions(e.target.value), 300);
          }}
          onFocus={() => {
            setOpen(true);
            if (!options.length) fetchOptions("");
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: "0 9px",
            border: "none",
            outline: "none",
            fontSize: "0.82rem",
            minWidth: 0,
            background: "transparent",
            height: "100%",
          }}
        />
        <span
          onClick={() => {
            setOpen((p) => !p);
            if (!open) fetchOptions(query);
          }}
          style={{
            padding: "0 8px",
            cursor: "pointer",
            color: "#64748b",
            fontSize: "0.65rem",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          ▼
        </span>
        {(displayLabel || value) && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setDisplayLabel("");
              setQuery("");
              setOpen(false);
              onChange("");
            }}
            style={{
              padding: "0 7px",
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: "0.82rem",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            ✕
          </span>
        )}
      </DropBox>
      {open && (
        <DropList>
          {loading ? (
            <DropItem style={{ color: "#9ca3af", cursor: "default" }}>Loading…</DropItem>
          ) : options.length === 0 ? (
            <DropItem style={{ color: "#9ca3af", cursor: "default" }}>No results</DropItem>
          ) : (
            options.map((opt, i) => (
              <DropItem
                key={opt[valueField] ?? i}
                selected={String(opt[valueField]) === String(value)}
                onMouseDown={() => {
                  setDisplayLabel(opt[labelField]);
                  setQuery("");
                  setOpen(false);
                  onChange(opt[valueField]);
                }}
              >
                {opt[labelField]}
              </DropItem>
            ))
          )}
        </DropList>
      )}
    </DropWrapper>
  );
};

// ─── Bed helpers ──────────────────────────────────────────────────────────────
const makeBed = (index) => ({ bed_number: String(index + 1), blocked: false, blocked_reason: "" });

const generateBeds = (capacity, existingBeds = []) => {
  const count = parseInt(capacity, 10);
  if (!count || count < 1) return [];
  return Array.from({ length: count }, (_, i) =>
    existingBeds[i] ? { ...existingBeds[i] } : makeBed(i)
  );
};

// ─── Main Room Component ──────────────────────────────────────────────────────
const Room = () => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nursingStations, setNursingStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // UI state
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("services");
  const [editingId, setEditingId] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStation, setSelectedStation] = useState("ALL");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Sub-tabs Pagination (5 per page)
  const SUB_PAGE_SIZE = 5;
  const [servicesPage, setServicesPage] = useState(1);
  const [bedsPage, setBedsPage] = useState(1);
  const [kitsPage, setKitsPage] = useState(1);

  const defaultRoomForm = {
    room_number: "",
    description: "",
    room_category: "",
    block: "",
    phone_extension: "",
    nursing_station: "",
    capacity: "1",
    room_status: "Available",
  };
  const [roomForm, setRoomForm] = useState(defaultRoomForm);

  // Services
  const defaultService = { description: "", priority: "", amount: "" };
  const [serviceForm, setServiceForm] = useState(defaultService);
  const [roomServices, setRoomServices] = useState([]);
  const [editingServiceIdx, setEditingServiceIdx] = useState(null);

  // Beds
  const [roomBeds, setRoomBeds] = useState([makeBed(0)]);

  // Kits
  const defaultKit = { kit_item: "", priority: "", amount: "" };
  const [kitForm, setKitForm] = useState(defaultKit);
  const [roomKits, setRoomKits] = useState([]);
  const [editingKitIdx, setEditingKitIdx] = useState(null);

  useEffect(() => {
    fetchRooms();
    fetchBlocks();
    fetchCategories();
    fetchNursingStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}room/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setRooms(list.filter((r) => r.is_active !== false));
    } catch {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}block/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setBlocks(list.filter((b) => b.is_active !== false));
    } catch {
      toast.error("Failed to fetch blocks");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setCategories(list.filter((c) => c.is_active !== false));
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchNursingStations = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}nursingstation/`, "GET");
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.results)
        ? res.results
        : [];
      setNursingStations(list.filter((n) => n.is_active !== false));
    } catch {
      /* optional */
    }
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    if (name === "capacity") {
      const clamped = Math.max(1, parseInt(value, 10) || 1);
      setRoomBeds(generateBeds(clamped, roomBeds));
      setRoomForm((p) => ({ ...p, [name]: String(clamped) }));
      return;
    }
    setRoomForm((p) => ({ ...p, [name]: value }));
  };

  const handleReset = () => {
    setEditingId(null);
    setRoomForm(defaultRoomForm);
    setRoomServices([]);
    setRoomBeds([makeBed(0)]);
    setRoomKits([]);
    setActiveTab("services");
    setServicesPage(1);
    setBedsPage(1);
    setKitsPage(1);
    setShowDrawer(false);
  };

  const handleEdit = (room) => {
    setEditingId(room.room_number);
    setRoomForm({
      room_number: room.room_number || "",
      description: room.description || "",
      room_category: room.room_category || "",
      block: room.block || "",
      phone_extension: room.phone_extension || "",
      nursing_station: room.nursing_station || "",
      capacity: String(room.capacity || 1),
      room_status: room.room_status || "Available",
    });
    const existing = (Array.isArray(room.beds) ? room.beds : []).map((b) => ({
      bed_number: b.bed_number || "",
      blocked: b.blocked || false,
      blocked_reason: b.blocked_reason || "",
    }));
    setRoomBeds(generateBeds(parseInt(room.capacity || 1, 10), existing));
    setRoomServices(Array.isArray(room.services) ? room.services : []);
    setRoomKits(Array.isArray(room.room_kits) ? room.room_kits : []);
    setServicesPage(1);
    setBedsPage(1);
    setKitsPage(1);
    setShowDrawer(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete room "${id}"?`)) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}room/${id}/`, "DELETE");
      if (res && !res.error) {
        toast.success("Room deleted successfully");
        fetchRooms();
      } else {
        toast.error(res?.error || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete room");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.room_number.trim()) return toast.warning("Room number is required");
    if (!roomForm.block) return toast.warning("Please select a block");
    if (!roomForm.room_category) return toast.warning("Please select a room category");

    setSaving(true);
    const bedsPayload = roomBeds.map((b) => ({
      ...b,
      bed_status: b.blocked ? "Blocked" : "Available",
    }));
    const occupancy = bedsPayload.filter((b) => b.bed_status === "Available").length;
    const payload = {
      ...roomForm,
      occupancy,
      services: roomServices,
      beds: bedsPayload,
      room_kits: roomKits,
    };

    try {
      if (editingId) {
        const res = await apiRequest(`${HmsBaseUrl}room/${editingId}/`, "PUT", payload);
        if (res && !res.error) {
          toast.success("Room updated successfully");
          handleReset();
          fetchRooms();
        } else {
          toast.error(res?.error || "Update failed");
        }
      } else {
        const res = await apiRequest(`${HmsBaseUrl}room/`, "POST", payload);
        if (res && !res.error) {
          toast.success("Room added successfully");
          handleReset();
          fetchRooms();
        } else {
          toast.error(res?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save room");
    } finally {
      setSaving(false);
    }
  };

  // Services actions
  const addService = () => {
    if (!serviceForm.description) return toast.warning("Please select a service");
    if (!serviceForm.amount) return toast.warning("Please enter amount");
    if (editingServiceIdx !== null) {
      const u = [...roomServices];
      u[editingServiceIdx] = { ...serviceForm };
      setRoomServices(u);
      setEditingServiceIdx(null);
      toast.success("Service updated");
    } else {
      setRoomServices([...roomServices, { ...serviceForm }]);
      toast.success("Service added");
    }
    setServiceForm(defaultService);
  };
  const editService = (i) => {
    setServiceForm({ ...roomServices[i] });
    setEditingServiceIdx(i);
  };
  const removeService = (i) => {
    setRoomServices(roomServices.filter((_, idx) => idx !== i));
    if (editingServiceIdx === i) {
      setEditingServiceIdx(null);
      setServiceForm(defaultService);
    }
  };

  // Beds actions
  const updateBed = (idx, field, val) => {
    setRoomBeds((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      if (field === "blocked" && !val) updated[idx].blocked_reason = "";
      return updated;
    });
  };
  const removeBed = (idx) => {
    setRoomBeds((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      const newCap = Math.max(1, updated.length);
      setRoomForm((f) => ({ ...f, capacity: String(newCap) }));
      return updated.length ? updated : [makeBed(0)];
    });
  };

  // Kits actions
  const addKit = () => {
    if (!kitForm.kit_item) return toast.warning("Please select kit item");
    if (editingKitIdx !== null) {
      const u = [...roomKits];
      u[editingKitIdx] = { ...kitForm };
      setRoomKits(u);
      setEditingKitIdx(null);
      toast.success("Kit item updated");
    } else {
      setRoomKits([...roomKits, { ...kitForm }]);
      toast.success("Kit item added");
    }
    setKitForm(defaultKit);
  };
  const editKit = (i) => {
    setKitForm({ ...roomKits[i] });
    setEditingKitIdx(i);
  };
  const removeKit = (i) => {
    setRoomKits(roomKits.filter((_, idx) => idx !== i));
    if (editingKitIdx === i) {
      setEditingKitIdx(null);
      setKitForm(defaultKit);
    }
  };

  // Filter options derived from rooms & masters
  const filterOptions = useMemo(() => {
    const blks = new Set();
    const cats = new Set();
    const stns = new Set();
    rooms.forEach((r) => {
      if (r.block) blks.add(r.block);
      if (r.room_category) cats.add(r.room_category);
      if (r.nursing_station) stns.add(r.nursing_station);
    });
    blocks.forEach((b) => b.block_name && blks.add(b.block_name));
    categories.forEach((c) => c.name && cats.add(c.name));
    nursingStations.forEach((n) => n.station_name && stns.add(n.station_name));

    return {
      blocks: Array.from(blks).sort(),
      categories: Array.from(cats).sort(),
      stations: Array.from(stns).sort(),
    };
  }, [rooms, blocks, categories, nursingStations]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedBlock("ALL");
    setSelectedCategory("ALL");
    setSelectedStation("ALL");
    setPage(1);
  };

  // Filtered & Paginated Rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const match =
          String(r.room_number || "").toLowerCase().includes(q) ||
          String(r.block || "").toLowerCase().includes(q) ||
          String(r.room_category || "").toLowerCase().includes(q) ||
          String(r.nursing_station || "").toLowerCase().includes(q) ||
          String(r.description || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedBlock && selectedBlock !== "ALL") {
        if (String(r.block || "").toLowerCase() !== selectedBlock.toLowerCase()) return false;
      }
      if (selectedCategory && selectedCategory !== "ALL") {
        if (String(r.room_category || "").toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }
      if (selectedStation && selectedStation !== "ALL") {
        if (String(r.nursing_station || "").toLowerCase() !== selectedStation.toLowerCase()) return false;
      }
      return true;
    });
  }, [rooms, searchTerm, selectedBlock, selectedCategory, selectedStation]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / perPage));
  const paginatedRooms = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRooms.slice(start, start + perPage);
  }, [filteredRooms, page, perPage]);

  // Sub-tabs Pagination calculations (5 items per page)
  const totalServicesPages = Math.max(1, Math.ceil(roomServices.length / SUB_PAGE_SIZE));
  const paginatedServices = useMemo(() => {
    const start = (servicesPage - 1) * SUB_PAGE_SIZE;
    return roomServices.slice(start, start + SUB_PAGE_SIZE);
  }, [roomServices, servicesPage]);

  const totalBedsPages = Math.max(1, Math.ceil(roomBeds.length / SUB_PAGE_SIZE));
  const paginatedBeds = useMemo(() => {
    const start = (bedsPage - 1) * SUB_PAGE_SIZE;
    return roomBeds.slice(start, start + SUB_PAGE_SIZE).map((bed, localIdx) => ({
      bed,
      globalIndex: start + localIdx,
    }));
  }, [roomBeds, bedsPage]);

  const totalKitsPages = Math.max(1, Math.ceil(roomKits.length / SUB_PAGE_SIZE));
  const paginatedKits = useMemo(() => {
    const start = (kitsPage - 1) * SUB_PAGE_SIZE;
    return roomKits.slice(start, start + SUB_PAGE_SIZE);
  }, [roomKits, kitsPage]);

  return (
    <PageWrapper>
      <Container style={{ padding: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" }}>
        {/* ── Top Header Banner ── */}
        <PageHeader>
          <div>
            <PageTitle>
              <BedDouble size={22} color="#ccfbf1" />
              Room Master
            </PageTitle>
            <PageSubtitle>Manage hospital rooms, categories, and bed configurations</PageSubtitle>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <HeaderBtn
              type="button"
              onClick={() => window.history.back()}
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              ← Back
            </HeaderBtn>
            <HeaderBtn
              type="button"
              onClick={() => {
                if (showDrawer) handleReset();
                else {
                  handleReset();
                  setShowDrawer(true);
                }
              }}
              style={{
                background: "#fff",
                color: "#0f766e",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              {showDrawer ? (
                <>
                  <X size={15} /> Close
                </>
              ) : (
                <>
                  <Plus size={15} /> Add Room
                </>
              )}
            </HeaderBtn>
          </div>
        </PageHeader>

        {/* ── Slide-Down Form Drawer ── */}
        <Drawer open={showDrawer}>
          <DrawerHeader>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {editingId ? (
                <>
                  <Pencil size={16} /> Edit Room — <strong style={{ color: "#0d9488" }}>{editingId}</strong>
                </>
              ) : (
                <>
                  <Plus size={16} /> New Hospital Room
                </>
              )}
            </span>
            <span style={{ color: "#64748b", fontWeight: 500, fontSize: "0.78rem" }}>
              Fields marked <span style={{ color: "#e11d48" }}>*</span> are required
            </span>
          </DrawerHeader>
          <DrawerBody>
            <form onSubmit={handleSubmit}>
              <DrawerLayout>
                {/* Left Column: Basic Information */}
                <FormSection>
                  <SectionLabel>
                    <BedDouble size={15} /> Room Information
                  </SectionLabel>
                  <FieldGrid>
                    <InputWrapper>
                      <Label req>Room Number *</Label>
                      <Input
                        name="room_number"
                        value={roomForm.room_number}
                        onChange={handleRoomChange}
                        placeholder="e.g. 101, SR-302"
                        required
                        disabled={!!editingId}
                        style={{ height: 34, fontSize: ".85rem" }}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label req>Block *</Label>
                      <Select
                        name="block"
                        value={roomForm.block}
                        onChange={handleRoomChange}
                        required
                        style={{ height: 34, fontSize: ".85rem" }}
                      >
                        <option value="">-- Select Block --</option>
                        {blocks.map((b) => (
                          <option key={b.id || b.block_name} value={b.block_name}>
                            {b.block_name}
                          </option>
                        ))}
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <Label req>Room Category *</Label>
                      <Select
                        name="room_category"
                        value={roomForm.room_category}
                        onChange={handleRoomChange}
                        required
                        style={{ height: 34, fontSize: ".85rem" }}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((c) => (
                          <option key={c.id || c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Nursing Station</Label>
                      <Select
                        name="nursing_station"
                        value={roomForm.nursing_station}
                        onChange={handleRoomChange}
                        style={{ height: 34, fontSize: ".85rem" }}
                      >
                        <option value="">-- Select Station --</option>
                        {nursingStations.map((n) => (
                          <option key={n.id || n.ward_name} value={n.ward_name}>
                            {n.ward_name}
                          </option>
                        ))}
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <Label req>Capacity (Beds) *</Label>
                      <Input
                        type="number"
                        name="capacity"
                        value={roomForm.capacity}
                        onChange={handleRoomChange}
                        min="1"
                        max="50"
                        required
                        style={{ height: 34, fontSize: ".85rem" }}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Room Status</Label>
                      <Select
                        name="room_status"
                        value={roomForm.room_status}
                        onChange={handleRoomChange}
                        style={{ height: 34, fontSize: ".85rem" }}
                      >
                        <option value="Available">Available</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Blocked">Blocked</option>
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <Label>Phone Extension</Label>
                      <Input
                        name="phone_extension"
                        value={roomForm.phone_extension}
                        onChange={handleRoomChange}
                        placeholder="e.g. 105"
                        style={{ height: 34, fontSize: ".85rem" }}
                      />
                    </InputWrapper>

                    <InputWrapper style={{ gridColumn: "span 2" }}>
                      <Label>Description / Notes</Label>
                      <Input
                        name="description"
                        value={roomForm.description}
                        onChange={handleRoomChange}
                        placeholder="e.g. Near nursing station"
                        style={{ height: 34, fontSize: ".85rem" }}
                      />
                    </InputWrapper>
                  </FieldGrid>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                      marginTop: 20,
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: 14,
                    }}
                  >
                    <Button
                      type="button"
                      secondary
                      onClick={handleReset}
                      style={{ height: 34, padding: "0 18px", fontSize: ".82rem" }}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      style={{
                        height: 34,
                        padding: "0 22px",
                        fontSize: ".82rem",
                        background: "#0d9488",
                        color: "#fff",
                      }}
                    >
                      {saving ? "Saving…" : editingId ? "Update Room" : "Save Room"}
                    </Button>
                  </div>
                </FormSection>

                {/* Right Column: Tabbed Subforms (Services, Beds, Kits) */}
                <div>
                  <TabContainer>
                    <TabButton
                      type="button"
                      active={activeTab === "services"}
                      onClick={() => setActiveTab("services")}
                    >
                      <Sparkles size={14} /> Services ({roomServices.length})
                    </TabButton>
                    <TabButton
                      type="button"
                      active={activeTab === "beds"}
                      onClick={() => setActiveTab("beds")}
                    >
                      <BedDouble size={14} /> Beds ({roomBeds.length})
                    </TabButton>
                    <TabButton
                      type="button"
                      active={activeTab === "kits"}
                      onClick={() => setActiveTab("kits")}
                    >
                      <PackageIcon size={14} /> Room Kits ({roomKits.length})
                    </TabButton>
                  </TabContainer>

                  {/* ── Services Tab ── */}
                  {activeTab === "services" && (
                    <TabPanel>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.2fr 0.8fr 1fr",
                          gap: 8,
                          alignItems: "end",
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <Label style={{ fontSize: ".75rem", marginBottom: 2 }}>Service</Label>
                          <SearchableDropdown
                            apiEndpoint="roomservice-description/"
                            value={serviceForm.description}
                            onChange={(val) => setServiceForm((p) => ({ ...p, description: val }))}
                            placeholder="Search service…"
                            labelField="description"
                            valueField="description"
                          />
                        </div>
                        <div>
                          <Label style={{ fontSize: ".75rem", marginBottom: 2 }}>Priority</Label>
                          <Input
                            type="number"
                            value={serviceForm.priority}
                            onChange={(e) =>
                              setServiceForm((p) => ({ ...p, priority: e.target.value }))
                            }
                            placeholder="1, 2…"
                            style={{ height: 34, fontSize: ".82rem" }}
                          />
                        </div>
                        <div>
                          <Label style={{ fontSize: ".75rem", marginBottom: 2 }}>Amount (₹)</Label>
                          <Input
                            type="number"
                            value={serviceForm.amount}
                            onChange={(e) =>
                              setServiceForm((p) => ({ ...p, amount: e.target.value }))
                            }
                            placeholder="0.00"
                            step="0.01"
                            style={{ height: 34, fontSize: ".82rem" }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 6,
                          marginBottom: 10,
                        }}
                      >
                        {editingServiceIdx !== null && (
                          <Button
                            type="button"
                            secondary
                            onClick={() => {
                              setEditingServiceIdx(null);
                              setServiceForm(defaultService);
                            }}
                            style={{ height: 28, padding: "0 10px", fontSize: ".75rem" }}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          type="button"
                          onClick={addService}
                          style={{
                            height: 28,
                            padding: "0 14px",
                            fontSize: ".75rem",
                            background: "#0d9488",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {editingServiceIdx !== null ? (
                            <>
                              <Check size={13} /> Update
                            </>
                          ) : (
                            <>
                              <Plus size={13} /> Add Service
                            </>
                          )}
                        </Button>
                      </div>

                      <TableWrapper style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", margin: 0 }}>
                        <Table style={{ fontSize: ".78rem" }}>
                          <thead>
                            <Tr style={{ background: "#f8fafc" }}>
                              <Th>Description</Th>
                              <Th style={{ width: 60, textAlign: "center" }}>Priority</Th>
                              <Th style={{ width: 90 }}>Amount</Th>
                              <Th style={{ width: 68, textAlign: "center" }}>Actions</Th>
                            </Tr>
                          </thead>
                          <tbody>
                            {roomServices.length === 0 ? (
                              <Tr>
                                <Td
                                  colSpan="4"
                                  style={{ textAlign: "center", color: "#9ca3af", padding: "18px 0" }}
                                >
                                  No services configured
                                </Td>
                              </Tr>
                            ) : (
                              paginatedServices.map((svc, localIdx) => {
                                const globalIdx = (servicesPage - 1) * SUB_PAGE_SIZE + localIdx;
                                return (
                                  <Tr
                                    key={globalIdx}
                                    style={{ background: editingServiceIdx === globalIdx ? "#f0fdf4" : "" }}
                                  >
                                    <Td style={{ fontWeight: 600, color: "#334155" }}>{svc.description || "—"}</Td>
                                    <Td style={{ textAlign: "center" }}>{svc.priority || "—"}</Td>
                                    <Td style={{ fontWeight: 600, color: "#0f766e" }}>₹{svc.amount || "0"}</Td>
                                    <Td style={{ textAlign: "center" }}>
                                      <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                                        <MiniIconButton
                                          type="button"
                                          title="Edit Service"
                                          onClick={() => editService(globalIdx)}
                                        >
                                          <Pencil size={12} />
                                        </MiniIconButton>
                                        <MiniIconButton
                                          danger
                                          type="button"
                                          title="Remove Service"
                                          onClick={() => removeService(globalIdx)}
                                        >
                                          <Trash2 size={12} />
                                        </MiniIconButton>
                                      </div>
                                    </Td>
                                  </Tr>
                                );
                              })
                            )}
                          </tbody>
                        </Table>
                      </TableWrapper>

                      {/* Mini Pagination for Services (>5 items) */}
                      {roomServices.length > SUB_PAGE_SIZE && (
                        <MiniPager>
                          <span>
                            Showing {(servicesPage - 1) * SUB_PAGE_SIZE + 1}–
                            {Math.min(servicesPage * SUB_PAGE_SIZE, roomServices.length)} of {roomServices.length}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MiniPageBtn
                              type="button"
                              onClick={() => setServicesPage((p) => Math.max(1, p - 1))}
                              disabled={servicesPage === 1}
                            >
                              <ChevronLeft size={13} />
                            </MiniPageBtn>
                            <span style={{ fontWeight: 600, padding: "0 4px" }}>
                              {servicesPage} / {totalServicesPages}
                            </span>
                            <MiniPageBtn
                              type="button"
                              onClick={() => setServicesPage((p) => Math.min(totalServicesPages, p + 1))}
                              disabled={servicesPage === totalServicesPages}
                            >
                              <ChevronRight size={13} />
                            </MiniPageBtn>
                          </div>
                        </MiniPager>
                      )}
                    </TabPanel>
                  )}

                  {/* ── Beds Tab ── */}
                  {activeTab === "beds" && (
                    <TabPanel>
                      <TableWrapper style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", margin: 0 }}>
                        <Table style={{ fontSize: ".78rem" }}>
                          <thead>
                            <Tr style={{ background: "#f8fafc" }}>
                              <Th style={{ width: 32 }}>#</Th>
                              <Th style={{ width: 90 }}>Bed No</Th>
                              <Th style={{ width: 85, textAlign: "center" }}>Blocked</Th>
                              <Th>Block Reason</Th>
                              <Th style={{ width: 44, textAlign: "center" }}>Del</Th>
                            </Tr>
                          </thead>
                          <tbody>
                            {paginatedBeds.map(({ bed, globalIndex }) => (
                              <Tr key={globalIndex}>
                                <Td style={{ color: "#9ca3af", fontWeight: 600 }}>{globalIndex + 1}</Td>
                                <Td>
                                  <Input
                                    value={bed.bed_number}
                                    onChange={(e) => updateBed(globalIndex, "bed_number", e.target.value)}
                                    placeholder={`B${globalIndex + 1}`}
                                    style={{ height: 28, padding: "0 6px", fontSize: ".8rem", fontWeight: 600 }}
                                  />
                                </Td>
                                <Td style={{ textAlign: "center" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                    <ToggleSwitch
                                      type="button"
                                      on={bed.blocked}
                                      onClick={() => updateBed(globalIndex, "blocked", !bed.blocked)}
                                    />
                                    <span
                                      style={{
                                        fontSize: ".7rem",
                                        fontWeight: 700,
                                        color: bed.blocked ? "#dc2626" : "#64748b",
                                      }}
                                    >
                                      {bed.blocked ? "Yes" : "No"}
                                    </span>
                                  </div>
                                </Td>
                                <Td>
                                  {bed.blocked ? (
                                    <Input
                                      value={bed.blocked_reason}
                                      onChange={(e) =>
                                        updateBed(globalIndex, "blocked_reason", e.target.value)
                                      }
                                      placeholder="Reason…"
                                      style={{ height: 28, padding: "0 6px", fontSize: ".8rem" }}
                                    />
                                  ) : (
                                    <span style={{ color: "#cbd5e1" }}>—</span>
                                  )}
                                </Td>
                                <Td style={{ textAlign: "center" }}>
                                  <MiniIconButton
                                    danger
                                    type="button"
                                    title="Delete Bed"
                                    onClick={() => removeBed(globalIndex)}
                                  >
                                    <Trash2 size={12} />
                                  </MiniIconButton>
                                </Td>
                              </Tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableWrapper>

                      {/* Mini Pagination for Beds (>5 items) */}
                      {roomBeds.length > SUB_PAGE_SIZE && (
                        <MiniPager>
                          <span>
                            Showing {(bedsPage - 1) * SUB_PAGE_SIZE + 1}–
                            {Math.min(bedsPage * SUB_PAGE_SIZE, roomBeds.length)} of {roomBeds.length}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MiniPageBtn
                              type="button"
                              onClick={() => setBedsPage((p) => Math.max(1, p - 1))}
                              disabled={bedsPage === 1}
                            >
                              <ChevronLeft size={13} />
                            </MiniPageBtn>
                            <span style={{ fontWeight: 600, padding: "0 4px" }}>
                              {bedsPage} / {totalBedsPages}
                            </span>
                            <MiniPageBtn
                              type="button"
                              onClick={() => setBedsPage((p) => Math.min(totalBedsPages, p + 1))}
                              disabled={bedsPage === totalBedsPages}
                            >
                              <ChevronRight size={13} />
                            </MiniPageBtn>
                          </div>
                        </MiniPager>
                      )}
                    </TabPanel>
                  )}

                  {/* ── Room Kits Tab ── */}
                  {activeTab === "kits" && (
                    <TabPanel>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.2fr 0.8fr 1fr",
                          gap: 8,
                          alignItems: "end",
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <Label style={{ fontSize: ".75rem", marginBottom: 2 }}>Kit Item</Label>
                          <SearchableDropdown
                            apiEndpoint="room-kititems/"
                            value={kitForm.kit_item}
                            onChange={(val) => setKitForm((p) => ({ ...p, kit_item: val }))}
                            placeholder="Search kit…"
                            labelField="kit_name"
                            valueField="kit_name"
                          />
                        </div>
                        <div>
                          <Label style={{ fontSize: ".75rem", marginBottom: 2 }}>Priority</Label>
                          <Input
                            type="number"
                            value={kitForm.priority}
                            onChange={(e) => setKitForm((p) => ({ ...p, priority: e.target.value }))}
                            placeholder="1, 2…"
                            style={{ height: 34, fontSize: ".82rem" }}
                          />
                        </div>
                        <div>
                          <Label style={{ fontSize: ".75rem", marginBottom: 2 }}>Amount (₹)</Label>
                          <Input
                            type="number"
                            value={kitForm.amount}
                            onChange={(e) => setKitForm((p) => ({ ...p, amount: e.target.value }))}
                            placeholder="0.00"
                            step="0.01"
                            style={{ height: 34, fontSize: ".82rem" }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 6,
                          marginBottom: 10,
                        }}
                      >
                        {editingKitIdx !== null && (
                          <Button
                            type="button"
                            secondary
                            onClick={() => {
                              setEditingKitIdx(null);
                              setKitForm(defaultKit);
                            }}
                            style={{ height: 28, padding: "0 10px", fontSize: ".75rem" }}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          type="button"
                          onClick={addKit}
                          style={{
                            height: 28,
                            padding: "0 14px",
                            fontSize: ".75rem",
                            background: "#0d9488",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {editingKitIdx !== null ? (
                            <>
                              <Check size={13} /> Update
                            </>
                          ) : (
                            <>
                              <Plus size={13} /> Add Kit
                            </>
                          )}
                        </Button>
                      </div>

                      <TableWrapper style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", margin: 0 }}>
                        <Table style={{ fontSize: ".78rem" }}>
                          <thead>
                            <Tr style={{ background: "#f8fafc" }}>
                              <Th>Kit Item</Th>
                              <Th style={{ width: 60, textAlign: "center" }}>Priority</Th>
                              <Th style={{ width: 90 }}>Amount</Th>
                              <Th style={{ width: 68, textAlign: "center" }}>Actions</Th>
                            </Tr>
                          </thead>
                          <tbody>
                            {roomKits.length === 0 ? (
                              <Tr>
                                <Td
                                  colSpan="4"
                                  style={{ textAlign: "center", color: "#9ca3af", padding: "18px 0" }}
                                >
                                  No kit items configured
                                </Td>
                              </Tr>
                            ) : (
                              paginatedKits.map((k, localIdx) => {
                                const globalIdx = (kitsPage - 1) * SUB_PAGE_SIZE + localIdx;
                                return (
                                  <Tr
                                    key={globalIdx}
                                    style={{ background: editingKitIdx === globalIdx ? "#f0fdf4" : "" }}
                                  >
                                    <Td style={{ fontWeight: 600, color: "#334155" }}>{k.kit_item || "—"}</Td>
                                    <Td style={{ textAlign: "center" }}>{k.priority || "—"}</Td>
                                    <Td style={{ fontWeight: 600, color: "#0f766e" }}>₹{k.amount || "0"}</Td>
                                    <Td style={{ textAlign: "center" }}>
                                      <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                                        <MiniIconButton
                                          type="button"
                                          title="Edit Kit Item"
                                          onClick={() => editKit(globalIdx)}
                                        >
                                          <Pencil size={12} />
                                        </MiniIconButton>
                                        <MiniIconButton
                                          danger
                                          type="button"
                                          title="Remove Kit Item"
                                          onClick={() => removeKit(globalIdx)}
                                        >
                                          <Trash2 size={12} />
                                        </MiniIconButton>
                                      </div>
                                    </Td>
                                  </Tr>
                                );
                              })
                            )}
                          </tbody>
                        </Table>
                      </TableWrapper>

                      {/* Mini Pagination for Kits (>5 items) */}
                      {roomKits.length > SUB_PAGE_SIZE && (
                        <MiniPager>
                          <span>
                            Showing {(kitsPage - 1) * SUB_PAGE_SIZE + 1}–
                            {Math.min(kitsPage * SUB_PAGE_SIZE, roomKits.length)} of {roomKits.length}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MiniPageBtn
                              type="button"
                              onClick={() => setKitsPage((p) => Math.max(1, p - 1))}
                              disabled={kitsPage === 1}
                            >
                              <ChevronLeft size={13} />
                            </MiniPageBtn>
                            <span style={{ fontWeight: 600, padding: "0 4px" }}>
                              {kitsPage} / {totalKitsPages}
                            </span>
                            <MiniPageBtn
                              type="button"
                              onClick={() => setKitsPage((p) => Math.min(totalKitsPages, p + 1))}
                              disabled={kitsPage === totalKitsPages}
                            >
                              <ChevronRight size={13} />
                            </MiniPageBtn>
                          </div>
                        </MiniPager>
                      )}
                    </TabPanel>
                  )}
                </div>
              </DrawerLayout>
            </form>
          </DrawerBody>
        </Drawer>

        {/* ── Search & Filter Bar ── */}
        <FilterContainer>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
              Filter Rooms by Block, Category & Nursing Station
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".76rem", color: "#64748b", fontWeight: 600 }}>
                Show
                <Select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{ height: 30, padding: "0 6px", width: 62, fontSize: ".78rem", borderRadius: 5 }}
                >
                  {[10, 15, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
                entries
              </div>
              <CountBadge>
                <Check size={13} color="#059669" />
                {filteredRooms.length} room(s)
              </CountBadge>
            </div>
          </div>

          {/* Full-Row Responsive Filter Grid */}
          <FilterGrid>
            <SearchInputWrapper>
              <SearchIconWrap>
                <Search size={15} />
              </SearchIconWrap>
              <SearchInput
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by room number, description, category..."
              />
            </SearchInputWrapper>

            <FilterSelect
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">🏢 All Blocks</option>
              {filterOptions.blocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">🏷️ All Categories</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              value={selectedStation}
              onChange={(e) => {
                setSelectedStation(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">🩺 All Stations / Floors</option>
              {filterOptions.stations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </FilterSelect>

            {(searchTerm || selectedBlock !== "ALL" || selectedCategory !== "ALL" || selectedStation !== "ALL") && (
              <ClearFilterBtn type="button" onClick={handleResetFilters} title="Reset all filters">
                <RotateCcw size={13} /> Reset
              </ClearFilterBtn>
            )}
          </FilterGrid>
        </FilterContainer>

        {/* ── Data Table ── */}
        <ResponsiveTableWrapper>
          <StyledTable>
            <thead>
              <Tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                <Th style={{ width: 44, color: "#64748b", fontWeight: 700, whiteSpace: "nowrap", textAlign: "center" }}>#</Th>
                <Th style={{ color: "#334155", fontWeight: 700, whiteSpace: "nowrap" }}>ROOM NUMBER</Th>
                <Th style={{ color: "#334155", fontWeight: 700, whiteSpace: "nowrap" }}>DESCRIPTION</Th>
                <Th style={{ color: "#334155", fontWeight: 700, whiteSpace: "nowrap" }}>BLOCK</Th>
                <Th style={{ color: "#334155", fontWeight: 700, whiteSpace: "nowrap" }}>CATEGORY</Th>
                <Th style={{ color: "#334155", fontWeight: 700, whiteSpace: "nowrap" }}>NURSING STATION</Th>
                <Th style={{ color: "#334155", fontWeight: 700, width: 90, textAlign: "center", whiteSpace: "nowrap" }}>CAPACITY</Th>
                <Th style={{ color: "#334155", fontWeight: 700, width: 110, textAlign: "center", whiteSpace: "nowrap" }}>STATUS</Th>
                <Th style={{ width: 100, textAlign: "center", color: "#334155", fontWeight: 700, whiteSpace: "nowrap" }}>ACTIONS</Th>
              </Tr>
            </thead>
            <tbody>
              {loading ? (
                <Tr>
                  <Td colSpan="9" style={{ textAlign: "center", padding: "40px 0", color: "#64748b", whiteSpace: "nowrap" }}>
                    Loading rooms…
                  </Td>
                </Tr>
              ) : paginatedRooms.length === 0 ? (
                <Tr>
                  <Td colSpan="9" style={{ textAlign: "center", padding: "45px 0", color: "#9ca3af" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.1rem" }}>🔍</span>
                      <span style={{ fontWeight: 600, color: "#475569" }}>No rooms match the selected filters</span>
                      <Button
                        type="button"
                        secondary
                        onClick={handleResetFilters}
                        style={{ fontSize: ".76rem", padding: "4px 14px", marginTop: 4 }}
                      >
                        <RotateCcw size={12} style={{ marginRight: 4 }} /> Reset Filters
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ) : (
                paginatedRooms.map((r, idx) => {
                  const rowIndex = (page - 1) * perPage + idx + 1;

                  return (
                    <AnimatedTr key={r.room_number || idx}>
                      <Td style={{ color: "#94a3b8", fontSize: ".8rem", fontWeight: 600, whiteSpace: "nowrap", textAlign: "center" }}>{rowIndex}</Td>
                      <Td style={{ fontWeight: 800, color: "#0f766e", fontSize: ".88rem", whiteSpace: "nowrap" }}>
                        {r.room_number}
                      </Td>
                      <Td style={{ fontSize: ".82rem", color: "#475569", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.description || "—"}
                      </Td>
                      <Td style={{ fontSize: ".82rem", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{r.block || "—"}</Td>
                      <Td style={{ fontSize: ".82rem", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            background: "#f1f5f9",
                            borderRadius: 4,
                            fontWeight: 600,
                            color: "#334155",
                            border: "1px solid #e2e8f0",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                          }}
                        >
                          {r.room_category || "—"}
                        </span>
                      </Td>
                      <Td style={{ fontSize: ".82rem", color: "#475569", whiteSpace: "nowrap" }}>{r.nursing_station || "—"}</Td>
                      <Td style={{ textAlign: "center", fontSize: ".85rem", fontWeight: 800, color: "#0f766e", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            background: "#f0fdfa",
                            borderRadius: 12,
                            border: "1px solid #ccfbf1",
                            color: "#0f766e",
                            display: "inline-block",
                          }}
                        >
                          {r.capacity || 1}
                        </span>
                      </Td>
                      <Td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <StatusBadge status={r.room_status || "Available"}>
                          {r.room_status || "Available"}
                        </StatusBadge>
                      </Td>
                      <Td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <IconButton
                            type="button"
                            title="Edit Room"
                            onClick={() => handleEdit(r)}
                          >
                            <Pencil size={14} />
                          </IconButton>
                          <IconButton
                            danger
                            type="button"
                            title="Delete Room"
                            onClick={() => handleDelete(r.room_number)}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </div>
                      </Td>
                    </AnimatedTr>
                  );
                })
              )}
            </tbody>
          </StyledTable>
        </ResponsiveTableWrapper>

        {/* ── Pagination Footer ── */}
        <Pager>
          <span>
            Showing {filteredRooms.length === 0 ? 0 : (page - 1) * perPage + 1}–
            {Math.min(page * perPage, filteredRooms.length)} of {filteredRooms.length} entries
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} /> Previous
            </PageBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map((n) => (
                <PageBtn key={n} active={n === page} onClick={() => setPage(n)}>
                  {n}
                </PageBtn>
              ))}
            <PageBtn
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight size={14} />
            </PageBtn>
          </div>
        </Pager>
      </Container>
    </PageWrapper>
  );
};

export default Room;