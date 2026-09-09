import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  bill_number: "",
  patient_name: "",
  mobile_number: "",
  doctor_name: [],
  staff_name: "",
  medicine_name: [],
  test_name: [],
  total_amount: "",
  doctor_fees: "",
  staff_nurse_fees: "",
  doctor_staff_fees_remaining: "",
  medicine_charge: "",
  hospital_amount: "",
  service_list: [],
  transportation_mode: "",
  reference_id: "",
  order_id: "",
};

const SERVICE_LIST = [
  "Blood Sample",
  "Medicine Delivery",
  "Doctor Consultation",
  "Procedures",
  "Doctor Second Opinion",
];

const TRANSPORTATION_MODES = [
  "Bus",
  "By Person",
];

export default function Registration360() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [medicineList, setMedicineList] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [testList, setTestList] = useState([]);
  const [testSearch, setTestSearch] = useState("");
  const [showTestDropdown, setShowTestDropdown] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

  const doctorDropdownRef = useRef(null);
  const serviceDropdownRef = useRef(null);
  const medicineDropdownRef = useRef(null);
  const testDropdownRef = useRef(null);

  // Close dropdowns only when clicking outside their container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(e.target)) {
        setShowDoctorDropdown(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target)) {
        setShowServiceDropdown(false);
      }
      if (medicineDropdownRef.current && !medicineDropdownRef.current.contains(e.target)) {
        setShowMedicineDropdown(false);
      }
      if (testDropdownRef.current && !testDropdownRef.current.contains(e.target)) {
        setShowTestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch active medicines, doctors, and tests on mount
  useEffect(() => {
    apiRequest(`${Hmsbaseurl}get_360_medicinelist/`, "GET")
      .then((res) => { if (res.success) setMedicineList(res.data); })
      .catch(() => {});
    apiRequest(`${Hmsbaseurl}get_360_doctorlist/`, "GET")
      .then((res) => { if (res.success) setDoctorList(res.data); })
      .catch(() => {});
    apiRequest(`${Hmsbaseurl}get_360_testlist/`, "GET")
      .then((res) => { if (res.success) setTestList(res.data); })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patient_name.trim()) errs.patient_name = "Patient name is required";
    if (!form.mobile_number.trim()) errs.mobile_number = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile_number.trim()))
      errs.mobile_number = "Enter a valid 10-digit mobile number";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest(
        `${Hmsbaseurl}360_registration/`,
        "POST",
        form
      );
      if (res.success) {
        toast.success("Registration saved successfully!");
        setForm(initialForm);
        setErrors({});
        setMedicineSearch("");
        setSelectedMedicines([]);
        setShowMedicineDropdown(false);
        setDoctorSearch("");
        setSelectedDoctors([]);
        setShowDoctorDropdown(false);
        setTestSearch("");
        setSelectedTests([]);
        setShowTestDropdown(false);
        setServiceSearch("");
        setSelectedServices([]);
        setShowServiceDropdown(false);
      } else {
        toast.error(res.error || "Failed to save registration");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setMedicineSearch("");
    setSelectedMedicines([]);
    setShowMedicineDropdown(false);
    setDoctorSearch("");
    setSelectedDoctors([]);
    setShowDoctorDropdown(false);
    setTestSearch("");
    setSelectedTests([]);
    setShowTestDropdown(false);
    setServiceSearch("");
    setSelectedServices([]);
    setShowServiceDropdown(false);
  };

  // Multi-select handlers for Doctor Name
  const toggleDoctor = (docName) => {
    setSelectedDoctors((prev) => {
      const updated = prev.includes(docName)
        ? prev.filter((d) => d !== docName)
        : [...prev, docName];
      setForm((f) => ({ ...f, doctor_name: updated }));
      return updated;
    });
  };

  const removeDoctor = (docName) => {
    setSelectedDoctors((prev) => {
      const updated = prev.filter((d) => d !== docName);
      setForm((f) => ({ ...f, doctor_name: updated }));
      return updated;
    });
  };

  // Multi-select handlers for Medicine Name
  const toggleMedicine = (title) => {
    setSelectedMedicines((prev) => {
      const updated = prev.includes(title)
        ? prev.filter((m) => m !== title)
        : [...prev, title];
      setForm((f) => ({ ...f, medicine_name: updated }));
      return updated;
    });
  };

  const removeMedicine = (title) => {
    setSelectedMedicines((prev) => {
      const updated = prev.filter((m) => m !== title);
      setForm((f) => ({ ...f, medicine_name: updated }));
      return updated;
    });
  };

  // Multi-select handlers for Test Name
  const toggleTest = (testName) => {
    setSelectedTests((prev) => {
      const updated = prev.includes(testName)
        ? prev.filter((t) => t !== testName)
        : [...prev, testName];
      setForm((f) => ({ ...f, test_name: updated }));
      return updated;
    });
  };

  const removeTest = (testName) => {
    setSelectedTests((prev) => {
      const updated = prev.filter((t) => t !== testName);
      setForm((f) => ({ ...f, test_name: updated }));
      return updated;
    });
  };

  // Multi-select handlers for Service List
  const toggleService = (serviceItem) => {
    setSelectedServices((prev) => {
      const updated = prev.includes(serviceItem)
        ? prev.filter((s) => s !== serviceItem)
        : [...prev, serviceItem];
      setForm((f) => ({ ...f, service_list: updated }));
      return updated;
    });
  };

  const removeService = (serviceItem) => {
    setSelectedServices((prev) => {
      const updated = prev.filter((s) => s !== serviceItem);
      setForm((f) => ({ ...f, service_list: updated }));
      return updated;
    });
  };

  return (
    <div style={styles.page}>


      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h1 style={styles.headerTitle}>360° Registration</h1>
            <p style={styles.headerSub}>Complete patient &amp; billing registration</p>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => navigate("/360Reports")}
            style={styles.viewReportsBtn}
          >
            📊 View Reports
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.formCard}>

        {/* Section: Patient Info */}
        <SectionTitle icon="🧑‍⚕️" title="Patient Information" />
        <div style={styles.grid3}>
          <Field label="Date" name="date" type="date" value={form.date} onChange={handleChange} error={errors.date} />
          <Field label="Bill Number" name="bill_number" value={form.bill_number} onChange={handleChange} placeholder="e.g. BILL-2024-001" />
          <Field label="Reference ID" name="reference_id" value={form.reference_id} onChange={handleChange} placeholder="Reference ID" />
        </div>
        <div style={styles.grid3}>
          <Field label="Patient Name *" name="patient_name" value={form.patient_name} onChange={handleChange} placeholder="Full patient name" error={errors.patient_name} />
          <Field label="Mobile Number *" name="mobile_number" value={form.mobile_number} onChange={handleChange} placeholder="10-digit mobile" error={errors.mobile_number} maxLength={10} />
          <Field label="Order ID" name="order_id" value={form.order_id} onChange={handleChange} placeholder="Order ID" />
        </div>

        {/* Section: Consultation */}
        <SectionTitle icon="🏥" title="Consultation Details" />
        <div style={styles.grid3}>
          {/* Doctor Name — searchable multi-select dropdown */}
          <div style={{ ...styles.fieldWrap, position: "relative" }} ref={doctorDropdownRef}>
            <label style={styles.label}>
              Doctor Name
              {selectedDoctors.length > 0 && (
                <span style={styles.medBadge}>{selectedDoctors.length} selected</span>
              )}
            </label>

            {/* Selected chips */}
            {selectedDoctors.length > 0 && (
              <div style={styles.chipWrap}>
                {selectedDoctors.map((d) => (
                  <span key={d} style={styles.chip}>
                    {d}
                    <button
                      type="button"
                      style={styles.chipRemove}
                      onMouseDown={(e) => { e.preventDefault(); removeDoctor(d); }}
                      onClick={() => removeDoctor(d)}
                    >×</button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder={showDoctorDropdown ? "Search doctor..." : "Click to select doctors"}
              value={doctorSearch}
              onChange={(e) => {
                setDoctorSearch(e.target.value);
                setShowDoctorDropdown(true);
              }}
              onFocus={() => setShowDoctorDropdown(true)}
              style={styles.input}
              autoComplete="off"
            />
            {showDoctorDropdown && doctorList.length > 0 && (
              <div style={styles.medicineDropdown} onMouseDown={(e) => e.stopPropagation()}>
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  {doctorList
                    .filter((d) => d.toLowerCase().includes(doctorSearch.toLowerCase()))
                    .slice(0, 50)
                    .map((d) => {
                      const isSelected = selectedDoctors.includes(d);
                      return (
                        <div
                          key={d}
                          style={{
                            ...styles.medicineOption,
                            background: isSelected ? "#ccfbf1" : "#fff",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#f0fdf9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isSelected ? "#ccfbf1" : "#fff";
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            toggleDoctor(d);
                          }}
                        >
                          <span style={styles.checkIcon}>
                            {isSelected ? "✓" : ""}
                          </span>
                          {d}
                        </div>
                      );
                    })}
                  {doctorList.filter((d) => d.toLowerCase().includes(doctorSearch.toLowerCase())).length === 0 && (
                    <div style={{ ...styles.medicineOption, color: "#9ca3af", cursor: "default" }}>No doctors found</div>
                  )}
                </div>
                <div style={styles.doneWrap}>
                  <button
                    type="button"
                    style={styles.doneBtn}
                    onClick={() => setShowDoctorDropdown(false)}
                  >
                    ✓ Done ({selectedDoctors.length} selected)
                  </button>
                </div>
              </div>
            )}
            {doctorList.length === 0 && (
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Loading doctors...</span>
            )}
          </div>
          <Field label="Staff Name" name="staff_name" value={form.staff_name} onChange={handleChange} placeholder="Assigned staff / nurse" />
          {/* Service List — multi-select dropdown */}
          <div style={{ ...styles.fieldWrap, position: "relative" }} ref={serviceDropdownRef}>
            <label style={styles.label}>
              Service List
              {selectedServices.length > 0 && (
                <span style={styles.medBadge}>{selectedServices.length} selected</span>
              )}
            </label>

            {/* Selected chips */}
            {selectedServices.length > 0 && (
              <div style={styles.chipWrap}>
                {selectedServices.map((s) => (
                  <span key={s} style={styles.chip}>
                    {s}
                    <button
                      type="button"
                      style={styles.chipRemove}
                      onMouseDown={(e) => { e.preventDefault(); removeService(s); }}
                      onClick={() => removeService(s)}
                    >×</button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder={showServiceDropdown ? "Search service..." : "Click to select services"}
              value={serviceSearch}
              onChange={(e) => {
                setServiceSearch(e.target.value);
                setShowServiceDropdown(true);
              }}
              onFocus={() => setShowServiceDropdown(true)}
              style={styles.input}
              autoComplete="off"
            />
            {showServiceDropdown && (
              <div style={styles.medicineDropdown} onMouseDown={(e) => e.stopPropagation()}>
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  {SERVICE_LIST
                    .filter((s) => s.toLowerCase().includes(serviceSearch.toLowerCase()))
                    .map((s) => {
                      const isSelected = selectedServices.includes(s);
                      return (
                        <div
                          key={s}
                          style={{
                            ...styles.medicineOption,
                            background: isSelected ? "#ccfbf1" : "#fff",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#f0fdf9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isSelected ? "#ccfbf1" : "#fff";
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            toggleService(s);
                          }}
                        >
                          <span style={styles.checkIcon}>
                            {isSelected ? "✓" : ""}
                          </span>
                          {s}
                        </div>
                      );
                    })}
                  {SERVICE_LIST.filter((s) => s.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                    <div style={{ ...styles.medicineOption, color: "#9ca3af", cursor: "default" }}>No services found</div>
                  )}
                </div>
                <div style={styles.doneWrap}>
                  <button
                    type="button"
                    style={styles.doneBtn}
                    onClick={() => setShowServiceDropdown(false)}
                  >
                    ✓ Done ({selectedServices.length} selected)
                  </button>
                </div>
              </div>
            )}
          </div>
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Transportation Mode</label>
            <select name="transportation_mode" value={form.transportation_mode} onChange={handleChange} style={styles.input}>
              <option value="">-- Select Mode --</option>
              {TRANSPORTATION_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={styles.grid3}>
          {/* Medicine Name — multi-select dropdown */}
          <div style={{ ...styles.fieldWrap, position: "relative" }} ref={medicineDropdownRef}>
            <label style={styles.label}>
              Medicine Name
              {selectedMedicines.length > 0 && (
                <span style={styles.medBadge}>{selectedMedicines.length} selected</span>
              )}
            </label>

            {/* Selected chips */}
            {selectedMedicines.length > 0 && (
              <div style={styles.chipWrap}>
                {selectedMedicines.map((m) => (
                  <span key={m} style={styles.chip}>
                    {m}
                    <button
                      type="button"
                      style={styles.chipRemove}
                      onMouseDown={(e) => { e.preventDefault(); removeMedicine(m); }}
                      onClick={() => removeMedicine(m)}
                    >×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input */}
            <input
              type="text"
              placeholder={showMedicineDropdown ? "Search medicine..." : "Click to select medicines"}
              value={medicineSearch}
              onChange={(e) => setMedicineSearch(e.target.value)}
              onFocus={() => setShowMedicineDropdown(true)}
              style={styles.input}
              autoComplete="off"
            />

            {/* Dropdown */}
            {showMedicineDropdown && medicineList.length > 0 && (
              <div style={styles.medicineDropdown} onMouseDown={(e) => e.stopPropagation()}>
                {/* List */}
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  {medicineList
                    .filter((m) =>
                      m.title.toLowerCase().includes(medicineSearch.toLowerCase())
                    )
                    .slice(0, 80)
                    .map((m) => {
                      const isSelected = selectedMedicines.includes(m.title);
                      return (
                        <div
                          key={m.title}
                          style={{
                            ...styles.medicineOption,
                            background: isSelected ? "#ccfbf1" : "#fff",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#f0fdf9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isSelected ? "#ccfbf1" : "#fff";
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            toggleMedicine(m.title);
                          }}
                        >
                          <span style={styles.checkIcon}>
                            {isSelected ? "✓" : ""}
                          </span>
                          {m.title}
                        </div>
                      );
                    })}
                  {medicineList.filter((m) =>
                    m.title.toLowerCase().includes(medicineSearch.toLowerCase())
                  ).length === 0 && (
                    <div style={{ ...styles.medicineOption, color: "#9ca3af", cursor: "default" }}>
                      No medicines found
                    </div>
                  )}
                </div>

                {/* Done button */}
                <div style={styles.doneWrap}>
                  <button
                    type="button"
                    style={styles.doneBtn}
                    onClick={() => setShowMedicineDropdown(false)}
                  >
                    ✓ Done ({selectedMedicines.length} selected)
                  </button>
                </div>
              </div>
            )}

            {medicineList.length === 0 && (
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Loading medicines...</span>
            )}
          </div>

          {/* Test Name — multi-select dropdown */}
          <div style={{ ...styles.fieldWrap, position: "relative" }} ref={testDropdownRef}>
            <label style={styles.label}>
              Test Name
              {selectedTests.length > 0 && (
                <span style={styles.medBadge}>{selectedTests.length} selected</span>
              )}
            </label>

            {/* Selected chips */}
            {selectedTests.length > 0 && (
              <div style={styles.chipWrap}>
                {selectedTests.map((t) => (
                  <span key={t} style={styles.chip}>
                    {t}
                    <button
                      type="button"
                      style={styles.chipRemove}
                      onMouseDown={(e) => { e.preventDefault(); removeTest(t); }}
                      onClick={() => removeTest(t)}
                    >×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input */}
            <input
              type="text"
              placeholder={showTestDropdown ? "Search test..." : "Click to select tests"}
              value={testSearch}
              onChange={(e) => setTestSearch(e.target.value)}
              onFocus={() => setShowTestDropdown(true)}
              style={styles.input}
              autoComplete="off"
            />

            {/* Dropdown */}
            {showTestDropdown && testList.length > 0 && (
              <div style={styles.medicineDropdown} onMouseDown={(e) => e.stopPropagation()}>
                {/* List */}
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  {testList
                    .filter((t) =>
                      t.toLowerCase().includes(testSearch.toLowerCase())
                    )
                    .slice(0, 80)
                    .map((t) => {
                      const isSelected = selectedTests.includes(t);
                      return (
                        <div
                          key={t}
                          style={{
                            ...styles.medicineOption,
                            background: isSelected ? "#ccfbf1" : "#fff",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#f0fdf9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isSelected ? "#ccfbf1" : "#fff";
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            toggleTest(t);
                          }}
                        >
                          <span style={styles.checkIcon}>
                            {isSelected ? "✓" : ""}
                          </span>
                          {t}
                        </div>
                      );
                    })}
                  {testList.filter((t) =>
                    t.toLowerCase().includes(testSearch.toLowerCase())
                  ).length === 0 && (
                    <div style={{ ...styles.medicineOption, color: "#9ca3af", cursor: "default" }}>
                      No tests found
                    </div>
                  )}
                </div>

                {/* Done button */}
                <div style={styles.doneWrap}>
                  <button
                    type="button"
                    style={styles.doneBtn}
                    onClick={() => setShowTestDropdown(false)}
                  >
                    ✓ Done ({selectedTests.length} selected)
                  </button>
                </div>
              </div>
            )}

            {testList.length === 0 && (
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Loading tests...</span>
            )}
          </div>
        </div>

        {/* Section: Financial */}
        <SectionTitle icon="💰" title="Financial Details" />
        <div style={styles.grid3}>
          <Field label="Total Amount (₹)" name="total_amount" type="number" value={form.total_amount} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
          <Field label="Doctor Fees (₹)" name="doctor_fees" type="number" value={form.doctor_fees} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
          <Field label="Staff / Nurse Fees (₹)" name="staff_nurse_fees" type="number" value={form.staff_nurse_fees} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
        </div>
        <div style={styles.grid3}>
          <Field label="Doctor & Staff Fees Remaining (₹)" name="doctor_staff_fees_remaining" type="number" value={form.doctor_staff_fees_remaining} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
          <Field label="Medicine Charge (₹)" name="medicine_charge" type="number" value={form.medicine_charge} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
          <Field label="Hospital Amount (₹)" name="hospital_amount" type="number" value={form.hospital_amount} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button type="button" onClick={handleReset} style={styles.resetBtn} disabled={loading}>
            Reset
          </button>
          <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }} disabled={loading}>
            {loading ? (
              <span style={styles.spinner}>Saving...</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Save Registration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Sub-components */
function SectionTitle({ icon, title }) {
  return (
    <div style={styles.sectionTitle}>
      <span style={{ marginRight: 8, fontSize: 16 }}>{icon}</span>
      {title}
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder, error, step, min, maxLength }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        maxLength={maxLength}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
        autoComplete="off"
      />
      {error && <span style={styles.errorMsg}>{error}</span>}
    </div>
  );
}

/* Styles */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fafa 0%, #f8fffe 100%)",
    padding: "24px 20px 48px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "linear-gradient(135deg, #0d9488, #0f766e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(13,148,136,0.30)",
  },
  headerTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#0f3d3a",
    letterSpacing: "-0.3px",
  },
  headerSub: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#6b7280",
  },
  viewReportsBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#ffffff",
    color: "#0f766e",
    border: "1.5px solid #0d9488",
    borderRadius: 10,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(13,148,136,0.15)",
    transition: "all 0.15s ease",
  },
  formCard: {
    background: "#fff",
    borderRadius: 20,
    padding: "32px 36px",
    boxShadow: "0 4px 30px rgba(13,148,136,0.08)",
    border: "1px solid #ccfbf1",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0d9488",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 16,
    marginTop: 28,
    paddingBottom: 8,
    borderBottom: "1.5px solid #ccfbf1",
    display: "flex",
    alignItems: "center",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px 20px",
    marginBottom: 16,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px 20px",
    marginBottom: 16,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#374151",
    letterSpacing: "0.1px",
  },
  input: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    color: "#111827",
    background: "#fafafa",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  inputError: {
    borderColor: "#f87171",
    background: "#fff5f5",
  },
  errorMsg: {
    fontSize: 11.5,
    color: "#ef4444",
    marginTop: 2,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 32,
    paddingTop: 20,
    borderTop: "1.5px solid #f3f4f6",
  },
  resetBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    border: "1.5px solid #d1d5db",
    background: "#fff",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 28px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #0d9488, #0f766e)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 14px rgba(13,148,136,0.30)",
  },
  spinner: {
    fontSize: 14,
  },
  medicineDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1.5px solid #99f6e4",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(13,148,136,0.12)",
    zIndex: 999,
    marginTop: 4,
  },
  medicineOption: {
    padding: "9px 14px",
    fontSize: 13.5,
    color: "#111827",
    cursor: "pointer",
    background: "#fff",
    borderBottom: "1px solid #f3f4f6",
    transition: "background 0.15s",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  checkIcon: {
    display: "inline-block",
    width: 16,
    color: "#0d9488",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
  },
  chipWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px 6px",
    marginBottom: 6,
    padding: "6px 8px",
    background: "#f0fdf9",
    borderRadius: 8,
    border: "1.5px solid #99f6e4",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 20,
    background: "#ccfbf1",
    color: "#0f766e",
    fontSize: 12,
    fontWeight: 600,
  },
  chipRemove: {
    border: "none",
    background: "transparent",
    color: "#0d9488",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
    padding: "0 2px",
    fontWeight: 700,
  },
  medBadge: {
    marginLeft: 8,
    padding: "2px 8px",
    borderRadius: 20,
    background: "#0d9488",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
  },
  doneWrap: {
    padding: "8px 10px",
    borderTop: "1.5px solid #99f6e4",
    background: "#f0fdf9",
    borderRadius: "0 0 10px 10px",
  },
  doneBtn: {
    width: "100%",
    padding: "8px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #0d9488, #0f766e)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
};

