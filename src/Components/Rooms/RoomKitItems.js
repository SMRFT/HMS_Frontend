import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Button, ButtonContainer,
  TableWrapper, Table, Th, Td, Tr, SectionHeader,
} from "../GlobalStyles";

const RoomKitItems = () => {
  const [kitItems, setKitItems] = useState([]);
  const [formData, setFormData] = useState({ kit_name: "" });
  const [editingId, setEditingId] = useState(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchKitItems(); }, []);

  const fetchKitItems = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-kititems/`, "GET");
      setKitItems(response && !response.error && Array.isArray(response.data)
        ? response.data : []);
    } catch {
      toast.error("Failed to fetch room kit items");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (item) => {
    setEditingId(item.kit_id);
    setFormData({ kit_name: item.kit_name });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this kit item?")) return;
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-kititems/${item.kit_id}/`, "DELETE");
      if (response && !response.error) {
        toast.success("Kit item deleted successfully");
        fetchKitItems();
      } else {
        toast.error(response?.error || "Failed to delete kit item");
      }
    } catch {
      toast.error("Failed to delete kit item");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({ kit_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(`${HmsBaseUrl}room-kititems/${editingId}/`, "PUT", formData);
        if (response && !response.error) {
          toast.success("Kit item updated successfully");
          handleReset();
          fetchKitItems();
        } else {
          toast.error(response?.error || "Update failed");
        }
      } else {
        const response = await apiRequest(`${HmsBaseUrl}room-kititems/`, "POST", formData);
        if (response && !response.error) {
          toast.success("Kit item added successfully");
          handleReset();
          fetchKitItems();
        } else {
          toast.error(response?.error || "Create failed");
        }
      }
    } catch {
      toast.error("Failed to save kit item");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <SectionHeader><h3>Room Kit Items Management</h3></SectionHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label required>Kit Name</Label>
                <Input
                  type="text"
                  name="kit_name"
                  value={formData.kit_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter Kit Name"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">
                {editingId ? "Update Kit Item" : "Add Kit Item"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "16px" }}>Room Kit Items List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Kit ID</Th>
                  <Th>Kit Name</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {kitItems.length === 0 ? (
                  <Tr>
                    <Td colSpan="3" style={{ textAlign: "center" }}>No kit items found</Td>
                  </Tr>
                ) : (
                  kitItems.map((item) => (
                    <Tr key={item.kit_id}>
                      <Td>{item.kit_id}</Td>
                      <Td>{item.kit_name}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleEdit(item)}>Edit</Button>
                          <Button danger style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => handleDelete(item)}>Delete</Button>
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

export default RoomKitItems;