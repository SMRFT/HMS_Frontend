import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Button, ButtonContainer,
  TableWrapper, Table, Th, Td, Tr, SectionHeader,
} from "../GlobalStyles";
import styled from "styled-components";

const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 11px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px 6px 0 0;
  margin-bottom: 16px;
`;
const PageTitle = styled.h2`
  font-size: .92rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: .04em;
`;

const RoomCategory = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData]     = useState({ name: "" });
  const [editingId, setEditingId]   = useState(null);   // holds room_category_id (integer)
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
      setCategories(response && !response.error && Array.isArray(response.data)
        ? response.data : []);
    } catch {
      toast.error("Failed to fetch room categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (category) => {
    // room_category_id is the PK (integer: 1, 2, 3 …)
    setEditingId(category.room_category_id);
    setFormData({ name: category.name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (category) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}room-category/${category.room_category_id}/`, "DELETE"
      );
      if (response && !response.error) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(response?.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}room-category/${editingId}/`, "PUT", formData
        );
        if (response && !response.error) {
          toast.success("Category updated successfully");
          handleReset();
          fetchCategories();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}room-category/`, "POST", formData
        );
        if (response && !response.error) {
          toast.success("Category added successfully");
          handleReset();
          fetchCategories();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save category");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>🏥 Room Category Management</PageTitle>
        </PageHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Room Category Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Room Category Name"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">
                {editingId ? "Update Category" : "Add Category"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "16px" }}>Category List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Category ID</Th>
                  <Th>Room Category Name</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <Tr>
                    <Td colSpan="4" style={{ textAlign: "center" }}>
                      No categories found
                    </Td>
                  </Tr>
                ) : (
                  categories.map((cat) => (
                    <Tr key={cat.room_category_id}>
                      <Td>{cat.room_category_id}</Td>
                      <Td>{cat.name}</Td>
                      <Td>
                        <span style={{ color: cat.is_active ? "green" : "red" }}>
                          {cat.is_active ? "Active" : "Inactive"}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(cat)}
                          >Edit</Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(cat)}
                          >Delete</Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </Container>
    </PageWrapper>
  );
};

export default RoomCategory;