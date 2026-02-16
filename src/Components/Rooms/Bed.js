import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container, PageWrapper, FormContent, FormRow,
  InputWrapper, Label, Input, Select, Button,
  ButtonContainer, TableWrapper, Table, Th, Td, Tr, SectionHeader,
} from "../GlobalStyles";
import styled from "styled-components";

const ToggleSwitch = styled.button`
  width: 48px; height: 26px; border-radius: 13px; border: none; cursor: pointer;
  background: ${(p) => (p.on ? "#ef4444" : "#d1d5db")};
  position: relative; transition: background 0.2s; flex-shrink: 0;
  &::after {
    content: ""; position: absolute; top: 3px;
    left: ${(p) => (p.on ? "25px" : "3px")};
    width: 20px; height: 20px; border-radius: 50%;
    background: #fff; transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  }
`;

const Bed = () => {
  const [beds, setBeds]   = useState([]);
  const [rooms, setRooms] = useState([]);

  const defaultForm = {
    bed_number: "", room: "", bed_status: "Available",
    blocked: false, blocked_reason: "",
  };
  const [formData, setFormData]     = useState(defaultForm);
  const [editingId, setEditingId]   = useState(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => { fetchBeds(); fetchRooms(); }, []);

  const fetchBeds = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}bed/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setBeds(list);
    } catch { toast.error("Failed to fetch beds"); }
  };

  const fetchRooms = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}room/`, "GET");
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setRooms(list);
    } catch { toast.error("Failed to fetch rooms"); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = (bed) => {
    setEditingId(bed.id);
    setFormData({
      bed_number: bed.bed_number,
      room: bed.room,
      bed_status: bed.bed_status,
      blocked: bed.blocked ?? false,
      blocked_reason: bed.blocked_reason || "",
    });
    window.scrollTo(0, 0);
  };

  // Soft delete: is_active = false (handled by backend DELETE view)
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bed? (It will be set inactive)")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}bed/${id}/`, "DELETE");
      if (res && !res.error) { toast.success("Bed deleted"); fetchBeds(); }
      else toast.error(res?.error || "Delete failed");
    } catch { toast.error("Failed to delete bed"); }
  };

  const handleReset = () => { setEditingId(null); setFormData(defaultForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.room)       return toast.warning("Please select a room");
    if (!formData.bed_number) return toast.warning("Bed number is required");
    if (formData.blocked && !formData.blocked_reason.trim())
      return toast.warning("Please provide a blocking reason");

    const payload = { ...formData, blocked_reason: formData.blocked ? formData.blocked_reason : "" };

    try {
      if (editingId) {
        const res = await apiRequest(`${HmsBaseUrl}bed/${editingId}/`, "PUT", payload);
        if (res && !res.error) { toast.success("Bed updated"); handleReset(); fetchBeds(); }
        else toast.error(res?.error || "Update failed");
      } else {
        const res = await apiRequest(`${HmsBaseUrl}bed/`, "POST", payload);
        if (res && !res.error) { toast.success("Bed added"); handleReset(); fetchBeds(); }
        else toast.error(res?.error || "Create failed");
      }
    } catch { toast.error("Failed to save bed"); }
  };

  const getRoomName = (roomId) => {
    const r = rooms.find((rm) => rm.id === roomId);
    return r ? r.room_number : roomId;
  };

  return (
    <PageWrapper>
      <Container>
        <SectionHeader><h3>Bed Management</h3></SectionHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <InputWrapper>
                <Label required>Room</Label>
                <Select name="room" value={formData.room} onChange={handleChange} required>
                  <option value="">Select Room</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                </Select>
              </InputWrapper>
              <InputWrapper>
                <Label required>Bed Number</Label>
                <Input type="text" name="bed_number" value={formData.bed_number} onChange={handleChange} required placeholder="e.g. B-101" />
              </InputWrapper>
              <InputWrapper>
                <Label>Bed Status</Label>
                <Select name="bed_status" value={formData.bed_status} onChange={handleChange}>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </Select>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <InputWrapper>
                <Label>Blocked</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <ToggleSwitch
                    type="button"
                    on={formData.blocked}
                    onClick={() => setFormData((p) => ({
                      ...p, blocked: !p.blocked,
                      blocked_reason: !p.blocked ? p.blocked_reason : "",
                    }))}
                  />
                  <span style={{ fontSize: "0.9rem", color: formData.blocked ? "#ef4444" : "#6b7280", fontWeight: 500 }}>
                    {formData.blocked ? "Yes" : "No"}
                  </span>
                </div>
              </InputWrapper>

              {formData.blocked && (
                <InputWrapper style={{ flex: 2 }}>
                  <Label required>Blocked Reason</Label>
                  <Input type="text" name="blocked_reason" value={formData.blocked_reason} onChange={handleChange} placeholder="e.g. Under repair" required />
                </InputWrapper>
              )}
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit">{editingId ? "Update Bed" : "Add Bed"}</Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: 16 }}>Bed List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Room</Th><Th>Bed Number</Th><Th>Status</Th>
                  <Th>Blocked</Th><Th>Reason</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {beds.length === 0 ? (
                  <Tr><Td colSpan="6" style={{ textAlign: "center" }}>No beds found</Td></Tr>
                ) : beds.map((bed) => (
                  <Tr key={bed.id}>
                    <Td>{getRoomName(bed.room)}</Td>
                    <Td>{bed.bed_number}</Td>
                    <Td>
                      <span style={{ color: bed.bed_status === "Available" ? "#16a34a" : bed.bed_status === "Occupied" ? "#ef4444" : "#f59e0b", fontWeight: 600 }}>
                        {bed.bed_status}
                      </span>
                    </Td>
                    <Td><span style={{ color: bed.blocked ? "#ef4444" : "#16a34a", fontWeight: 600 }}>{bed.blocked ? "Yes" : "No"}</span></Td>
                    <Td>{bed.blocked ? (bed.blocked_reason || "—") : "—"}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button style={{ padding: "5px 12px", fontSize: "0.8rem" }} onClick={() => handleEdit(bed)}>Edit</Button>
                        <Button danger style={{ padding: "5px 12px", fontSize: "0.8rem" }} onClick={() => handleDelete(bed.id)}>Delete</Button>
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

export default Bed;