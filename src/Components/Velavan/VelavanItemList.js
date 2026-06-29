import React, { useEffect, useState, useRef } from "react";
import { FiEdit, FiTrash2, FiSearch, FiPlus, FiPrinter } from "react-icons/fi";
import { FaHistory } from "react-icons/fa";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  colors,
  Input,
  Table,
  Th,
  Td,
  Tr,
  SearchContainer,
  SearchInput,
  TableWrapper,
} from "../GlobalStyles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 8px;
  font-size: 16px;
  color: ${(props) => props.color || colors.primary};
  transition:
    transform 0.2s ease,
    color 0.2s ease;
  &:hover {
    transform: scale(1.2);
    color: ${colors.primaryDark};
  }
`;

const SearchIconWrapper = styled.div`
  position: relative;
  flex: 1;
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.textMuted};
    font-size: 16px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h2 {
    margin: 0;
    color: ${colors.primary};
  }
`;

// ─── Count Cards ──────────────────────────────────────────────────────────────

const CardsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CountCard = styled.button`
  background: ${(p) => (p.active ? p.activeBg : "white")};
  border: 2px solid ${(p) => (p.active ? p.borderColor : colors.border)};
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  box-shadow: ${(p) =>
    p.active ? `0 4px 14px ${p.shadowColor}` : "0 1px 3px rgba(0,0,0,0.06)"};

  &:hover {
    border-color: ${(p) => p.borderColor};
    box-shadow: 0 4px 14px ${(p) => p.shadowColor};
    transform: translateY(-1px);
  }
`;

const CardIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: ${(p) => p.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CardCount = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${(p) => p.color};
  line-height: 1;
`;

const CardLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const CardSub = styled.div`
  font-size: 0.68rem;
  color: ${(p) => p.color};
  font-weight: 500;
  margin-top: 1px;
`;

// ─── Table toolbar (print button only) ───────────────────────────────────────

const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 8px;
`;

const PrintBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

const CategoryBadge = styled.span`
  background: ${(p) =>
    p.cat === "DRUG" ? "#dbeafe" : p.cat === "IMPLANT" ? "#dcfce7" : "#f1f5f9"};
  color: ${(p) =>
    p.cat === "DRUG"
      ? "#1d4ed8"
      : p.cat === "IMPLANT"
        ? "#166534"
        : colors.textMuted};
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
`;

// ─── History Modal Styled Components ─────────────────────────────────────────

const HistOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
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
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
`;

const HistTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
`;

const HistSubtitle = styled.div`
  font-size: 0.72rem;
  opacity: 0.85;
  margin-top: 3px;
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
    border-bottom: 2px solid ${colors.border};
  }
  td {
    padding: 7px 10px;
    border-bottom: 1px solid ${colors.border};
    vertical-align: middle;
  }
  tbody tr:hover {
    filter: brightness(0.97);
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px;
  margin-left: 12px;
  flex-shrink: 0;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const StatsBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  margin-left: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textMuted};
  font-size: 0.88rem;
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// ─── Print styles (injected into <head> once) ─────────────────────────────────
const PRINT_STYLE_ID = "velavan-item-print-styles";
const injectPrintStyles = () => {
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PRINT_STYLE_ID;
  style.innerHTML = `
    @media print {
      body > *:not(#velavan-print-root) { display: none !important; }
      #velavan-print-root {
        display: block !important;
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: #1e293b;
      }
      #velavan-print-root .print-header {
        text-align: center;
        margin-bottom: 18px;
        border-bottom: 2px solid #1e3a5f;
        padding-bottom: 10px;
      }
      #velavan-print-root .print-header h1 {
        margin: 0 0 4px;
        font-size: 18px;
        color: #1e3a5f;
      }
      #velavan-print-root .print-header p {
        margin: 0;
        font-size: 11px;
        color: #64748b;
      }
      #velavan-print-root table {
        width: 100%;
        border-collapse: collapse;
      }
      #velavan-print-root th {
        background: #1e3a5f !important;
        color: white !important;
        padding: 7px 10px;
        font-size: 11px;
        text-align: left;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      #velavan-print-root td {
        padding: 6px 10px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 11px;
      }
      #velavan-print-root tr:nth-child(even) td {
        background: #f8fafc !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      #velavan-print-root .badge {
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 10px;
      }
      #velavan-print-root .badge-drug {
        background: #dbeafe !important;
        color: #1d4ed8 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      #velavan-print-root .badge-implant {
        background: #dcfce7 !important;
        color: #166534 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      #velavan-print-root .print-footer {
        margin-top: 20px;
        font-size: 10px;
        color: #64748b;
        display: flex;
        justify-content: space-between;
      }
    }
  `;
  document.head.appendChild(style);
};

// ─── Main Component ───────────────────────────────────────────────────────────

const VelavanItemList = () => {
  const navigate = useNavigate();
  const printRootRef = useRef(null);

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL"); // ALL | DRUG | IMPLANT | UNCATEGORIZED
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);

  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canEdit = allowedActions.includes("HMS-P-VIE-RW");
  const canDelete = allowedActions.includes("HMS-P-VID-RW");

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Inject print CSS once
  useEffect(() => {
    injectPrintStyles();
  }, []);

  // ── Fetch items ────────────────────────────────────────────────────────────
  const fetchItems = async () => {
    try {
      const listRes = await apiRequest(`${HMSURL}velavan_get_items/`, "GET");
      if (listRes.status !== 200 || listRes.data.status !== "success") return;

      const velavanItems = listRes.data.data;

      const detailedItems = await Promise.all(
        velavanItems.map(async (velavanItem) => {
          const itemId = velavanItem.item_id || velavanItem.item;
          if (!itemId) return velavanItem;
          try {
            const res = await apiRequest(`${HMSURL}get_item/${itemId}/`, "GET");
            if (res.status === 200) return { ...res.data, ...velavanItem };
          } catch {
            return velavanItem;
          }
          return velavanItem;
        }),
      );

      setItems(detailedItems);
    } catch (err) {
      console.error("Fetch items error", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []); // eslint-disable-line

  // ── Combined filter: search + category + alphabetical sort ────────────────
  useEffect(() => {
    let result = [...items];

    if (categoryFilter === "DRUG") {
      result = result.filter((i) => i.category === "DRUG");
    } else if (categoryFilter === "IMPLANT") {
      result = result.filter((i) => i.category === "IMPLANT");
    } else if (categoryFilter === "UNCATEGORIZED") {
      result = result.filter((i) => !i.category || i.category.trim() === "");
    }

    if (searchQuery.trim()) {
      result = result.filter((i) =>
        i.itemName?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort alphabetically by item name
    result.sort((a, b) =>
      (a.itemName || "")
        .toLowerCase()
        .localeCompare((b.itemName || "").toLowerCase()),
    );

    setFilteredItems(result);
  }, [searchQuery, categoryFilter, items]);

  // ── Counts ─────────────────────────────────────────────────────────────────
  const counts = {
    total: items.length,
    drug: items.filter((i) => i.category === "DRUG").length,
    implant: items.filter((i) => i.category === "IMPLANT").length,
    uncategorized: items.filter((i) => !i.category || i.category.trim() === "")
      .length,
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const title =
      categoryFilter === "DRUG"
        ? "DRUG LIST"
        : categoryFilter === "IMPLANT"
          ? "IMPLANT LIST"
          : categoryFilter === "UNCATEGORIZED"
            ? "UNCATEGORIZED ITEMS"
            : "ALL ITEMS LIST";

    // filteredItems is already sorted alphabetically and filtered by category/search
    const rows = filteredItems
      .map(
        (item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.itemName || "—"}</td>
          <td>${item.hsn || "—"}</td>
          <td>
            <span class="badge ${
              item.category === "DRUG"
                ? "badge-drug"
                : item.category === "IMPLANT"
                  ? "badge-implant"
                  : ""
            }">
              ${item.category || "—"}
            </span>
          </td>
        </tr>`,
      )
      .join("");

    const filterNote = searchQuery.trim()
      ? ` &nbsp;|&nbsp; Search: "${searchQuery}"`
      : "";

    const html = `
      <div class="print-header">
        <h1>SHANMUGA HOSPITAL LIMITED</h1>
        <p>51/24, Saradha College Road, Salem - 636007 &nbsp;|&nbsp; Ph: 04272706666</p>
        <h2 style="margin:10px 0 0;font-size:14px;color:#1e3a5f;">${title}</h2>
        <p>Total: ${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""}${filterNote} &nbsp;|&nbsp; Printed on: ${new Date().toLocaleString("en-IN")}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>HSN Code</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="print-footer">
        <span>Generated by: ${localStorage.getItem("employeeId") || "N/A"}</span>
        <span>${new Date().toLocaleString("en-IN")}</span>
      </div>
    `;

    // Write into the hidden print root div
    if (printRootRef.current) {
      printRootRef.current.innerHTML = html;
    }

    window.print();

    // Clean up after print dialog closes
    setTimeout(() => {
      if (printRootRef.current) printRootRef.current.innerHTML = "";
    }, 1000);
  };

  // ── History ────────────────────────────────────────────────────────────────
  const handleShowHistory = async (item) => {
    const hsn = String(item.hsn ?? "").trim();
    const itemName = String(item.itemName ?? "").trim();

    if (!hsn || !itemName) {
      alert("HSN code and item name are required to view history.");
      return;
    }

    setSelectedItemForHistory({ hsn, name: itemName });
    setHistoryData([]);
    setShowHistoryModal(true);
    setHistoryLoading(true);

    try {
      const url = `${HMSURL}velavan/previous-purchases/?hsn=${encodeURIComponent(hsn)}&item_name=${encodeURIComponent(itemName)}`;
      const result = await apiRequest(url, "GET");
      if (result.success && result.data?.status === "success") {
        setHistoryData(result.data.data || []);
      } else {
        setHistoryData([]);
      }
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistoryData([]);
    setSelectedItemForHistory(null);
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiRequest(`${HMSURL}velavan_delete_item/${id}/`, "PATCH");
      fetchItems();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item._id || item.id);
    setForm({ ...item });
  };

  const handleSave = async () => {
    try {
      await apiRequest(
        `${HMSURL}velavan_update_item/${editingItem}/`,
        "PATCH",
        form,
      );
      setEditingItem(null);
      setForm({});
      fetchItems();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  // ── Price stats for history ────────────────────────────────────────────────
  const getPriceStats = (data) => {
    if (!data.length) return { min: 0, max: 0, avg: 0 };
    const prices = data.map((h) =>
      parseFloat((h.matched_item || {}).unitPrice || 0),
    );
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hidden div used as print root — visible only during @media print */}
      <div
        id="velavan-print-root"
        ref={printRootRef}
        style={{ display: "none" }}
      />

      <HeaderContainer>
        <h2>Item Management</h2>
        <ActionButton
          color={colors.success}
          onClick={() => navigate("/AddVelavanItems")}
          title="Add new item"
          style={{
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: 4,
            border: `1px solid ${colors.success}`,
            borderRadius: 6,
            padding: "5px 12px",
          }}
        >
          <FiPlus /> Add Item
        </ActionButton>
      </HeaderContainer>

      {/* ── Count Cards ── */}
      <CardsRow>
        {/* All Items */}
        <CountCard
          active={categoryFilter === "ALL"}
          activeBg="#eff6ff"
          borderColor="#3b82f6"
          shadowColor="rgba(59,130,246,0.15)"
          onClick={() => setCategoryFilter("ALL")}
        >
          <CardIcon bg="#dbeafe">📦</CardIcon>
          <CardInfo>
            <CardCount color="#1d4ed8">{counts.total}</CardCount>
            <CardLabel>Total Items</CardLabel>
            <CardSub color="#3b82f6">
              {categoryFilter === "ALL" ? "● Showing all" : "Click to show all"}
            </CardSub>
          </CardInfo>
        </CountCard>

        {/* Drug */}
        <CountCard
          active={categoryFilter === "DRUG"}
          activeBg="#eff6ff"
          borderColor="#2563eb"
          shadowColor="rgba(37,99,235,0.15)"
          onClick={() => setCategoryFilter("DRUG")}
        >
          <CardIcon bg="#dbeafe">💊</CardIcon>
          <CardInfo>
            <CardCount color="#1d4ed8">{counts.drug}</CardCount>
            <CardLabel>Drugs</CardLabel>
            <CardSub color="#2563eb">
              {counts.total > 0
                ? `${((counts.drug / counts.total) * 100).toFixed(1)}% of total`
                : "0%"}
            </CardSub>
          </CardInfo>
        </CountCard>

        {/* Implant */}
        <CountCard
          active={categoryFilter === "IMPLANT"}
          activeBg="#f0fdf4"
          borderColor="#16a34a"
          shadowColor="rgba(22,163,74,0.15)"
          onClick={() => setCategoryFilter("IMPLANT")}
        >
          <CardIcon bg="#dcfce7">🔩</CardIcon>
          <CardInfo>
            <CardCount color="#166534">{counts.implant}</CardCount>
            <CardLabel>Implants</CardLabel>
            <CardSub color="#16a34a">
              {counts.total > 0
                ? `${((counts.implant / counts.total) * 100).toFixed(1)}% of total`
                : "0%"}
            </CardSub>
          </CardInfo>
        </CountCard>

        {/* Uncategorized */}
        <CountCard
          active={categoryFilter === "UNCATEGORIZED"}
          activeBg="#fefce8"
          borderColor="#ca8a04"
          shadowColor="rgba(202,138,4,0.15)"
          onClick={() => setCategoryFilter("UNCATEGORIZED")}
        >
          <CardIcon bg="#fef9c3">❓</CardIcon>
          <CardInfo>
            <CardCount color="#92400e">{counts.uncategorized}</CardCount>
            <CardLabel>Uncategorized</CardLabel>
            <CardSub color="#ca8a04">
              {counts.uncategorized > 0
                ? "Needs category"
                : "All categorized ✓"}
            </CardSub>
          </CardInfo>
        </CountCard>
      </CardsRow>

      {/* Search Filter */}
      <SearchContainer>
        <SearchIconWrapper>
          <FiSearch />
          <SearchInput
            type="text"
            placeholder="Search by Item Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </SearchIconWrapper>
      </SearchContainer>

      {/* ── Table Toolbar: print button only ── */}
      <TableToolbar>
        <PrintBtn onClick={handlePrint} title="Print filtered list">
          <FiPrinter size={14} />
          Print{" "}
          {categoryFilter === "ALL"
            ? "All Items"
            : categoryFilter === "DRUG"
              ? "Drug List"
              : categoryFilter === "IMPLANT"
                ? "Implant List"
                : "Uncategorized List"}
        </PrintBtn>
      </TableToolbar>

      {/* Result count strip */}
      {(searchQuery || categoryFilter !== "ALL") && (
        <div
          style={{
            fontSize: "0.75rem",
            color: colors.textMuted,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>
            Showing <strong>{filteredItems.length}</strong> of{" "}
            <strong>{items.length}</strong> items
          </span>
          {(searchQuery || categoryFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("ALL");
              }}
              style={{
                background: "none",
                border: "none",
                color: colors.primary,
                cursor: "pointer",
                fontSize: "0.72rem",
                fontWeight: 600,
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Item Name</Th>
              <Th>HSN</Th>
              <Th>Category</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <Tr>
                <Td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "32px" }}
                >
                  <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📭</div>
                  <div style={{ color: colors.textMuted, fontSize: "0.85rem" }}>
                    {searchQuery
                      ? "No items found matching your search"
                      : categoryFilter !== "ALL"
                        ? `No ${categoryFilter.toLowerCase()} items found`
                        : "No items found"}
                  </div>
                </Td>
              </Tr>
            ) : (
              filteredItems.map((item, idx) => {
                const id = item._id || item.id;
                const isEditing = editingItem === id;

                return (
                  <Tr key={id}>
                    {/* S.No */}
                    <Td
                      style={{
                        color: colors.textMuted,
                        fontWeight: 600,
                        width: 50,
                      }}
                    >
                      {idx + 1}
                    </Td>

                    {/* Item Name */}
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.itemName || ""}
                          onChange={(e) =>
                            handleChange("itemName", e.target.value)
                          }
                        />
                      ) : (
                        item.itemName
                      )}
                    </Td>

                    {/* HSN */}
                    <Td>
                      {isEditing &&
                      (!item.hsn || String(item.hsn).trim() === "") ? (
                        <Input
                          value={form.hsn || ""}
                          onChange={(e) => handleChange("hsn", e.target.value)}
                          placeholder="Enter HSN code"
                        />
                      ) : (
                        item.hsn || ""
                      )}
                    </Td>

                    {/* Category */}
                    <Td>
                      {isEditing ? (
                        <select
                          value={form.category || ""}
                          onChange={(e) =>
                            handleChange("category", e.target.value)
                          }
                          style={{
                            padding: "6px 8px",
                            border: `1px solid ${colors.border}`,
                            borderRadius: 6,
                            fontSize: "0.85rem",
                            width: "100%",
                            maxWidth: 160,
                          }}
                        >
                          <option value="">Select</option>
                          <option value="DRUG">DRUG</option>
                          <option value="IMPLANT">IMPLANT</option>
                        </select>
                      ) : (
                        <CategoryBadge cat={item.category}>
                          {item.category || "—"}
                        </CategoryBadge>
                      )}
                    </Td>

                    {/* Actions */}
                    <Td>
                      {isEditing ? (
                        <>
                          <ActionButton color="green" onClick={handleSave}>
                            ✅ Save
                          </ActionButton>
                          <ActionButton
                            color="gray"
                            onClick={() => setEditingItem(null)}
                          >
                            ❌ Cancel
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          {item.hsn && String(item.hsn).trim() && (
                            <ActionButton
                              color="#7c3aed"
                              onClick={() => handleShowHistory(item)}
                              title="View purchase history"
                              style={{ fontSize: 15 }}
                            >
                              <FaHistory />
                            </ActionButton>
                          )}
                          {canEdit && (
                            <ActionButton
                              color="blue"
                              onClick={() => handleEdit(item)}
                              title="Edit item"
                            >
                              <FiEdit />
                            </ActionButton>
                          )}
                          {canDelete && (
                            <ActionButton
                              color="red"
                              onClick={() => handleDelete(id)}
                              title="Delete item"
                            >
                              <FiTrash2 />
                            </ActionButton>
                          )}
                        </>
                      )}
                    </Td>
                  </Tr>
                );
              })
            )}
          </tbody>
        </Table>
      </TableWrapper>

      {/* ═══════════════ HISTORY MODAL ═══════════════ */}
      {showHistoryModal && selectedItemForHistory && (
        <HistOverlay onClick={closeHistoryModal}>
          <HistBox onClick={(e) => e.stopPropagation()}>
            <HistHead>
              <div style={{ flex: 1 }}>
                <HistTitle>
                  Purchase History — {selectedItemForHistory.name}
                </HistTitle>
                <HistSubtitle>
                  HSN: {selectedItemForHistory.hsn}
                  {!historyLoading &&
                    historyData.length > 0 &&
                    (() => {
                      const stats = getPriceStats(historyData);
                      const hasRange = stats.max > stats.min;
                      return (
                        <>
                          <StatsBadge>
                            {historyData.length} record
                            {historyData.length !== 1 ? "s" : ""}
                          </StatsBadge>
                          {hasRange && (
                            <>
                              <StatsBadge
                                style={{
                                  background: "rgba(220,252,231,0.25)",
                                  color: "#86efac",
                                }}
                              >
                                Low ₹{stats.min.toFixed(2)}
                              </StatsBadge>
                              <StatsBadge
                                style={{
                                  background: "rgba(254,226,226,0.25)",
                                  color: "#fca5a5",
                                }}
                              >
                                High ₹{stats.max.toFixed(2)}
                              </StatsBadge>
                              <StatsBadge>
                                Avg ₹{stats.avg.toFixed(2)}
                              </StatsBadge>
                            </>
                          )}
                        </>
                      );
                    })()}
                </HistSubtitle>
              </div>
              <CloseBtn onClick={closeHistoryModal}>
                <X size={18} />
              </CloseBtn>
            </HistHead>

            <HistScroll>
              {historyLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 48,
                    gap: 14,
                  }}
                >
                  <Spinner />
                  <span
                    style={{ color: colors.textMuted, fontSize: "0.85rem" }}
                  >
                    Loading purchase history…
                  </span>
                </div>
              ) : historyData.length === 0 ? (
                <EmptyState>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                  No previous purchase history found for this item.
                </EmptyState>
              ) : (
                (() => {
                  const resolved = historyData.map((h) => ({
                    h,
                    it: h.matched_item || {},
                  }));
                  const prices = resolved.map(({ it }) =>
                    parseFloat(it.unitPrice || 0),
                  );
                  const maxPrice = Math.max(...prices);
                  const minPrice = Math.min(...prices);
                  const hasRange = maxPrice > minPrice;

                  return (
                    <HistTable>
                      <thead>
                        <tr>
                          {[
                            "#",
                            "Invoice No",
                            "Invoice Date",
                            "Vendor",
                            "HSN",
                            "Batch No",
                            "Expiry",
                            "Qty",
                            "Unit Price ₹",
                            "Purchase Cost ₹",
                            "MRP ₹",
                            "Quantity",
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resolved.map(({ h, it }, idx) => {
                          const unitPrice = parseFloat(it.unitPrice || 0);
                          const isHigh = hasRange && unitPrice === maxPrice;
                          const isLow = hasRange && unitPrice === minPrice;

                          return (
                            <tr
                              key={idx}
                              style={{
                                background: isHigh
                                  ? "#fff1f2"
                                  : isLow
                                    ? "#f0fdf4"
                                    : idx % 2 === 0
                                      ? "#f8fafc"
                                      : "white",
                              }}
                            >
                              <td
                                style={{
                                  textAlign: "center",
                                  color: colors.textMuted,
                                  fontWeight: 600,
                                }}
                              >
                                {idx + 1}
                              </td>
                              <td
                                style={{
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h.invoice_no || h.invoice_number || "—"}
                              </td>
                              <td style={{ whiteSpace: "nowrap" }}>
                                {h.invoice_date
                                  ? new Date(h.invoice_date).toLocaleDateString(
                                      "en-IN",
                                    )
                                  : h.date
                                    ? new Date(h.date).toLocaleDateString(
                                        "en-IN",
                                      )
                                    : "—"}
                              </td>
                              <td style={{ minWidth: 120 }}>
                                {h.vendor_name || h.vendor || "—"}
                              </td>
                              <td>{it.hsn || "—"}</td>
                              <td>{it.batch_no || "—"}</td>
                              <td style={{ whiteSpace: "nowrap" }}>
                                {it.expiry || "—"}
                              </td>
                              <td
                                style={{ textAlign: "center", fontWeight: 700 }}
                              >
                                {it.quantity || "—"}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  fontWeight: 700,
                                  color: isHigh
                                    ? "#dc2626"
                                    : isLow
                                      ? "#16a34a"
                                      : colors.primary,
                                }}
                              >
                                ₹{unitPrice.toFixed(2)}
                                {isHigh && (
                                  <span
                                    style={{
                                      fontSize: "0.65rem",
                                      marginLeft: 4,
                                      background: "#fecaca",
                                      color: "#dc2626",
                                      borderRadius: 3,
                                      padding: "1px 4px",
                                    }}
                                  >
                                    HIGH
                                  </span>
                                )}
                                {isLow && (
                                  <span
                                    style={{
                                      fontSize: "0.65rem",
                                      marginLeft: 4,
                                      background: "#bbf7d0",
                                      color: "#16a34a",
                                      borderRadius: 3,
                                      padding: "1px 4px",
                                    }}
                                  >
                                    LOW
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                ₹{parseFloat(it.purchaseCost || 0).toFixed(2)}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                ₹{parseFloat(it.mrp || 0).toFixed(2)}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                {it.totalstock ?? it.quantity ?? "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </HistTable>
                  );
                })()
              )}
            </HistScroll>
          </HistBox>
        </HistOverlay>
      )}
    </div>
  );
};

export default VelavanItemList;
