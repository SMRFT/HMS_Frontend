import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  PageWrapper,
  FormContent,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Button,
  ButtonContainer,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  SectionHeader,
  TextArea,
} from "../GlobalStyles";

const RoomCategory = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ ward_name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
      if (response && !response.error) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      toast.error("Failed to fetch room categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      ward_name: category.ward_name,
      description: category.description || ""
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await apiRequest(`${HmsBaseUrl}room-category/${id}/`, "DELETE");
        if (response) {
          toast.success("Category deleted successfully");
          fetchCategories();
        }
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ ward_name: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}room-category/${editingId}/`,
          "PUT",
          formData
        );
        if (response && !response.error) {
          toast.success("Category updated successfully");
          handleReset();
          fetchCategories();
        } else {
          toast.error(response.error || "Update failed");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}room-category/`,
          "POST",
          formData
        );
        if (response && !response.error) {
          toast.success("Category added successfully");
          handleReset();
          fetchCategories();
        } else {
          toast.error(response.error || "Create failed");
        }
      }
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <SectionHeader>
          <h3>Room Category Management</h3>
        </SectionHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <InputWrapper>
                <Label required>Ward Name</Label>
                <Input
                  type="text"
                  name="ward_name"
                  value={formData.ward_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Ward Name"
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter Description"
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
          <h4 style={{ color: "#0d9488", marginBottom: "16px" }}>Category List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Ward Name</Th>
                  <Th>Description</Th>
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
                    <Tr key={cat.id}>
                      <Td>{cat.ward_name}</Td>
                      <Td>{cat.description}</Td>
                      <Td>
                        <span style={{ color: cat.is_active ? 'green' : 'red' }}>
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(cat)}
                          >
                            Edit
                          </Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(cat.id)}
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

export default RoomCategory;