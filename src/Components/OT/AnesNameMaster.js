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

const Textarea = styled.textarea`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.85rem;
  color: ${colors.textMain};
  background: ${colors.background};
  resize: vertical;
  min-height: 72px;
  font-family: inherit;
  outline: none;
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primary}22;
  }
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
    value === "General"
      ? "#dbeafe"
      : value === "Regional"
        ? "#dcfce7"
        : value === "Local"
          ? "#fef9c3"
          : value === "Sedation"
            ? "#ede9fe"
            : "#f3f4f6"};
  color: ${({ value }) =>
    value === "General"
      ? "#1d4ed8"
      : value === "Regional"
        ? "#16a34a"
        : value === "Local"
          ? "#ca8a04"
          : value === "Sedation"
            ? "#7c3aed"
            : "#374151"};
`;

// ─── Anesthesia type options ──────────────────────────────────────────────────
const ANES_TYPES = ["General", "Regional", "Local", "Sedation", "Combined"];

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = {
  anesthesia_name: "",
  type_of_anesthesia: "General",
  admin_guide: "",
  description: "",
};

// ─────────────────────────────────────────────────────────────────────────────
const AnesNameMaster = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [anesList, setAnesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = add mode
  const [formData, setFormData] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchAnes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`${HMSURL}list_anes/`, "GET");
      if (result.success) {
        const list = Array.isArray(result.data)
          ? result.data
          : result.data?.data || [];
        setAnesList(list);
      } else {
        toast.error(result.message || "Failed to fetch anesthesia records");
      }
    } catch {
      toast.error("Failed to fetch anesthesia list");
    } finally {
      setLoading(false);
    }
  }, [HMSURL]);

  useEffect(() => {
    fetchAnes();
  }, [fetchAnes]);

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(null);
    setFormData(emptyForm);
    setErrorMsg("");
    setShowModal(true);
  };

  const openEdit = (anes) => {
    setEditItem(anes);
    setFormData({
      anesthesia_name: anes.anesthesia_name,
      type_of_anesthesia: anes.type_of_anesthesia,
      admin_guide: anes.admin_guide || "",
      description: anes.description || "",
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Submit (add / edit) ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const missing = [];
    if (!formData.anesthesia_name.trim()) missing.push("Anesthesia Name");
    if (!formData.type_of_anesthesia.trim()) missing.push("Type of Anesthesia");
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    try {
      let result;
      if (editItem) {
        result = await apiRequest(
          `${HMSURL}update_anes/${editItem.anesthesia_id}/`,
          "PUT",
          formData,
        );
      } else {
        result = await apiRequest(`${HMSURL}create_anes/`, "POST", formData);
      }

      if (result.success) {
        toast.success(editItem ? "Anesthesia updated!" : "Anesthesia created!");
        closeModal();
        fetchAnes();
      } else {
        setErrorMsg(result.message || result.error || "Unknown error");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (anes) => {
    if (!window.confirm(`Delete "${anes.anesthesia_name}"?`)) return;
    try {
      const result = await apiRequest(
        `${HMSURL}delete_anes/${anes.anesthesia_id}/`,
        "DELETE",
      );
      if (result.success) {
        toast.success("Anesthesia deleted!");
        fetchAnes();
      } else {
        toast.error(result.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed.");
    }
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = anesList.filter((o) =>
    [
      o.anesthesia_id,
      o.anesthesia_name,
      o.type_of_anesthesia,
      o.admin_guide,
      o.description,
    ]
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
          <Title>Anesthesia Master</Title>
          <PrimaryButton onClick={openAdd}>
            <Plus size={16} /> Add Anesthesia
          </PrimaryButton>
        </div>

        {/* ── Table Card ──────────────────────────────────────────────────── */}
        <Card>
          <SectionHeader>
            <h3>Anesthesia List</h3>
          </SectionHeader>

          <ControlsContainer>
            <SearchContainer>
              <SearchInput
                placeholder="Search by name, ID, type…"
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
                  <Th>Anesthesia ID</Th>
                  <Th>Anesthesia Name</Th>
                  <Th>Type</Th>
                  <Th>Admin Guide</Th>
                  <Th>Description</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td
                      colSpan={7}
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      Loading…
                    </Td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={7}>
                      <NoResults>No anesthesia records found.</NoResults>
                    </Td>
                  </tr>
                ) : (
                  filtered.map((anes, idx) => (
                    <Tr key={anes.anesthesia_id}>
                      <Td>{idx + 1}</Td>
                      <Td style={{ fontWeight: 600, color: colors.primary }}>
                        {anes.anesthesia_id}
                      </Td>
                      <Td>{anes.anesthesia_name}</Td>
                      <Td>
                        <Badge value={anes.type_of_anesthesia}>
                          {anes.type_of_anesthesia}
                        </Badge>
                      </Td>
                      <Td
                        style={{
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {anes.admin_guide || "—"}
                      </Td>
                      <Td
                        style={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {anes.description || "—"}
                      </Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <EditButton onClick={() => openEdit(anes)}>
                            <Pencil size={13} /> Edit
                          </EditButton>
                          <DangerButton onClick={() => handleDelete(anes)}>
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
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                {editItem ? "Edit Anesthesia" : "Add New Anesthesia"}
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGrid style={{ gridTemplateColumns: "1fr 1fr" }}>
                {/* Anesthesia Name */}
                <FormGroup style={{ gridColumn: "1 / -1" }}>
                  <Label>
                    Anesthesia Name <Required>*</Required>
                  </Label>
                  <Input
                    name="anesthesia_name"
                    value={formData.anesthesia_name}
                    onChange={handleChange}
                    placeholder="e.g. EPIDURAL"
                  />
                </FormGroup>

                {/* Type of Anesthesia */}
                <FormGroup>
                  <Label>
                    Type of Anesthesia <Required>*</Required>
                  </Label>
                  <Select
                    name="type_of_anesthesia"
                    value={formData.type_of_anesthesia}
                    onChange={handleChange}
                  >
                    {ANES_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                {/* Admin Guide */}
                <FormGroup>
                  <Label>Admin Guide</Label>
                  <Input
                    name="admin_guide"
                    value={formData.admin_guide}
                    onChange={handleChange}
                    placeholder="e.g. L3-L4 interspace"
                  />
                </FormGroup>

                {/* Description */}
                <FormGroup style={{ gridColumn: "1 / -1" }}>
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Additional notes about this anesthesia…"
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
                  <Save size={15} />{" "}
                  {editItem ? "Update Anesthesia" : "Save Anesthesia"}
                </PrimaryButton>
              </ActionRow>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default AnesNameMaster;
