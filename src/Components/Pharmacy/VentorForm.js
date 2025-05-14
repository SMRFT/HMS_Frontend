import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaEdit, FaTrash } from "react-icons/fa";
const Container = styled.div`
  margin-top: 60px;
  max-width: 1170px;
  padding: 20px;
  background: #D9E6E8;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-family: "Arial", sans-serif;
`;
const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #15616D;
  font-size: 24px;
`;
const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
`;
const Input = styled.input`
  padding: 8px;
  width: 60%;
  border: 1px solid #ccc;
  border-radius: 4px;
`;
const AddButton = styled.button`
  padding: 8px 12px;
  background-color: #15616D;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #114D56;
  }
`;
const FormContainer = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;
const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;
const SaveButton = styled.button`
  padding: 8px 12px;
  background-color: #1D7686;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  &:hover {
    background-color: #145D67;
  }
`;
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;
const TableHeader = styled.th`
  background: #15616D;
  color: white;
  padding: 12px 15px;
  text-align: left;
  font-size: 14px;
`;
const TableRow = styled.tr`
  &:nth-child(even) {
    background: #E2F1F3;
  }
  &:hover {
    background: #E2F1F3;
  }
`;
const TableCell = styled.td`
  padding: 12px 15px;
  color: #333;
  font-size: 14px;
  text-align: left;
`;
const IconContainer = styled.div`
  display: flex;
  gap: 10px;
  svg {
    cursor: pointer;
    &:hover {
      color: #15616D;
    }
  }
`;
const VentorForm = () => {
  const [ventors, setVentors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVentor, setNewVentor] = useState({
    ventor_name: "",
    supplier_type: "",
    phone: "",
    landline: "",
    address: "",
    gst_number: "",
  });
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    fetchVentors();
  }, []);
  const fetchVentors = async () => {
    try {
      const response = await axios.get("https://hms.shinovadatabase.in/ventor/");
      setVentors(response.data);
    } catch (error) {
      console.error("Error fetching ventors:", error);
    }
  };
  const handleSave = async () => {
    if (newVentor.ventor_name) {
      try {
        if (isEditing) {
          // Update the ventor
          await axios.patch("https://hms.shinovadatabase.in/ventor/", newVentor, {
            params: { ventor_name: newVentor.ventor_name },
          });
          setIsEditing(false);
        } else {
          // Add a new ventor
          await axios.post("https://hms.shinovadatabase.in/ventor/", newVentor);
        }
        // Reset form and refresh data
        setNewVentor({
          ventor_name: "",
          supplier_type: "",
          phone: "",
          landline: "",
          address: "",
          gst_number: "",
        });
        setShowAddForm(false);
        fetchVentors();
      } catch (error) {
        console.error("Error saving ventor:", error);
      }
    }
  };
  const handleDelete = async (ventor_name) => {
    try {
      await axios.delete("https://hms.shinovadatabase.in/ventor/", {
        params: { ventor_name },
      });
      fetchVentors();
    } catch (error) {
      console.error("Error deleting ventor:", error);
    }
  };
  const handleEdit = (ventor) => {
    setNewVentor(ventor);
    setShowAddForm(true);
    setIsEditing(true);
  };
  const filteredVentors = ventors.filter(
    (ventor) =>
      ventor.ventor_name.toLowerCase().includes(search.toLowerCase()) ||
      ventor.supplier_type.toLowerCase().includes(search.toLowerCase()) ||
      ventor.gst_number.includes(search)
  );
  return (
    <Container>
      <Title>Ventor Management</Title>
      <ControlsContainer>
        <Input
          type="text"
          placeholder="Search by Name, Type or GST"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AddButton onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "- Hide Form" : "+ Add New Ventor"}
        </AddButton>
      </ControlsContainer>
      {showAddForm && (
        <FormContainer>
          <FormRow>
            <Input
              placeholder="Name"
              value={newVentor.ventor_name}
              onChange={(e) => setNewVentor({ ...newVentor, ventor_name: e.target.value })}
            />
            <Input
              placeholder="Type (Supplier/Manufacturer/Both)"
              value={newVentor.supplier_type}
              onChange={(e) => setNewVentor({ ...newVentor, supplier_type: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={newVentor.phone}
              onChange={(e) => setNewVentor({ ...newVentor, phone: e.target.value })}
            />
          </FormRow>
          <FormRow>
            <Input
              placeholder="Landline"
              value={newVentor.landline}
              onChange={(e) => setNewVentor({ ...newVentor, landline: e.target.value })}
            />
            <Input
              placeholder="GST Number"
              value={newVentor.gst_number}
              onChange={(e) => setNewVentor({ ...newVentor, gst_number: e.target.value })}
            />
          </FormRow>
          <FormRow>
            <Input
              placeholder="Address"
              value={newVentor.address}
              onChange={(e) => setNewVentor({ ...newVentor, address: e.target.value })}
            />
            <SaveButton onClick={handleSave}>{isEditing ? "Save Changes" : "Add Ventor"}</SaveButton>
          </FormRow>
        </FormContainer>
      )}
      <StyledTable>
        <thead>
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Phone</TableHeader>
            <TableHeader>GST</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredVentors.map((ventor) => (
            <TableRow key={ventor.ventor_name}>
              <TableCell>{ventor.ventor_name}</TableCell>
              <TableCell>{ventor.supplier_type}</TableCell>
              <TableCell>{ventor.phone}</TableCell>
              <TableCell>{ventor.gst_number}</TableCell>
              <TableCell>
                <IconContainer>
                  <FaEdit onClick={() => handleEdit(ventor)} />
                  <FaTrash onClick={() => handleDelete(ventor.ventor_name)} />
                </IconContainer>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </StyledTable>
    </Container>
  );
};
export default VentorForm;