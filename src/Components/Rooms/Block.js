import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 600px;
`;

const Header = styled.div`
  background: #007d8f;
  color: white;
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 6px 6px 0 0;
`;

const InputRow = styled.div`
  display: flex;
  margin-top: 10px;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  background: ${(props) => (props.cancel ? "#6c757d" : "#007d8f")};
  color: white;
  border-radius: 4px;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;

  th, td {
    padding: 10px;
    border-bottom: 1px solid #dee2e6;
    text-align: left;
  }
`;

export default function Block() {
    const [blockName, setBlockName] = useState("");
    const [blocks, setBlocks] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
  
    useEffect(() => {
      fetchBlocks();
    }, []);
  
    const fetchBlocks = async () => {
      const res = await axios.get("http://127.0.0.1:8000/blocks/");
      setBlocks(res.data);
    };
  
    const addBlock = async () => {
      if (!blockName) return;
      await axios.post("http://127.0.0.1:8000/blocks/", { block_name: blockName });
      setBlockName("");
      fetchBlocks();
    };
  
    const updateBlock = async () => {
        if (!blockName || !editId) return;
        await axios.patch(`http://127.0.0.1:8000/blocks/${editId}/`, {
          block_name: blockName,
        });
      };
      
      const deleteBlock = async (block_name) => {
        await axios.delete(`http://127.0.0.1:8000/blocks/${block_name}/`);
        fetchBlocks();
      };
      
      const handleEdit = (block) => {
        setBlockName(block.block_name);
        setEditId(block.block_name);  // set block_name instead of block_id
        setIsEditing(true);
      };
      
  
    const handleCancel = () => {
      setBlockName("");
      setIsEditing(false);
      setEditId(null);
    };
  
    return (
      <Container>
        <Header>Block</Header>
        <InputRow>
          <Input
            type="text"
            value={blockName}
            placeholder="Block"
            onChange={(e) => setBlockName(e.target.value)}
          />
          <Button cancel onClick={handleCancel}>Cancel</Button>
          <Button onClick={isEditing ? updateBlock : addBlock}>
            {isEditing ? "Update" : "+Add"}
          </Button>
        </InputRow>
  
        <Table>
          <thead>
            <tr>
              <th>Block</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => (
              <tr key={block.block_id}>
                <td>{block.block_name}</td>
                <td>
                  <FaEdit
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleEdit(block)}
                  />
                  <FaTrash
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => deleteBlock(block.block_id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    );
  }
  
