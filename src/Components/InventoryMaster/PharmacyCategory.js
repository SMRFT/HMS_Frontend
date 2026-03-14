import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Button, ButtonContainer,
  TableWrapper, Table, Th, Td, Tr, SectionHeader,
} from "../GlobalStyles";

const PharmacyCategory = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData]     = useState({ category_name: "" });
  const [editingId, setEditingId]   = useState(null); // holds category_id (integer)

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchCategories(); }, []);

  // ── API ────────────────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}pharmacy-category/`, "GET");
      setCategories(
        response && !response.error && Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (category) => {
    setEditingId(category.category_id);
    setFormData({ category_name: category.category_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (category) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}pharmacy-category/${category.category_id}/`,
        "DELETE"
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
    setFormData({ category_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}pharmacy-category/${editingId}/`,
          "PUT",
          formData
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
          `${HmsBaseUrl}pharmacy-category/`,
          "POST",
          formData
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Container>
        <SectionHeader>
          <h3>Pharmacy Category Management</h3>
        </SectionHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Category Name</Label>
                <Input
                  type="text"
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Category Name"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">
                {editingId ? "Update Category" : "Add Category"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "16px" }}>
            Category List
          </h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Category ID</Th>
                  <Th>Category Name</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <Tr>
                    <Td colSpan="3" style={{ textAlign: "center" }}>
                      No categories found
                    </Td>
                  </Tr>
                ) : (
                  categories.map((category) => (
                    <Tr key={category.category_id}>
                      <Td>{category.category_id}</Td>
                      <Td>{category.category_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(category)}
                          >
                            Delete
                          </Button>
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

export default PharmacyCategory;