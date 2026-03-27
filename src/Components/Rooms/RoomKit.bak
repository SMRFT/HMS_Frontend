import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Button, ButtonContainer,
  TableWrapper, Table, Th, Td, Tr, SectionHeader,
} from "../GlobalStyles";

const RoomKit = () => {
  const [kits, setKits] = useState([]);

  const defaultForm = { name: "", is_active: true };
  const [formData, setFormData]   = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchKits(); }, []);

  const fetchKits = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-kit-description/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setKits(list);
    } catch { toast.error("Failed to fetch room kits"); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (kit) => {
    setEditingId(kit.id);
    setFormData({ name: kit.name, is_active: kit.is_active });
    window.scrollTo(0, 0);
  };

  // Soft delete: backend sets is_active = false
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this kit item? (It will be set inactive)")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}room-kit-description/${id}/`, "DELETE");
      if (res && !res.error) { toast.success("Kit item deleted"); fetchKits(); }
      else toast.error(res?.error || "Delete failed");
    } catch { toast.error("Failed to delete kit item"); }
  };

  const handleReset = () => { setEditingId(null); setFormData(defaultForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Kit Name is required");

    try {
      if (editingId) {
        const res = await apiRequest(`${HmsBaseUrl}room-kit-description/${editingId}/`, "PUT", formData);
        if (res && !res.error) { toast.success("Room Kit updated"); handleReset(); fetchKits(); }
        else toast.error(res?.error || "Update failed");
      } else {
        const res = await apiRequest(`${HmsBaseUrl}room-kit-description/`, "POST", formData);
        if (res && !res.error) { toast.success("Room Kit added"); handleReset(); fetchKits(); }
        else toast.error(res?.error || "Create failed");
      }
    } catch { toast.error("Failed to save room kit"); }
  };

  return (
    <PageWrapper>
      <Container>
        <SectionHeader><h3>Room Kit Descriptions</h3></SectionHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <InputWrapper>
                <Label required>Kit Item Name</Label>
                <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Kit Item Name" required />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              {editingId && (
                <Button secondary type="button" onClick={handleReset}>Reset</Button>
              )}
              <Button type="submit">{editingId ? "Update" : "Save"}</Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: 16 }}>Kit Item List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <Tr><Th>Kit Item Name</Th><Th>Status</Th><Th>Actions</Th></Tr>
              </thead>
              <tbody>
                {kits.length === 0 ? (
                  <Tr><Td colSpan="3" style={{ textAlign: "center" }}>No kit items found</Td></Tr>
                ) : kits.map((kit) => (
                  <Tr key={kit.id}>
                    <Td>{kit.name}</Td>
                    <Td><span style={{ color: kit.is_active ? "#16a34a" : "#ef4444", fontWeight: 600 }}>{kit.is_active ? "Active" : "Inactive"}</span></Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button style={{ padding: "5px 12px", fontSize: "0.8rem" }} onClick={() => handleEdit(kit)}>Edit</Button>
                        <Button danger style={{ padding: "5px 12px", fontSize: "0.8rem" }} onClick={() => handleDelete(kit.id)}>Delete</Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </Container>
    </PageWrapper>
  );
};

export default RoomKit;