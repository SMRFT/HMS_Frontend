import React, { useState, useEffect, useRef } from "react";
// import apiRequest from "../../Auth/apiRequest";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper,
  Container,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
} from "../GlobalStyles";
import { Download, Plus, Edit, Trash2, X, Check, FileText } from "lucide-react";
import styled from "styled-components";

const tokens = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  primaryLight: "rgba(13, 148, 136, 0.1)",
  secondary: "#1E2D45",
  accent: "#2563EB",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAF8",
  white: "#FFFFFF",
  text: "#1E293B",
};

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid ${tokens.border};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${tokens.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: ${tokens.primary};
    border-radius: 4px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  background: ${props => props.variant === 'danger' ? tokens.danger :
    props.variant === 'secondary' ? tokens.secondary : tokens.primary};
  color: ${tokens.white};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(13, 148, 136, 0.2)'};
    background: ${props => props.variant === 'danger' ? '#dc2626' :
    props.variant === 'secondary' ? '#111827' : tokens.primaryDark};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${tokens.muted};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${tokens.white};
  border-radius: 20px;
  width: 100%;
  max-width: ${props => props.maxWidth || '500px'};
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  background: ${tokens.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${tokens.muted};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid ${tokens.border};
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${tokens.primary};
    box-shadow: 0 0 0 4px ${tokens.primaryLight};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid ${tokens.border};
  border-radius: 10px;
  font-size: 15px;
  min-height: 100px;
  outline: none;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    border-color: ${tokens.primary};
    box-shadow: 0 0 0 4px ${tokens.primaryLight};
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.active ? tokens.success : tokens.danger};
  border: 1px solid ${props => props.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 10px;
`;

const QRFrame = styled.div`
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid ${tokens.border};
`;

const CustomerType = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
  const qrRef = useRef();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    type_name: "",
    discount_percent: 0,
    priority: 1,
    description: "",
    is_active: true
  });

  const fetchRecords = async () => {
    setLoading(true);
    const result = await apiRequest(`${HMSURL}customer-types/`, "GET");
    if (result.success) {
      setRecords(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      type_name: "",
      discount_percent: 0,
      priority: 1,
      description: "",
      is_active: true
    });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleOpenEdit = (rec) => {
    setFormData({
      ...rec,
      discount_percent: rec.discount_percent || 0,
      priority: rec.priority || 1
    });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.type_name) return alert("Type Name is required");

    setLoading(true);
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `${HMSURL}customer-types/${formData.type_id}/`
      : `${HMSURL}customer-types/`;

    const payload = {
      ...formData,
      created_by: localStorage.getItem('userName'),
      lastmodified_by: localStorage.getItem('userName')
    };

    const result = await apiRequest(url, method, payload);
    if (result.success) {
      setShowModal(false);
      fetchRecords();
      alert(isEdit ? "Updated successfully" : "Created successfully");
    } else {
      alert(result.error || "Operation failed");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer type?")) return;

    const result = await apiRequest(`${HMSURL}customer-types/${id}/`, "DELETE");
    if (result.success) {
      fetchRecords();
      alert("Deleted successfully");
    }
  };

  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = ["ID", "Customer Type", "Discount (%)", "Priority", "Total Patients", "Status"];
    const csvContent = [
      headers.join(","),
      ...records.map(rec => [
        rec.type_id,
        rec.type_name,
        rec.discount_percent,
        rec.priority,
        rec.patient_count,
        rec.is_active ? "Active" : "Inactive"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "CustomerTypes_Report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageWrapper>
      <Container>
        <HeaderSection>
          <Title>Customer Type Configuration</Title>
          <div style={{ display: 'flex', gap: '12px' }}>
            <ActionButton variant="secondary" onClick={exportToCSV}>
              <Download size={18} /> Export List
            </ActionButton>
            <ActionButton onClick={handleOpenCreate}>
              <Plus size={18} /> Add New Type
            </ActionButton>
          </div>
        </HeaderSection>

        <TableWrapper>
          <Table>
            <thead>
              <Tr>
                <Th>ID</Th>
                <Th>Customer Type</Th>
                <Th>Discount (%)</Th>
                <Th>Priority</Th>
                <Th>Patients</Th>
                <Th>Status</Th>
                <Th style={{ textAlign: "center" }}>Actions</Th>
              </Tr>
            </thead>
            <tbody>
              {loading && records.length === 0 ? (
                <Tr><Td colSpan={6} style={{ textAlign: "center" }}>Loading...</Td></Tr>
              ) : records.length === 0 ? (
                <Tr><Td colSpan={6} style={{ textAlign: "center" }}>No types configured.</Td></Tr>
              ) : (
                records.map((rec) => (
                  <Tr key={rec.type_id}>
                    <Td><strong>{rec.type_id}</strong></Td>
                    <Td>
                      <span style={{ fontWeight: 600, color: tokens.primary }}>{rec.type_name}</span>
                    </Td>
                    <Td>
                      <span style={{ color: tokens.accent, fontWeight: 600 }}>{rec.discount_percent}%</span>
                    </Td>
                    <Td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: tokens.bg,
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {rec.priority}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} color={tokens.muted} />
                        <strong>{rec.patient_count}</strong>
                      </div>
                    </Td>
                    <Td>
                      <StatusBadge active={rec.is_active}>
                        {rec.is_active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <ActionButton
                          variant="primary"
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleOpenEdit(rec)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDelete(rec.type_id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </ActionButton>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </Container>

      {/* Create/Edit Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{isEdit ? "Edit Customer Type" : "New Customer Type"}</h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Type Name *</Label>
                <Input
                  placeholder="e.g. Corporate, Staff, Insurance"
                  value={formData.type_name}
                  onChange={e => setFormData({ ...formData, type_name: e.target.value })}
                />
              </FormGroup>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormGroup>
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.discount_percent}
                    onChange={e => setFormData({ ...formData, discount_percent: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Priority (1-10)</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  />
                </FormGroup>
              </div>
              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  placeholder="Enter details about this customer type..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Active Status</span>
                </label>
              </FormGroup>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <ActionButton style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
                  <Check size={18} /> {loading ? "Saving..." : "Save Configuration"}
                </ActionButton>
              </div>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

    </PageWrapper>
  );
};

export default CustomerType;
