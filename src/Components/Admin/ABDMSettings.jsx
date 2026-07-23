import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  display: inline-block;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dcdde1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  flex: 1;
  min-width: 200px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResponseBox = styled.pre`
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  overflow-x: auto;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ABDMSettings = () => {
  const [formData, setFormData] = useState({
    clientId: "SBXID_057691",
    clientSecret: "b195cb4f-4f69-4355-b60e-d0de26ad5008",
    serviceId: "HMS_HIP_SERVICE_001",
    bridgeUrl: "https://webhook.site/b195cb4f-4f69-4355-b60e-d0de26ad5008"
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const handleAction = async (endpoint, actionName) => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${Hmsbaseurl}abdm/${endpoint}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`${actionName} successful!`);
      } else {
        toast.error(`${actionName} failed. Check response.`);
      }

      setResponse({
        status: res.status,
        data: data
      });

    } catch (error) {
      toast.error(`Error connecting to server for ${actionName}`);
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>ABDM Bridge Setup</Title>

      <FormGroup>
        <Label>Client ID (Sandbox ID)</Label>
        <Input
          type="text"
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
          placeholder="e.g. SBXID_123456"
        />
      </FormGroup>

      <FormGroup>
        <Label>Client Secret</Label>
        <Input
          type="password"
          name="clientSecret"
          value={formData.clientSecret}
          onChange={handleChange}
          placeholder="Enter Client Secret"
        />
      </FormGroup>

      <FormGroup>
        <Label>Service ID (HIP/HIU)</Label>
        <Input
          type="text"
          name="serviceId"
          value={formData.serviceId}
          onChange={handleChange}
          placeholder="e.g. MY_HOSPITAL_HIP"
        />
      </FormGroup>

      <FormGroup>
        <Label>Bridge Webhook URL</Label>
        <Input
          type="text"
          name="bridgeUrl"
          value={formData.bridgeUrl}
          onChange={handleChange}
          placeholder="https://your-domain.com/api/webhook"
        />
      </FormGroup>

      <ButtonGroup>
        <ActionButton
          disabled={loading}
          onClick={() => handleAction('update-bridge-url', 'Update Bridge URL')}
        >
          {loading ? "Processing..." : "1. Update Bridge URL"}
        </ActionButton>
        <ActionButton
          disabled={loading}
          onClick={() => handleAction('add-service', 'Add Service')}
        >
          {loading ? "Processing..." : "2. Add/Update Service"}
        </ActionButton>
        <ActionButton
          disabled={loading}
          onClick={() => handleAction('get-services', 'Fetch Services')}
        >
          {loading ? "Processing..." : "3. Fetch Services"}
        </ActionButton>
      </ButtonGroup>

      {response && (
        <ResponseBox>
          {JSON.stringify(response, null, 2)}
        </ResponseBox>
      )}
    </Container>
  );
};

export default ABDMSettings;
