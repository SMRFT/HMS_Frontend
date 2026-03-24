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

// Action Button
const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 8px;
  font-size: 16px;
  color: ${(props) => props.color || colors.primary};
  transition: all 0.2s ease-in-out;

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

const VelavanVendorList = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVendor, setEditingVendor] = useState(null);
  const [form, setForm] = useState({});

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const fetchVendors = async () => {
    try {
      const res = await apiRequest(`${HMSURL}velavan_get_vendors/`, "GET");
      if (res.status === 200 && res.data.status === "success") {
        setVendors(res.data.data);
        setFilteredVendors(res.data.data);
      } else {
        console.error("Failed to fetch vendors", res.data);
      }
    } catch (err) {
      console.error("Error fetching vendors", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter((vendor) =>
        vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredVendors(filtered);
    }
  }, [searchQuery, vendors]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await apiRequest(`${HMSURL}velavan_delete_vendor/${id}/`, "PATCH");
      setVendors((prevVendors) =>
        prevVendors.filter((vendor) => (vendor._id || vendor.id) !== id),
      );
      fetchVendors();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor._id || vendor.id);
    setForm({ ...vendor });
  };

  const handleSave = async () => {
    try {
      await apiRequest(
        `${HMSURL}velavan_update_vendor/${editingVendor}/`,
        "PATCH",
        form,
      );
      setEditingVendor(null);
      setForm({});
      fetchVendors();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div>
      <HeaderContainer>
        <h2>Vendor Management</h2>
        <ActionButton
          color={colors.success}
          onClick={() => navigate("/AddVelavanVendors")}
          title="Add new vendor"
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
          <FiPlus /> Add Vendor
        </ActionButton>
      </HeaderContainer>

      <SearchContainer>
        <SearchIconWrapper>
          <FiSearch />
          <SearchInput
            type="text"
            placeholder="Search by Vendor Name..."
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
              <Th>Vendor ID</Th>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
              <Th>Address</Th>
              <Th>City</Th>
              <Th>State</Th>
              <Th>Pincode</Th>
              <Th>KGST/TIN</Th>
              <Th>GSTIN</Th>
              <Th>TDS %</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <Tr>
                <Td
                  colSpan={13}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  {searchQuery
                    ? "No vendors found matching your search"
                    : "No vendors found"}
                </Td>
              </Tr>
            ) : (
              filteredVendors.map((vendor) => {
                const id = vendor._id || vendor.id;
                const isEditing = editingVendor === id;
                return (
                  <Tr key={id}>
                    <Td>{vendor.vendor_id || "-"}</Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                        />
                      ) : (
                        vendor.name || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.contactPerson}
                          onChange={(e) =>
                            handleChange("contactPerson", e.target.value)
                          }
                        />
                      ) : (
                        vendor.contactPerson || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.phone}
                          onChange={(e) =>
                            handleChange("phone", e.target.value)
                          }
                        />
                      ) : (
                        vendor.phone || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.email}
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                        />
                      ) : (
                        vendor.email || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <>
                          <Input
                            value={form.addressLine1}
                            onChange={(e) =>
                              handleChange("addressLine1", e.target.value)
                            }
                          />
                          <Input
                            value={form.addressLine2}
                            onChange={(e) =>
                              handleChange("addressLine2", e.target.value)
                            }
                            style={{ marginTop: "4px" }}
                          />
                        </>
                      ) : (
                        <>
                          {vendor.addressLine1 || "-"} <br />
                          {vendor.addressLine2 || ""}
                        </>
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.city}
                          onChange={(e) => handleChange("city", e.target.value)}
                        />
                      ) : (
                        vendor.city || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.state}
                          onChange={(e) =>
                            handleChange("state", e.target.value)
                          }
                        />
                      ) : (
                        vendor.state || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.pincode}
                          onChange={(e) =>
                            handleChange("pincode", e.target.value)
                          }
                        />
                      ) : (
                        vendor.pincode || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.kgstTinNumber}
                          onChange={(e) =>
                            handleChange("kgstTinNumber", e.target.value)
                          }
                        />
                      ) : (
                        vendor.kgstTinNumber || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.gstin}
                          onChange={(e) =>
                            handleChange("gstin", e.target.value)
                          }
                        />
                      ) : (
                        vendor.gstin || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.tdsPercent}
                          onChange={(e) =>
                            handleChange("tdsPercent", e.target.value)
                          }
                        />
                      ) : (
                        vendor.tdsPercent || "-"
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
                            onClick={() => setEditingVendor(null)}
                          >
                            ❌ Cancel
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          <ActionButton
                            color="blue"
                            onClick={() => handleEdit(vendor)}
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

export default VelavanVendorList;
