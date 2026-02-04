import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  PageWrapper,
  FormContent,
  FormRow,
  InputWrapper,
  Label,
  Input,
  TextArea,
  Button,
  ButtonContainer,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  SectionHeader,
} from "../GlobalStyles";

const Service = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    service_name: "",
    cost: "",
    department: "",
    description: ""
  });
  const [editingId, setEditingId] = useState(null);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}service/`, "GET");
      if (response && !response.error) {
        setServices(Array.isArray(response.data) ? response.data : []);
      } else {
        setServices([]);
      }
    } catch (error) {
      toast.error("Failed to fetch services");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      service_name: service.service_name,
      cost: service.cost,
      department: service.department || "",
      description: service.description || ""
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const response = await apiRequest(`${HmsBaseUrl}service/${id}/`, "DELETE");
        if (response) {
          toast.success("Service deleted successfully");
          fetchServices();
        }
      } catch (error) {
        toast.error("Failed to delete service");
      }
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      service_name: "",
      cost: "",
      department: "",
      description: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await apiRequest(
          `${HmsBaseUrl}service/${editingId}/`,
          "PUT",
          formData
        );
        if (response && !response.error) {
          toast.success("Service updated successfully");
          handleReset();
          fetchServices();
        } else {
          toast.error(response.error || "Update failed");
        }
      } else {
        const response = await apiRequest(
          `${HmsBaseUrl}service/`,
          "POST",
          formData
        );
        if (response && !response.error) {
          toast.success("Service added successfully");
          handleReset();
          fetchServices();
        } else {
          toast.error(response.error || "Create failed");
        }
      }
    } catch (error) {
      toast.error("Failed to save service");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <SectionHeader>
          <h3>Service Management</h3>
        </SectionHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <InputWrapper>
                <Label required>Service Name</Label>
                <Input
                  type="text"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Service Name"
                />
              </InputWrapper>
              <InputWrapper>
                <Label required>Cost</Label>
                <Input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Department</Label>
                <Input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Department"
                />
              </InputWrapper>
            </FormRow>
            <FormRow columns="1fr">
              <InputWrapper>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Service Description"
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <Button secondary type="button" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">
                {editingId ? "Update Service" : "Add Service"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 24px 24px" }}>
          <h4 style={{ color: "#0d9488", marginBottom: "16px" }}>Service List</h4>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Service Name</Th>
                  <Th>Cost</Th>
                  <Th>Department</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <Tr>
                    <Td colSpan="5" style={{ textAlign: "center" }}>
                      No services found
                    </Td>
                  </Tr>
                ) : (
                  services.map((service) => (
                    <Tr key={service.id}>
                      <Td>{service.service_name}</Td>
                      <Td>{service.cost}</Td>
                      <Td>{service.department}</Td>
                      <Td>
                        <span style={{ color: service.is_active ? 'green' : 'red' }}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleEdit(service)}
                          >
                            Edit
                          </Button>
                          <Button
                            danger
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            onClick={() => handleDelete(service.id)}
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

export default Service;