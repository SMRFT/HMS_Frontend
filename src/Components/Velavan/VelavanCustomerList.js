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

const sortByName = (arr) =>
  [...arr].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

const VelavanCustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({});
  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canEdit = allowedActions.includes("HMS-P-VCE-RW");
  const canDelete = allowedActions.includes("HMS-P-VCD-RW");

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const fetchCustomers = async () => {
    try {
      const res = await apiRequest(`${HMSURL}velavan_customers/list/`, "GET");
      if (res.status === 200 && res.data.status === "success") {
        const sorted = sortByName(res.data.data);
        setCustomers(sorted);
        setFilteredCustomers(sorted);
      } else {
        console.error("Failed to fetch customers", res.data);
      }
    } catch (err) {
      console.error("Error fetching customers", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await apiRequest(`${HMSURL}velavan_delete_customer/${id}/`, "PATCH");
      setCustomers((prevCustomers) =>
        prevCustomers.filter(
          (customer) => (customer._id || customer.customer_id) !== id,
        ),
      );
      fetchCustomers();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer.customer_id);
    setForm({ ...customer });
  };

  const handleSave = async () => {
    try {
      await apiRequest(
        `${HMSURL}velavan_update_customer/${editingCustomer}/`,
        "PATCH",
        form,
      );
      setEditingCustomer(null);
      setForm({});
      fetchCustomers();
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
        <h2>Customer Management</h2>
        <ActionButton
          color={colors.success}
          onClick={() => navigate("/AddVelavanCustomers")}
          title="Add new customer"
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
          <FiPlus /> Add Customer
        </ActionButton>
      </HeaderContainer>

      <SearchContainer>
        <SearchIconWrapper>
          <FiSearch />
          <SearchInput
            type="text"
            placeholder="Search by Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </SearchIconWrapper>
      </SearchContainer>

      <div
        style={{
          marginBottom: "10px",
          fontSize: "0.9rem",
          color: colors.textMuted,
        }}
      >
        Showing <strong>{filteredCustomers.length}</strong>
        {searchQuery && filteredCustomers.length !== customers.length
          ? ` of ${customers.length}`
          : ""}{" "}
        customer{customers.length !== 1 ? "s" : ""}
      </div>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Customer ID</Th>
              <Th>Name</Th>
              <Th>Customer Type</Th>
              <Th>Company Name</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
              <Th>Address</Th>
              <Th>City</Th>
              <Th>State</Th>
              <Th>Pincode</Th>
              <Th>GSTIN</Th>
              <Th>PAN</Th>
              <Th>MSME</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <Tr>
                <Td
                  colSpan={12}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  {searchQuery
                    ? "No customers found matching your search"
                    : "No customers found"}
                </Td>
              </Tr>
            ) : (
              filteredCustomers.map((customer) => {
                const id = customer.customer_id;
                const isEditing = editingCustomer === id;
                return (
                  <Tr key={id || customer._id}>
                    <Td>{customer.customer_id || "-"}</Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                        />
                      ) : (
                        customer.name || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.customer_type}
                          onChange={(e) =>
                            handleChange("customer_type", e.target.value)
                          }
                        />
                      ) : (
                        customer.customer_type || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.company_name}
                          onChange={(e) =>
                            handleChange("company_name", e.target.value)
                          }
                        />
                      ) : (
                        customer.company_name || "-"
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
                        customer.phone || "-"
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
                        customer.email || "-"
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
                          {customer.addressLine1 || "-"} <br />
                          {customer.addressLine2 || ""}
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
                        customer.city || "-"
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
                        customer.state || "-"
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
                        customer.pincode || "-"
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
                        customer.gstin || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.pan}
                          onChange={(e) => handleChange("pan", e.target.value)}
                          maxLength={10}
                          style={{ textTransform: "uppercase" }}
                        />
                      ) : (
                        customer.pan || "-"
                      )}
                    </Td>
                    <Td>
                      {isEditing ? (
                        <Input
                          value={form.msme}
                          onChange={(e) => handleChange("msme", e.target.value)}
                        />
                      ) : (
                        customer.msme || "-"
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
                            onClick={() => setEditingCustomer(null)}
                          >
                            ❌ Cancel
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          {canEdit && (
                            <ActionButton
                              color="blue"
                              onClick={() => handleEdit(customer)}
                            >
                              <FiEdit />
                            </ActionButton>
                          )}
                          {canDelete && (
                            <ActionButton
                              color="red"
                              onClick={() => handleDelete(id)}
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
    </div>
  );
};

export default VelavanCustomerList;
