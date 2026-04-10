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

const RoomServiceDescription = () => {
  const [descriptions, setDescriptions] = useState([]);
  const [formData, setFormData] = useState({ description_name: "" });
  const [editingId, setEditingId] = useState(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchDescriptions(); }, []);

  const fetchDescriptions = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}roomservice-description/`, "GET");
      setDescriptions(response && !response.error && Array.isArray(response.data)
        ? response.data : []);
    } catch {
      toast.error("Failed to fetch room service descriptions");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (desc) => {
    setEditingId(desc.description_id);
    setFormData({ description_name: desc.description_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (desc) => {
    if (!window.confirm("Are you sure you want to delete this description?")) return;
    try {
      const response = await apiRequest(`${HmsBaseUrl}roomservice-description/${desc.description_id}/`, "DELETE");
      if (response && !response.error) {
        toast.success("Description deleted successfully");
        fetchDescriptions();
      } else {
        toast.error(response?.error || "Failed to delete description");
      }
    } catch {
      toast.error("Failed to delete description");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ description_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(`${HmsBaseUrl}roomservice-description/${editingId}/`, "PUT", formData);
        if (response && !response.error) {
          toast.success("Description updated successfully");
          handleReset();
          fetchDescriptions();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(`${HmsBaseUrl}roomservice-description/`, "POST", formData);
        if (response && !response.error) {
          toast.success("Description added successfully");
          handleReset();
          fetchDescriptions();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save description");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>🏥 Room Service Description Management</PageTitle>
        </PageHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Description Name</Label>
                <Input
                  type="text"
                  name="description_name"
                  value={formData.description_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Description Name"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">
                {editingId ? "Update Description" : "Add Description"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "16px" }}>Room Service Description List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Description ID</Th>
                  <Th>Description Name</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {descriptions.length === 0 ? (
                  <Tr>
                    <Td colSpan="3" style={{ textAlign: "center" }}>No descriptions found</Td>
                  </Tr>
                ) : (
                  descriptions.map((desc) => (
                    <Tr key={desc.description_id}>
                      <Td>{desc.description_id}</Td>
                      <Td>{desc.description_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleEdit(desc)}>Edit</Button>
                          <Button danger style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleDelete(desc)}>Delete</Button>
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

export default RoomServiceDescription;