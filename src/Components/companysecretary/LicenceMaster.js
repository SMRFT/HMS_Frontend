import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  getLicenceMaster,
  getLicenceDetails,
  saveLicenceDetails,
  updateLicenceDetails,
  getInchargeList,
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
  ModalActions,
  PrimaryButton,
  SecondaryButton,
  AutocompleteWrapper,
  SuggestionsList,
  SuggestionItem,
  FieldRow,
} from "./LicenceMaster.styles";

const EMPTY_FORM = {
  licence_name: "",
  license_number: "",
  valid_from: "",
  expiry_date: "",
  incharge: "",
  respective_person: "",
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

  const employeeNameOptions = useMemo(
    () => inchargeOptions.map((emp) => emp.employeeName),
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

  /* --- Incharge (stores employeeId; query is the display text) --- */
  const handleInchargeQueryChange = (text) => {
    setInchargeQuery(text);
    setForm((prev) => ({ ...prev, incharge: "" }));
    setErrors((prev) => ({ ...prev, incharge: "" }));
    setShowInchargeSuggestions(true);
  };
  const handleSelectIncharge = (name) => {
    const emp = inchargeOptions.find((e) => e.employeeName === name);
    setInchargeQuery(name);
    setForm((prev) => ({ ...prev, incharge: emp ? emp.employeeId : "" }));
    setErrors((prev) => ({ ...prev, incharge: "" }));
    setShowInchargeSuggestions(false);
  };

  /* --- Respective person (stores employeeId; query is the display text) --- */
  const handleRespectivePersonQueryChange = (text) => {
    setRespectivePersonQuery(text);
    setForm((prev) => ({ ...prev, respective_person: "" }));
    setErrors((prev) => ({ ...prev, respective_person: "" }));
    setShowRespectivePersonSuggestions(true);
  };
  const handleSelectRespectivePerson = (name) => {
    const emp = inchargeOptions.find((e) => e.employeeName === name);
    setRespectivePersonQuery(name);
    setForm((prev) => ({
      ...prev,
      respective_person: emp ? emp.employeeId : "",
    }));
    setErrors((prev) => ({ ...prev, respective_person: "" }));
    setShowRespectivePersonSuggestions(false);
  };

  const handleEditClick = (rec) => {
    setIsEditMode(true);
    setEditingSNo(rec.s_no);
    setForm({
      licence_name: rec.licence_name || "",
      license_number: rec.license_number || "",
      valid_from: rec.valid_from ? rec.valid_from.slice(0, 10) : "",
      expiry_date: rec.expiry_date ? rec.expiry_date.slice(0, 10) : "",
      incharge: rec.incharge || "",
      respective_person: rec.respective_person || "",
    });
    setInchargeQuery(inchargeNameById[rec.incharge] || "");
    setRespectivePersonQuery(inchargeNameById[rec.respective_person] || "");
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
    if (!form.incharge) newErrors.incharge = "Required";
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
            <SearchableField
              label="Incharge"
              placeholder="Search incharge"
              query={inchargeQuery}
              onQueryChange={handleInchargeQueryChange}
              options={employeeNameOptions}
              onSelectOption={handleSelectIncharge}
              showSuggestions={showInchargeSuggestions}
              setShowSuggestions={setShowInchargeSuggestions}
              error={errors.incharge}
            />

            <SearchableField
              label="Respective Person"
              placeholder="Search respective person"
              query={respectivePersonQuery}
              onQueryChange={handleRespectivePersonQueryChange}
              options={employeeNameOptions}
              onSelectOption={handleSelectRespectivePerson}
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
                    <Td>{inchargeNameById[rec.incharge] || rec.incharge || "-"}</Td>
                    <Td>
                      {inchargeNameById[rec.respective_person] ||
                        rec.respective_person ||
                        "-"}
                    </Td>
                    <Td align="center">
                      <button
                        type="button"
                        onClick={() => handleEditClick(rec)}
                        title="Edit"
                        aria-label={`Edit licence ${rec.licence_name}`}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                          padding: "4px",
                        }}
                      >
                        ✎
                      </button>
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
    </Wrapper>
  );
};

export default LicenceMaster;