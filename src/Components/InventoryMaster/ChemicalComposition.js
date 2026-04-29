import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Button, ButtonContainer,
  TableWrapper, Table, Th, Td, Tr,
} from "../GlobalStyles";
import styled from "styled-components";

// ─── Header (matches PharmacyItem gradient style) ─────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 18px 24px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
`;

const PageSubtitle = styled.p`
  margin: 3px 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
`;

const SectionTitle = styled.h4`
  color: #0d9488;
  margin: 0 0 16px;
  font-size: 0.95rem;
  font-weight: 700;
`;

// ─────────────────────────────────────────────────────────────────────────────

const ChemicalComposition = () => {
  const [compositions, setCompositions] = useState([]);
  const [formData, setFormData]         = useState({ composition_name: "" });
  const [editingId, setEditingId]       = useState(null);

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchCompositions(); }, []);

  // ── API ──────────────────────────────────────────────────────────────────

  const fetchCompositions = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}chemical-composition/`, "GET");
      setCompositions(
        response && !response.error && Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch {
      toast.error("Failed to fetch compositions");
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (composition) => {
    setEditingId(composition.composition_id);
    setFormData({ composition_name: composition.composition_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (composition) => {
    if (!window.confirm("Are you sure you want to delete this composition?")) return;
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}chemical-composition/${composition.composition_id}/`,
        "DELETE"
      );
      if (response && !response.error) {
        toast.success("Composition deleted successfully");
        fetchCompositions();
      } else {
        toast.error(response?.error || "Failed to delete composition");
      }
    } catch {
      toast.error("Failed to delete composition");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ composition_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.composition_name.trim()) {
      toast.error("Composition name is required");
      return;
    }
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}chemical-composition/${editingId}/`,
          "PUT",
          formData
        );
        if (response && !response.error) {
          toast.success("Composition updated successfully");
          handleReset();
          fetchCompositions();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}chemical-composition/`,
          "POST",
          formData
        );
        if (response && !response.error) {
          toast.success("Composition added successfully");
          handleReset();
          fetchCompositions();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save composition");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper>
      <Container>

        {/* ── Header ── */}
        <PageHeader>
          <div>
            <PageTitle>🧪 Chemical Composition</PageTitle>
            <PageSubtitle>Manage chemical composition master data</PageSubtitle>
          </div>
        </PageHeader>

        {/* ── Form ── */}
        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Composition Name</Label>
                <Input
                  type="text"
                  name="composition_name"
                  value={formData.composition_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Composition Name (e.g. Paracetamol 500mg)"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">
                {editingId ? "Update Composition" : "Add Composition"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        {/* ── Table ── */}
        <div style={{ padding: "0 24px 24px" }}>
          <SectionTitle>Composition List</SectionTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Composition ID</Th>
                  <Th>Composition Name</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {compositions.length === 0 ? (
                  <Tr>
                    <Td colSpan="3" style={{ textAlign: "center" }}>
                      No compositions found
                    </Td>
                  </Tr>
                ) : (
                  compositions.map((comp) => (
                    <Tr key={comp.composition_id}>
                      <Td>{comp.composition_id}</Td>
                      <Td>{comp.composition_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(comp)}
                          >
                            Edit
                          </Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(comp)}
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

export default ChemicalComposition;