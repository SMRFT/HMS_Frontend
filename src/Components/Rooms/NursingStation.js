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
const NursingStation = () => {
  const [wards, setWards] = useState([]);
  const [formData, setFormData] = useState({ ward_name: "" });
  const [editingId, setEditingId] = useState(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchWards(); }, []);

  const fetchWards = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}nursingstation/`, "GET");
      setWards(response && !response.error && Array.isArray(response.data)
        ? response.data : []);
    } catch {
      toast.error("Failed to fetch nursing stations");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (ward) => {
    setEditingId(ward.ward_id);
    setFormData({ ward_name: ward.ward_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (ward) => {
    if (!window.confirm("Are you sure you want to delete this nursing station?")) return;
    try {
      const response = await apiRequest(`${HmsBaseUrl}nursingstation/${ward.ward_id}/`, "DELETE");
      if (response && !response.error) {
        toast.success("Nursing station deleted successfully");
        fetchWards();
      } else {
        toast.error(response?.error || "Failed to delete nursing station");
      }
    } catch {
      toast.error("Failed to delete nursing station");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ ward_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(`${HmsBaseUrl}nursingstation/${editingId}/`, "PUT", formData);
        if (response && !response.error) {
          toast.success("Nursing station updated successfully");
          handleReset();
          fetchWards();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(`${HmsBaseUrl}nursingstation/`, "POST", formData);
        if (response && !response.error) {
          toast.success("Nursing station added successfully");
          handleReset();
          fetchWards();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save nursing station");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>🏥 Nursing Station</PageTitle>
        </PageHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
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
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">
                {editingId ? "Update Nursing Station" : "Add Nursing Station"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "16px" }}>Nursing Station List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Ward ID</Th>
                  <Th>Ward Name</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {wards.length === 0 ? (
                  <Tr>
                    <Td colSpan="3" style={{ textAlign: "center" }}>No nursing stations found</Td>
                  </Tr>
                ) : (
                  wards.map((ward) => (
                    <Tr key={ward.ward_id}>
                      <Td>{ward.ward_id}</Td>
                      <Td>{ward.ward_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleEdit(ward)}>Edit</Button>
                          <Button danger style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleDelete(ward)}>Delete</Button>
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

export default NursingStation;