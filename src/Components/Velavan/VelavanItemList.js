import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import { FaHistory } from "react-icons/fa";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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

// ─── Main Component ───────────────────────────────────────────────────────────

const VelavanItemList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
            if (res.status === 200) {
              return { ...res.data, ...velavanItem };
            }
          } catch {
            return velavanItem;
          }
          return velavanItem;
        }),
      );

      setItems(detailedItems);
      setFilteredItems(detailedItems);
    } catch (err) {
      console.error("Fetch items error", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ── Search filter ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

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
  const calculateStock = (item) => {
    const total = item.total_quantity || 0;
    const approved = item.approved_quantity || 0;
    return total - approved;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiRequest(`${HMSURL}velavan_delete_item/${id}/`, "PATCH");
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
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

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Item Name</Th>
              <Th>HSN</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <Tr>
                <Td
                  colSpan={3}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  {searchQuery
                    ? "No items found matching your search"
                    : "No items found"}
                </Td>
              </Tr>
            ) : (
              filteredItems.map((item) => {
                const id = item._id || item.id;
                const isEditing = editingItem === id;

                return (
                  <Tr key={id}>
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
                          {/* History — always visible if HSN exists */}
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
            {/* Header */}
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

            {/* Body */}
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
                  // Resolve matched items first, then compute price stats
                  const resolved = historyData.map((h) => {
                    const it = h.matched_item || {};
                    return { h, it };
                  });

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
                              {/* Unit Price — color coded */}
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
