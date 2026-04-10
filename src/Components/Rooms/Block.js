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


const Block = () => {
  const [blocks, setBlocks]     = useState([]);
  const [formData, setFormData] = useState({ block_name: "" });
  const [editingId, setEditingId] = useState(null);   // holds block_id (integer)
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchBlocks(); }, []);

  const fetchBlocks = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}block/`, "GET");
      setBlocks(response && !response.error && Array.isArray(response.data)
        ? response.data : []);
    } catch {
      toast.error("Failed to fetch blocks");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (block) => {
    // block_id is now the PK (integer: 1, 2, 3 …)
    setEditingId(block.block_id);
    setFormData({ block_name: block.block_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (block) => {
    if (!window.confirm("Are you sure you want to delete this block?")) return;
    try {
      const response = await apiRequest(
        `${HmsBaseUrl}block/${block.block_id}/`, "DELETE"
      );
      if (response && !response.error) {
        toast.success("Block deleted successfully");
        fetchBlocks();
      } else {
        toast.error(response?.error || "Failed to delete block");
      }
    } catch {
      toast.error("Failed to delete block");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ block_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}block/${editingId}/`, "PUT", formData
        );
        if (response && !response.error) {
          toast.success("Block updated successfully");
          handleReset();
          fetchBlocks();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}block/`, "POST", formData
        );
        if (response && !response.error) {
          toast.success("Block added successfully");
          handleReset();
          fetchBlocks();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save block");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <PageTitle>🏥 Block</PageTitle>
        </PageHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Block Name</Label>
                <Input
                  type="text"
                  name="block_name"
                  value={formData.block_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Block Name"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">
                {editingId ? "Update Block" : "Add Block"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "16px" }}>Block List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Block ID</Th>
                  <Th>Block Name</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {blocks.length === 0 ? (
                  <Tr>
                    <Td colSpan="4" style={{ textAlign: "center" }}>
                      No blocks found
                    </Td>
                  </Tr>
                ) : (
                  blocks.map((block) => (
                    <Tr key={block.block_id}>
                      <Td>{block.block_id}</Td>
                      <Td>{block.block_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(block)}
                          >Edit</Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(block)}
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

export default Block;