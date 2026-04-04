import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
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

// Action Buttons (Edit / Delete Icons)
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

// Search Icon Wrapper
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

// Header Container
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

const VelavanItemList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const BASEURL = process.env.REACT_APP_BACKEND_BASE_URL;

  // Fetch items directly from VelavanItems via get_item
  const fetchItems = async () => {
    try {
      // Step 1: Get all VelavanItems (id list)
      const listRes = await apiRequest(`${HMSURL}velavan_get_items/`, "GET");
      if (listRes.status !== 200 || listRes.data.status !== "success") return;

      const velavanItems = listRes.data.data;

      // Step 2: For each item, fetch full details from get_item using item_id
      const detailedItems = await Promise.all(
        velavanItems.map(async (velavanItem) => {
          const itemId = velavanItem.item_id || velavanItem.item;
          if (!itemId) return velavanItem;
          try {
            const res = await apiRequest(
              `${BASEURL}get_item/${itemId}/`,
              "GET",
            );
            if (res.status === 200) {
              // Merge Items fields with VelavanItem fields (VelavanItem takes priority)
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

  // Search filter effect
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

  // Calculate stock (total_quantity - approved_quantity)
  const calculateStock = (item) => {
    const total = item.total_quantity || 0;
    const approved = item.approved_quantity || 0;
    return total - approved;
  };

  // Delete item (soft delete)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiRequest(`${HMSURL}velavan_delete_item/${id}/`, "PATCH");
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Edit
  const handleEdit = (item) => {
    setEditingItem(item._id || item.id);
    setForm({ ...item });
  };

  // Save
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
                  colSpan={8}
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
                const stock = calculateStock(item);

                return (
                  <Tr key={id}>
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
                          <ActionButton
                            color="blue"
                            onClick={() => handleEdit(item)}
                          >
                            <FiEdit />
                          </ActionButton>
                          <ActionButton
                            color="red"
                            onClick={() => handleDelete(id)}
                          >
                            <FiTrash2 />
                          </ActionButton>
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
    </div>
  );
};

export default VelavanItemList;
