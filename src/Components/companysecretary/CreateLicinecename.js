import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getLicenceMaster, saveLicenceMaster } from "./companysecretary";
import {
  Wrapper,
  HeaderBox,
  HospitalTitle,
  SubTitle,
  TableWrapper,
  Table,
  Th,
  Td,
  ActionsBar,
  PrimaryButton,
  SecondaryButton,
  ModalOverlay,
  ModalBox,
  ModalTitle,
  FormRow,
  Label,
  Input,
  ErrorText,
  ModalActions,
  CloseButton,
} from "./LicenceMaster.styles";

const EMPTY_FORM = { licence_name: "" };

const CreateLicinecename = () => {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadData = () => {
    getLicenceMaster().then((res) => {
      if (res.success && Array.isArray(res.data)) setRecords(res.data);
      else setRecords([]);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.licence_name.trim()) newErrors.licence_name = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setSaveError("");
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    setSaveError("");
    try {
      const res = await saveLicenceMaster({
        licence_name: form.licence_name.trim(),
      });

      if (!res.success) {
        const message =
          res.error ||
          (res.status === 401
            ? "Unauthorized. Please log in again."
            : res.status === 400
            ? "Please check the details and try again."
            : res.status >= 500
            ? "Server error. Please try again later."
            : "Failed to save licence name.");
        setSaveError(message);
        toast.error(message, { position: "top-right" });
        return;
      }

      toast.success("Licence name saved successfully", {
        position: "top-right",
      });

      // Show the new record immediately, then reconcile with the server.
      if (res.data && res.data._id) {
        setRecords((prev) => [...prev, res.data]);
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error("Failed to save licence name", err);
      const message = "Failed to save licence name.";
      setSaveError(message);
      toast.error(message, { position: "top-right" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrapper>
      <HeaderBox>
        <HospitalTitle>Shanmuga Hospital Limited</HospitalTitle>
        <SubTitle>Licence Name Master</SubTitle>
      </HeaderBox>

      <ActionsBar>
        <PrimaryButton onClick={() => setShowModal(true)}>
          + Add Licence Name
        </PrimaryButton>
      </ActionsBar>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th align="center">Sl. No.</Th>
              <Th>Licence Name</Th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec._id}>
                <Td align="center">{rec.s_no}</Td>
                <Td>{rec.licence_name}</Td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <Td colSpan={2} align="center">
                  No licence names found
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrapper>

      {showModal && (
        <ModalOverlay>
          <ModalBox>
            <CloseButton type="button" aria-label="Close" onClick={closeModal}>
              &times;
            </CloseButton>
            <ModalTitle>Add Licence Name</ModalTitle>

            <FormRow>
              <Label>Licence Name</Label>
              <Input
                name="licence_name"
                value={form.licence_name}
                onChange={handleChange}
                placeholder="e.g. Computed Tomography G-XL-228702"
                autoFocus
              />
              {errors.licence_name && (
                <ErrorText>{errors.licence_name}</ErrorText>
              )}
            </FormRow>

            {saveError && <ErrorText>{saveError}</ErrorText>}

            <ModalActions>
              <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </PrimaryButton>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
    </Wrapper>
  );
};

export default CreateLicinecename;