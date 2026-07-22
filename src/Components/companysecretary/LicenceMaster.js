import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  getLicenceMaster,
  getLicenceDetails,
  saveLicenceDetails,
  updateLicenceDetails,
  getInchargeList,
  renewLicenceDetails,
} from "./companysecretary";
import {
  Wrapper,
  HeaderBox,
  HospitalTitle,
  SubTitle,
  TableWrapper,
  Table,
  Th,
  Td,
  TabBar,
  TabButton,
  FormCard,
  FormRow,
  Label,
  Input,
  ErrorText,
  ModalOverlay,
  ModalBox,
  ModalTitle,
  CloseButton,
  ModalActions,
  PrimaryButton,
  SecondaryButton,
  AutocompleteWrapper,
  SuggestionsList,
  SuggestionItem,
  FieldRow,
  ChipsWrapper,
  Chip,
  ChipRemove,
  CheckboxLabel,
  ActionIconsRow,
  IconButton,
} from "./LicenceMaster.styles";

const EMPTY_FORM = {
  licence_name: "",
  license_number: "",
  valid_from: "",
  expiry_date: "",
  incharge: [],
  respective_person: [],
};

const EMPTY_RENEWAL_FORM = {
  renewal_date: "",
  expiry_date: "",
};

const INTIMATION_TEXT = "90 Days Before the Due Date";
const EXPIRY_WARNING_DAYS = 90;

/* Reusable searchable text input + suggestion dropdown.
   Defined outside LicenceMaster so it doesn't remount (and lose focus)
   on every parent re-render. */
const SearchableField = ({
  label,
  placeholder,
  query,
  onQueryChange,
  options,
  onSelectOption,
  showSuggestions,
  setShowSuggestions,
  error,
}) => {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <FormRow>
      <Label>{label}</Label>
      <AutocompleteWrapper>
        <Input
          autoComplete="off"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
        />
        {showSuggestions && filtered.length > 0 && (
          <SuggestionsList>
            {filtered.map((opt) => (
              <SuggestionItem key={opt} onMouseDown={() => onSelectOption(opt)}>
                {opt}
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </AutocompleteWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </FormRow>
  );
};

/* Multi-select variant: checkbox dropdown + removable chips for the
   selected values. Used for Incharge and Respective Person, which are
   stored as arrays of employeeId. Defined outside LicenceMaster so it
   doesn't remount (and lose focus) on every parent re-render. */
const MultiSelectField = ({
  label,
  placeholder,
  query,
  onQueryChange,
  options, // [{ id, name }]
  selectedIds,
  onToggleOption,
  onRemoveSelected,
  showSuggestions,
  setShowSuggestions,
  error,
}) => {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.name.toLowerCase().includes(q));
  }, [options, query]);

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedIds.includes(opt.id)),
    [options, selectedIds]
  );

  return (
    <FormRow>
      <Label>{label}</Label>
      <AutocompleteWrapper>
        <Input
          autoComplete="off"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
        />
        {showSuggestions && filtered.length > 0 && (
          <SuggestionsList>
            {filtered.map((opt) => (
              <SuggestionItem
                key={opt.id}
                active={selectedIds.includes(opt.id)}
                // onMouseDown (not onClick) fires before the input's onBlur,
                // and preventDefault stops focus loss so the dropdown stays
                // open across multiple selections.
                onMouseDown={(e) => {
                  e.preventDefault();
                  onToggleOption(opt.id);
                }}
              >
                <CheckboxLabel>
                  <input type="checkbox" checked={selectedIds.includes(opt.id)} readOnly />
                  {opt.name}
                </CheckboxLabel>
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </AutocompleteWrapper>
      {selectedOptions.length > 0 && (
        <ChipsWrapper>
          {selectedOptions.map((opt) => (
            <Chip key={opt.id}>
              {opt.name}
              <ChipRemove
                type="button"
                onClick={() => onRemoveSelected(opt.id)}
                aria-label={`Remove ${opt.name}`}
              >
                ×
              </ChipRemove>
            </Chip>
          ))}
        </ChipsWrapper>
      )}
      {error && <ErrorText>{error}</ErrorText>}
    </FormRow>
  );
};

const LicenceMaster = () => {
  const [records, setRecords] = useState([]);
  const [licenceOptions, setLicenceOptions] = useState([]);
  const [inchargeOptions, setInchargeOptions] = useState([]);

  const [activeTab, setActiveTab] = useState("list"); // "add" | "list"

  const [form, setForm] = useState(EMPTY_FORM);
  const [inchargeQuery, setInchargeQuery] = useState("");
  const [respectivePersonQuery, setRespectivePersonQuery] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [showLicenceSuggestions, setShowLicenceSuggestions] = useState(false);
  const [showInchargeSuggestions, setShowInchargeSuggestions] = useState(false);
  const [showRespectivePersonSuggestions, setShowRespectivePersonSuggestions] =
    useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSNo, setEditingSNo] = useState(null);

  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalTarget, setRenewalTarget] = useState(null);
  const [renewalForm, setRenewalForm] = useState(EMPTY_RENEWAL_FORM);
  const [renewalErrors, setRenewalErrors] = useState({});
  const [renewing, setRenewing] = useState(false);
  const [renewalError, setRenewalError] = useState("");

  const loadData = () => {
    getLicenceDetails().then((res) => {
      if (res.success && Array.isArray(res.data)) setRecords(res.data);
      else setRecords([]);
    });
    getLicenceMaster().then((res) => {
      if (res.success && Array.isArray(res.data)) setLicenceOptions(res.data);
      else setLicenceOptions([]);
    });
    getInchargeList().then((res) => {
      if (res.success && Array.isArray(res.data)) setInchargeOptions(res.data);
      else setInchargeOptions([]);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const inchargeNameById = useMemo(() => {
    const map = {};
    inchargeOptions.forEach((emp) => {
      map[emp.employeeId] = emp.employeeName;
    });
    return map;
  }, [inchargeOptions]);

  const licenceNameOptions = useMemo(
    () => licenceOptions.map((l) => l.licence_name),
    [licenceOptions]
  );

  const employeeSelectOptions = useMemo(
    () =>
      inchargeOptions.map((emp) => ({
        id: emp.employeeId,
        name: emp.employeeName,
      })),
    [inchargeOptions]
  );

  const getHighlight = (expiryDate) => {
    if (!expiryDate) return null;
    const diffDays = Math.ceil(
      (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return "expiring";
    if (diffDays <= EXPIRY_WARNING_DAYS) return "expiring";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* --- Licence name (stores text directly) --- */
  const handleLicenceNameChange = (text) => {
    setForm((prev) => ({ ...prev, licence_name: text }));
    setErrors((prev) => ({ ...prev, licence_name: "" }));
    setShowLicenceSuggestions(true);
  };
  const handleSelectLicenceName = (name) => {
    setForm((prev) => ({ ...prev, licence_name: name }));
    setErrors((prev) => ({ ...prev, licence_name: "" }));
    setShowLicenceSuggestions(false);
  };

  /* --- Incharge (multi-select; stores an array of employeeId) --- */
  const handleInchargeQueryChange = (text) => {
    setInchargeQuery(text);
    setShowInchargeSuggestions(true);
  };
  const handleToggleIncharge = (employeeId) => {
    setForm((prev) => ({
      ...prev,
      incharge: prev.incharge.includes(employeeId)
        ? prev.incharge.filter((id) => id !== employeeId)
        : [...prev.incharge, employeeId],
    }));
    setErrors((prev) => ({ ...prev, incharge: "" }));
  };
  const handleRemoveIncharge = (employeeId) => {
    setForm((prev) => ({
      ...prev,
      incharge: prev.incharge.filter((id) => id !== employeeId),
    }));
  };

  /* --- Respective person (multi-select; stores an array of employeeId) --- */
  const handleRespectivePersonQueryChange = (text) => {
    setRespectivePersonQuery(text);
    setShowRespectivePersonSuggestions(true);
  };
  const handleToggleRespectivePerson = (employeeId) => {
    setForm((prev) => ({
      ...prev,
      respective_person: prev.respective_person.includes(employeeId)
        ? prev.respective_person.filter((id) => id !== employeeId)
        : [...prev.respective_person, employeeId],
    }));
    setErrors((prev) => ({ ...prev, respective_person: "" }));
  };
  const handleRemoveRespectivePerson = (employeeId) => {
    setForm((prev) => ({
      ...prev,
      respective_person: prev.respective_person.filter(
        (id) => id !== employeeId
      ),
    }));
  };

  const handleEditClick = (rec) => {
    setIsEditMode(true);
    setEditingSNo(rec.s_no);
    setForm({
      licence_name: rec.licence_name || "",
      license_number: rec.license_number || "",
      valid_from: rec.valid_from ? rec.valid_from.slice(0, 10) : "",
      expiry_date: rec.expiry_date ? rec.expiry_date.slice(0, 10) : "",
      incharge: Array.isArray(rec.incharge) ? rec.incharge : [],
      respective_person: Array.isArray(rec.respective_person)
        ? rec.respective_person
        : [],
    });
    setInchargeQuery("");
    setRespectivePersonQuery("");
    setErrors({});
    setSaveError("");
    setActiveTab("add");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.licence_name.trim()) newErrors.licence_name = "Required";
    if (!form.license_number.trim()) newErrors.license_number = "Required";
    if (!form.valid_from) newErrors.valid_from = "Required";
    if (!form.expiry_date) newErrors.expiry_date = "Required";
    if (!form.incharge.length) newErrors.incharge = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setInchargeQuery("");
    setRespectivePersonQuery("");
    setErrors({});
    setSaveError("");
    setIsEditMode(false);
    setEditingSNo(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      licence_name: form.licence_name,
      license_number: form.license_number,
      incharge: form.incharge,
      respective_person: form.respective_person,
      valid_from: form.valid_from,
      expiry_date: form.expiry_date,
    };

    setSaving(true);
    setSaveError("");
    try {
      const res = isEditMode
        ? await updateLicenceDetails(editingSNo, payload)
        : await saveLicenceDetails(payload);

      if (!res.success) {
        const message =
          res.error ||
          (res.status === 401
            ? "Unauthorized. Please log in again."
            : res.status === 400
            ? "Please check the details and try again."
            : res.status >= 500
            ? "Server error. Please try again later."
            : `Failed to ${isEditMode ? "update" : "save"} licence details.`);
        setSaveError(message);
        toast.error(message, { position: "top-right" });
        return;
      }

      toast.success(
        isEditMode
          ? "Licence record updated successfully"
          : "Licence record saved successfully",
        { position: "top-right" }
      );

      if (isEditMode) {
        setRecords((prev) =>
          prev.map((r) => (r.s_no === editingSNo ? { ...r, ...res.data } : r))
        );
      } else if (res.data && res.data._id) {
        setRecords((prev) => [...prev, res.data]);
      }

      resetForm();
      loadData();
      setActiveTab("list");
    } catch (err) {
      console.error(
        `Failed to ${isEditMode ? "update" : "save"} licence details`,
        err
      );
      const message = `Failed to ${isEditMode ? "update" : "save"} licence details.`;
      setSaveError(message);
      toast.error(message, { position: "top-right" });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenRenewal = (rec) => {
    setRenewalTarget(rec);
    setRenewalForm({
      renewal_date: "",
      expiry_date: rec.expiry_date ? rec.expiry_date.slice(0, 10) : "",
    });
    setRenewalErrors({});
    setRenewalError("");
    setShowRenewalModal(true);
  };

  const handleCloseRenewal = () => {
    setShowRenewalModal(false);
    setRenewalTarget(null);
  };

  const handleRenewalChange = (e) => {
    const { name, value } = e.target;
    setRenewalForm((prev) => ({ ...prev, [name]: value }));
    setRenewalErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateRenewal = () => {
    const newErrors = {};
    if (!renewalForm.renewal_date) newErrors.renewal_date = "Required";
    if (!renewalForm.expiry_date) newErrors.expiry_date = "Required";
    setRenewalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRenewalSubmit = async () => {
    if (!validateRenewal() || !renewalTarget) return;

    setRenewing(true);
    setRenewalError("");
    try {
      const res = await renewLicenceDetails(renewalTarget.s_no, {
        renewal_date: renewalForm.renewal_date,
        expiry_date: renewalForm.expiry_date,
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
            : "Failed to renew licence.");
        setRenewalError(message);
        toast.error(message, { position: "top-right" });
        return;
      }

      toast.success("Licence renewed successfully", { position: "top-right" });
      setRecords((prev) =>
        prev.map((r) =>
          r.s_no === renewalTarget.s_no ? { ...r, ...res.data } : r
        )
      );
      handleCloseRenewal();
    } catch (err) {
      console.error("Failed to renew licence", err);
      const message = "Failed to renew licence.";
      setRenewalError(message);
      toast.error(message, { position: "top-right" });
    } finally {
      setRenewing(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")}.${d.getFullYear()}`;
  };

  return (
    <Wrapper>
      <HeaderBox>
        <HospitalTitle>Shanmuga Hospital Limited</HospitalTitle>
        <SubTitle>License List with Expire date and Incharge person Details</SubTitle>
      </HeaderBox>

      <TabBar>
        <TabButton
          type="button"
          $active={activeTab === "add"}
          onClick={() => {
            if (isEditMode) resetForm();
            setActiveTab("add");
          }}
        >
          {isEditMode ? "Edit Licence" : "+ Add Licence"}
        </TabButton>
        <TabButton
          type="button"
          $active={activeTab === "list"}
          onClick={() => setActiveTab("list")}
        >
          Licence List
        </TabButton>
      </TabBar>

      {activeTab === "add" && (
        <FormCard>
          <FieldRow>
            <SearchableField
              label="Licence Name"
              placeholder="e.g. Computed Tomography G-XL-228702"
              query={form.licence_name}
              onQueryChange={handleLicenceNameChange}
              options={licenceNameOptions}
              onSelectOption={handleSelectLicenceName}
              showSuggestions={showLicenceSuggestions}
              setShowSuggestions={setShowLicenceSuggestions}
              error={errors.licence_name}
            />

            <FormRow>
              <Label>Licence/Case/Ref Number</Label>
              <Input
                name="license_number"
                value={form.license_number}
                onChange={handleChange}
                placeholder="TN-00022-RF-XL-014"
              />
              {errors.license_number && (
                <ErrorText>{errors.license_number}</ErrorText>
              )}
            </FormRow>
          </FieldRow>

          <FieldRow>
            <FormRow>
              <Label>Valid From</Label>
              <Input
                type="date"
                name="valid_from"
                value={form.valid_from}
                onChange={handleChange}
              />
              {errors.valid_from && <ErrorText>{errors.valid_from}</ErrorText>}
            </FormRow>

            <FormRow>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
              />
              {errors.expiry_date && <ErrorText>{errors.expiry_date}</ErrorText>}
            </FormRow>
          </FieldRow>

          <FieldRow>
            <MultiSelectField
              label="Incharge"
              placeholder="Search incharge"
              query={inchargeQuery}
              onQueryChange={handleInchargeQueryChange}
              options={employeeSelectOptions}
              selectedIds={form.incharge}
              onToggleOption={handleToggleIncharge}
              onRemoveSelected={handleRemoveIncharge}
              showSuggestions={showInchargeSuggestions}
              setShowSuggestions={setShowInchargeSuggestions}
              error={errors.incharge}
            />

            <MultiSelectField
              label="Respective Person"
              placeholder="Search respective person"
              query={respectivePersonQuery}
              onQueryChange={handleRespectivePersonQueryChange}
              options={employeeSelectOptions}
              selectedIds={form.respective_person}
              onToggleOption={handleToggleRespectivePerson}
              onRemoveSelected={handleRemoveRespectivePerson}
              showSuggestions={showRespectivePersonSuggestions}
              setShowSuggestions={setShowRespectivePersonSuggestions}
              error={errors.respective_person}
            />
          </FieldRow>

          {saveError && <ErrorText>{saveError}</ErrorText>}

          <ModalActions>
            <SecondaryButton type="button" onClick={resetForm}>
              Clear
            </SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={saving}>
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                ? "Update"
                : "Save"}
            </PrimaryButton>
          </ModalActions>
        </FormCard>
      )}

      {activeTab === "list" && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th align="center">Sl. No.</Th>
                <Th>Licence Name</Th>
                <Th>Licence/Case/Refe Number</Th>
                <Th align="center">Valid From</Th>
                <Th align="center">Expiry Date</Th>
                <Th>Intimation date about expiry</Th>
                <Th>Incharge</Th>
                <Th>Respective Person</Th>
                <Th align="center">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => {
                const highlight = getHighlight(rec.expiry_date);
                return (
                  <tr key={rec._id}>
                    <Td align="center">{rec.s_no}</Td>
                    <Td>{rec.licence_name}</Td>
                    <Td>{rec.license_number}</Td>
                    <Td>{formatDate(rec.valid_from)}</Td>
                    <Td highlight={highlight}>{formatDate(rec.expiry_date)}</Td>
                    <Td>{INTIMATION_TEXT}</Td>
                    <Td>
                      {(rec.incharge || [])
                        .map((id) => inchargeNameById[id] || id)
                        .join(", ") || "-"}
                    </Td>
                    <Td>
                      {(rec.respective_person || [])
                        .map((id) => inchargeNameById[id] || id)
                        .join(", ") || "-"}
                    </Td>
                    <Td align="center">
                      <ActionIconsRow>
                        <IconButton
                          type="button"
                          onClick={() => handleEditClick(rec)}
                          title="Edit"
                          aria-label={`Edit licence ${rec.licence_name}`}
                        >
                          ✎
                        </IconButton>
                        <IconButton
                          type="button"
                          onClick={() => handleOpenRenewal(rec)}
                          title="Renewal"
                          aria-label={`Renew licence ${rec.licence_name}`}
                        >
                          ↻
                        </IconButton>
                      </ActionIconsRow>
                    </Td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <Td colSpan={9} align="center">
                    No licence records found
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {showRenewalModal && renewalTarget && (
        <ModalOverlay onMouseDown={handleCloseRenewal}>
          <ModalBox onMouseDown={(e) => e.stopPropagation()}>
            <CloseButton
              type="button"
              onClick={handleCloseRenewal}
              aria-label="Close"
            >
              ×
            </CloseButton>
            <ModalTitle>Renew Licence — {renewalTarget.licence_name}</ModalTitle>

            <FormRow>
              <Label>Renewal Date</Label>
              <Input
                type="date"
                name="renewal_date"
                value={renewalForm.renewal_date}
                onChange={handleRenewalChange}
              />
              {renewalErrors.renewal_date && (
                <ErrorText>{renewalErrors.renewal_date}</ErrorText>
              )}
            </FormRow>

            <FormRow>
              <Label>New Expiry Date</Label>
              <Input
                type="date"
                name="expiry_date"
                value={renewalForm.expiry_date}
                onChange={handleRenewalChange}
              />
              {renewalErrors.expiry_date && (
                <ErrorText>{renewalErrors.expiry_date}</ErrorText>
              )}
            </FormRow>

            {renewalError && <ErrorText>{renewalError}</ErrorText>}

            <ModalActions>
              <SecondaryButton type="button" onClick={handleCloseRenewal}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleRenewalSubmit} disabled={renewing}>
                {renewing ? "Renewing..." : "Renew"}
              </PrimaryButton>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}
    </Wrapper>
  );
};

export default LicenceMaster;