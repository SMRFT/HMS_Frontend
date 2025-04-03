import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaEdit, FaTrash } from "react-icons/fa";

const Container = styled.div`
  margin-top: 60px;
  margin-left: 280px;
  max-width: 1170px;
  padding: 20px;
  background: #d9e6e8;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif; /* Custom font */
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #15616d;
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
  background-color: #15616d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #114d56;
  }
`;

const FormContainer = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif; /* Custom font */
  font-size:14px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SaveButton = styled.button`
  padding: 8px 12px;
  background-color: #1d7686;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;

  &:hover {
    background-color: #145d67;
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
  background: #15616d;
  color: white;
  padding: 12px 15px;
  text-align: left;
  font-size: 14px;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #e2f1f3;
  }
  &:hover {
    background: #e2f1f3;
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
      color: #15616d;
    }
  }
`;

const HSNCodeForm = () => {
  const [hsnCodes, setHsnCodes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState({
    chapter: "",
    hsn_code: "",
    description: "",
    tax: "",
  });
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);  // Track if we are editing or adding a new entry

  useEffect(() => {
    fetchHsnCodes();
  }, []);

  const fetchHsnCodes = async () => {
    try {
      const response = await axios.get("https://hms.shinovadatabase.in/hsncodes/");
      setHsnCodes(response.data);
    } catch (error) {
      console.error("Error fetching HSN Codes:", error);
    }
  };

  const handleAddHsnCode = async () => {
    try {
      // POST request to add new HSN code
      await axios.post("https://hms.shinovadatabase.in/hsncodes/", newCode);
      setNewCode({ chapter: "", hsn_code: "", description: "", tax: "" });
      setShowAddForm(false);
      fetchHsnCodes(); // Refresh the table
    } catch (error) {
      console.error("Error adding HSN Code:", error);
    }
  };

  const handleDelete = async (hsnCode) => {
    try {
      await axios.delete("https://hms.shinovadatabase.in/hsncodes/", { params: { hsn_code: hsnCode } });
      fetchHsnCodes(); // Refresh the table after deletion
    } catch (error) {
      console.error("Error deleting HSN Code:", error);
    }
  };

  const handleEdit = (code) => {
    setNewCode(code); // Populate the form with the selected HSN Code data
    setShowAddForm(true); // Show the form for editing
    setIsEditing(true); // Set the form mode to editing
  };

  const handleSave = async () => {
    if (newCode.hsn_code) {
      try {
        // Ensure hsn_code is being sent as a string
        const hsnCode = String(newCode.hsn_code);
        const updatedCode = { ...newCode, hsn_code: hsnCode };
        
        if (isEditing) {
          await axios.put("https://hms.shinovadatabase.in/hsncodes/", updatedCode);
          setIsEditing(false);
        } else {
          await handleAddHsnCode();
        }
        setNewCode({ chapter: "", hsn_code: "", description: "", tax: "" });
        setShowAddForm(false);
        fetchHsnCodes();
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    }
  };
  

  const filteredCodes = hsnCodes.filter(
    (code) =>
      code.hsn_code.includes(search) ||
      code.chapter.toLowerCase().includes(search.toLowerCase()) ||
      code.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Title>HSN Code Management</Title>
      <ControlsContainer>
        <Input
          type="text"
          placeholder="Search by HSN Code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AddButton onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "- Hide Add Form" : "+ Add New HSN Code"}
        </AddButton>
      </ControlsContainer>

      {showAddForm && (
        <FormContainer>
          <FormRow>
            <Input
              placeholder="Chapter"
              value={newCode.chapter}
              onChange={(e) => setNewCode({ ...newCode, chapter: e.target.value })}
            />
            <Input
              placeholder="HSN Code"
              value={newCode.hsn_code}
              onChange={(e) => setNewCode({ ...newCode, hsn_code: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newCode.description}
              onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
            />
            <Input
              placeholder="Tax"
              type="number"
              value={newCode.tax}
              onChange={(e) => setNewCode({ ...newCode, tax: e.target.value })}
            />
            <SaveButton onClick={handleSave}>
              {isEditing ? "Save Changes" : "Save New Code"}
            </SaveButton>
          </FormRow>
        </FormContainer>
      )}

      <StyledTable>
        <thead>
          <tr>
            <TableHeader>Chapter</TableHeader>
            <TableHeader>HSN Code</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Tax</TableHeader>
            <TableHeader>Action</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredCodes.map((code) => (
            <TableRow key={code.hsn_code}>
              <TableCell>{code.chapter}</TableCell>
              <TableCell>{code.hsn_code}</TableCell>
              <TableCell>{code.description}</TableCell>
              <TableCell>{code.tax}</TableCell>
              <TableCell>
                <IconContainer>
                  <FaEdit onClick={() => handleEdit(code)} />
                  <FaTrash onClick={() => handleDelete(code.hsn_code)} />
                </IconContainer>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </StyledTable>
    </Container>
  );
};

export default HSNCodeForm;