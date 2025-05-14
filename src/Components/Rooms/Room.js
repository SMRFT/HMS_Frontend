import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

// Styled Components
const FormContainer = styled.div`
  margin-top: 60px;
  max-width: 1150px;
  padding: 20px;
  background: #d9e6e8;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 10px;
  color: #15616d;
  font-size: 24px;
`;

const Section = styled.div`
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Arial', sans-serif;
  transition: border-color 0.3s;

  &:focus {
    border-color: #15616d;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Arial', sans-serif;
  transition: border-color 0.3s;

  &:focus {
    border-color: #15616d;
    outline: none;
  }

  background-color: white;
  appearance: none; /* Removes default dropdown styling on most browsers */
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const ButtonContainer = styled.div`
  margin-top: 10px;
  text-align: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #15616d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #15616d, #1d7686);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

const Th = styled.th`
  background-color: #15616d;
  color: white;
  padding: 10px;
  font-size: 14px;
  text-align: left;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
  font-size: 13px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const RoomForm = () => {
  const [formData, setFormData] = useState({
    room_number: "",
    description: "",
    room_category: "",
    block: "",
    floor: "",
    phone_extension: "",
    nursing_station: "",
    capacity: "",
    admission_fee: "",
    room_advance: "",
    room_type: ""
  });

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/rooms/")
      .then((response) => setRooms(response.data))
      .catch((error) => console.error("Fetch error:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/rooms/", formData)
      .then((response) => {
        alert("Room saved!");
        setRooms((prev) => [...prev, response.data]);
        setFormData({
          room_number: "", description: "", room_category: "",
          block: "", floor: "", phone_extension: "", nursing_station: "",
          capacity: "", admission_fee: "", room_advance: "", room_type: ""
        });
      })
      .catch((error) => console.error("Submit error:", error));
  };

  return (
    <FormContainer>
      <Title>Add Room</Title>
      <form onSubmit={handleSubmit}>
        <Section>
          <FormGrid>
            <InputWrapper>
              <Label>Room Number</Label>
              <Input name="room_number" value={formData.room_number} onChange={handleChange} required />
            </InputWrapper>
            <InputWrapper>
              <Label>Description</Label>
              <Input name="description" value={formData.description} onChange={handleChange} required />
            </InputWrapper>
            <InputWrapper>
              <Label>Room Category</Label>
              <Select name="room_category" value={formData.room_category} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="PRIVATE ROOM">PRIVATE ROOM</option>
                <option value="SEMI PRIVATE">SEMI PRIVATE</option>
                <option value="GENERAL WARD">GENERAL WARD</option>
              </Select>
            </InputWrapper>
            <InputWrapper>
              <Label>Block</Label>
              <Select name="block" value={formData.block} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="MAIN BLOCK">MAIN BLOCK</option>
                <option value="CANCER BLOCK">CANCER BLOCK</option>
              </Select>
            </InputWrapper>
            <InputWrapper>
              <Label>Floor</Label>
              <Input type="number" name="floor" value={formData.floor} onChange={handleChange} />
            </InputWrapper>
            <InputWrapper>
              <Label>Phone Extension</Label>
              <Input name="phone_extension" value={formData.phone_extension} onChange={handleChange} />
            </InputWrapper>
            <InputWrapper>
              <Label>Nursing Station</Label>
              <Select name="nursing_station" value={formData.nursing_station} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="MICU">MICU</option>
                <option value="SICU">SICU</option>
              </Select>
            </InputWrapper>
            <InputWrapper>
              <Label>Capacity</Label>
              <Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
            </InputWrapper>
            <InputWrapper>
              <Label>Admission Fee</Label>
              <Input type="number" name="admission_fee" value={formData.admission_fee} onChange={handleChange} />
            </InputWrapper>
            <InputWrapper>
              <Label>Room Advance</Label>
              <Input type="number" name="room_advance" value={formData.room_advance} onChange={handleChange} />
            </InputWrapper>
            <InputWrapper>
              <Label>Room Type</Label>
              <Select name="room_type" value={formData.room_type} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="ICU">ICU</option>
                <option value="CCU">CCU</option>
                <option value="ICCU">ICCU</option>
                <option value="NICU">NICU</option>
                <option value="CASUALITY">CASUALITY</option>
                <option value="OTHERS">OTHERS</option>
              </Select>
            </InputWrapper>
            <ButtonContainer>
                <Button type="submit">Save Room</Button>
            </ButtonContainer>
          </FormGrid>
        </Section>
      </form>

      <Title>Room List</Title>
      <Table>
        <thead>
          <tr>
            <Th>Room Number</Th>
            <Th>Category</Th>
            <Th>Block</Th>
            <Th>Floor</Th>
            <Th>Room Type</Th>
            <Th>Capacity</Th>
            <Th>Admission Fee</Th>
            <Th>Advance</Th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <Tr key={room.id}>
              <Td>{room.room_number}</Td>
              <Td>{room.room_category}</Td>
              <Td>{room.block}</Td>
              <Td>{room.floor}</Td>
              <Td>{room.room_type}</Td>
              <Td>{room.capacity}</Td>
              <Td>{room.admission_fee}</Td>
              <Td>{room.room_advance}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </FormContainer>
  );
};

export default RoomForm;
