import React, { useState, useEffect, useCallback } from "react";
import { Plus, Save, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import styled from "styled-components";
import {
  colors,
  Container,
  Button,
  Label,
  Input,
  Select,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  CloseButton,
  SectionHeader,
  ControlsContainer,
  SearchContainer,
  SearchInput,
  NoResults,
} from "../GlobalStyles";

// ── Page-level wrappers ───────────────────────────────────────────────────────
const MaxWidthContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${colors.textMain};
`;

const Card = styled.div`
  background: ${colors.surface};
  border-radius: 10px;
  border: 1px solid ${colors.border};
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Required = styled.span`
  color: ${colors.danger};
  margin-left: 2px;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
`;

const PrimaryButton = styled(Button)`
  background: ${colors.primary};
  &:hover {
    background: ${colors.primaryDark};
  }
`;

const DangerButton = styled(Button)`
  background: ${colors.danger};
  &:hover {
    background: #dc2626;
  }
  padding: 3px 8px;
  font-size: 0.75rem;
`;

const EditButton = styled(Button)`
  background: ${colors.secondary};
  &:hover {
    background: #d97706;
  }
  padding: 3px 8px;
  font-size: 0.75rem;
`;

const Badge = styled.span`
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${({ value }) =>
    value === "Available"
      ? "#dcfce7"
      : value === "In Use"
        ? "#fee2e2"
        : "#fef9c3"};
  color: ${({ value }) =>
    value === "Available"
      ? "#16a34a"
      : value === "In Use"
        ? "#dc2626"
        : "#ca8a04"};
`;

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = { ot_name: "", availability: "Available", capacity: "" };

// ─────────────────────────────────────────────────────────────────────────────
const OTMaster = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [otList, setOtList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = add mode
  const [formData, setFormData] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchOTs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`${HMSURL}list_ots/`, "GET");
      if (result.success) {
        const list = Array.isArray(result.data)
          ? result.data
          : result.data?.data || [];

        setOtList(list);
      } else toast.error(result.message || "Failed to fetch OTs");
    } catch {
      toast.error("Failed to fetch OT list");
    } finally {
      setLoading(false);
    }
  }, [HMSURL]);

  useEffect(() => {
    fetchOTs();
  }, [fetchOTs]);

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(null);
    setFormData(emptyForm);
    setErrorMsg("");
    setShowModal(true);
  };

  const openEdit = (ot) => {
    setEditItem(ot);
    setFormData({
      ot_name: ot.ot_name,
      availability: ot.availability,
      capacity: ot.capacity,
    });
    setErrorMsg("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg("");
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ── Submit (add / edit) ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const missing = [];
    if (!formData.ot_name.trim()) missing.push("OT Name");
    if (!formData.capacity.trim()) missing.push("Capacity");
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    try {
      let result;
      if (editItem) {
        result = await apiRequest(
          `${HMSURL}update_ot/${editItem.ot_id}/`,
          "PUT",
          formData,
        );
      } else {
        result = await apiRequest(`${HMSURL}create_ot/`, "POST", formData);
      }

      if (result.success) {
        toast.success(editItem ? "OT updated!" : "OT created!");
        closeModal();
        fetchOTs();
      } else {
        setErrorMsg(result.message || result.error || "Unknown error");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (ot) => {
    if (!window.confirm(`Delete "${ot.ot_name}"?`)) return;
    try {
      const result = await apiRequest(
        `${HMSURL}delete_ot/${ot.ot_id}/`,
        "DELETE",
      );
      if (result.success) {
        toast.success("OT deleted!");
        fetchOTs();
      } else toast.error(result.message || "Delete failed");
    } catch {
      toast.error("Delete failed.");
    }
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = otList.filter((o) =>
    [o.ot_id, o.ot_name, o.availability, o.capacity]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Container>
      <MaxWidthContainer>
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Title>OT Master</Title>
          <PrimaryButton onClick={openAdd}>
            <Plus size={16} /> Add OT
          </PrimaryButton>
        </div>

        {/* ── Table Card ──────────────────────────────────────────────────── */}
        <Card>
          <SectionHeader>
            <h3>OT List</h3>
          </SectionHeader>

          <ControlsContainer>
            <SearchContainer>
              <SearchInput
                placeholder="Search by name, ID, availability…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 280 }}
              />
            </SearchContainer>
          </ControlsContainer>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>OT ID</Th>
                  <Th>OT Name</Th>
                  <Th>Availability</Th>
                  <Th>Capacity</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td
                      colSpan={6}
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      Loading…
                    </Td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={6}>
                      <NoResults>No OT records found.</NoResults>
                    </Td>
                  </tr>
                ) : (
                  filtered.map((ot, idx) => (
                    <Tr key={ot.ot_id}>
                      <Td>{idx + 1}</Td>
                      <Td style={{ fontWeight: 600, color: colors.primary }}>
                        {ot.ot_id}
                      </Td>
                      <Td>{ot.ot_name}</Td>
                      <Td>
                        <Badge value={ot.availability}>{ot.availability}</Badge>
                      </Td>
                      <Td>{ot.capacity}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <EditButton onClick={() => openEdit(ot)}>
                            <Pencil size={13} /> Edit
                          </EditButton>
                          <DangerButton onClick={() => handleDelete(ot)}>
                            <Trash2 size={13} /> Delete
                          </DangerButton>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      </MaxWidthContainer>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContainer
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>{editItem ? "Edit OT" : "Add New OT"}</ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGrid style={{ gridTemplateColumns: "1fr 1fr" }}>
                {/* OT Name */}
                <FormGroup style={{ gridColumn: "1 / -1" }}>
                  <Label>
                    OT Name <Required>*</Required>
                  </Label>
                  <Input
                    name="ot_name"
                    value={formData.ot_name}
                    onChange={handleChange}
                    placeholder="e.g. OT 1 - MAJOR"
                  />
                </FormGroup>

                {/* Availability */}
                <FormGroup>
                  <Label>
                    Availability <Required>*</Required>
                  </Label>
                  <Select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </Select>
                </FormGroup>

                {/* Capacity */}
                <FormGroup>
                  <Label>
                    Capacity <Required>*</Required>
                  </Label>
                  <Input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                    min="1"
                  />
                </FormGroup>
              </FormGrid>

              {/* Error banner */}
              {errorMsg && (
                <div
                  style={{
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    color: "#dc2626",
                    borderRadius: 8,
                    padding: "10px 16px",
                    marginTop: 12,
                    fontSize: "0.85rem",
                  }}
                >
                  ⚠️ {errorMsg}
                </div>
              )}

              <ActionRow>
                <Button
                  style={{ background: colors.textMuted }}
                  onClick={closeModal}
                >
                  <X size={15} /> Cancel
                </Button>
                <PrimaryButton onClick={handleSubmit}>
                  <Save size={15} /> {editItem ? "Update OT" : "Save OT"}
                </PrimaryButton>
              </ActionRow>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default OTMaster;
