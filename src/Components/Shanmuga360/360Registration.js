import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  bill_number: "",
  medicine_bill_number: "",
  lab_test_bill_number: "",
  patient_name: "",
  mobile_number: "",
  doctor_name: [],
  staff_name: "",
  medicine_name: [],
  test_name: [],
  total_amount: "",
  home_care_type: "",
  cash_collected_amount: "",
  doctor_fees: "",
  staff_nurse_fees: "",
  doctor_staff_fees_remaining: "",
  medicine_charge: "",
  hospital_amount: "",
  service_list: [],
  transportation_mode: "",
  sample_collector: "",
  reference_id: "",
  order_id: "",
};

const HOME_CARE_TYPES = [
  "Dr + Staff Nurse Visit",
  "Nursing Care",
];

const SERVICE_LIST = [
  "Lab Test",
  "Medicine Delivery",
  "Home Care",
  "Ambulance",
  "Doctor Second Opinion",
];

const TRANSPORTATION_MODES = [
  "Bus",
  "By Person",
  "Cab",
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
  const [sampleCollectorList, setSampleCollectorList] = useState([]);

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

  // Fetch active medicines, doctors, tests, and sample collectors on mount
  useEffect(() => {
    apiRequest(`${Hmsbaseurl}get_360_medicinelist/`, "GET")
      .then((res) => { if (res.success) setMedicineList(res.data); })
      .catch(() => { });
    apiRequest(`${Hmsbaseurl}get_360_doctorlist/`, "GET")
      .then((res) => { if (res.success) setDoctorList(res.data); })
      .catch(() => { });
    apiRequest(`${Hmsbaseurl}get_360_testlist/`, "GET")
      .then((res) => { if (res.success) setTestList(res.data); })
      .catch(() => { });
    apiRequest(`${Hmsbaseurl}sample_collector/`, "GET")
      .then((res) => {
        if (res.success) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          setSampleCollectorList(list);
        }
      })
      .catch(() => { });
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
      const payload = {
        ...form,
        lab_test_bill_number: form.lab_test_bill_number || form.labtestbillnumber || "",
        labtestbillnumber: form.labtestbillnumber || form.lab_test_bill_number || "",
        test_name: selectedTests.map((t) => ({
          test_name: typeof t === "string" ? t : (t.test_name || ""),
          amount: typeof t === "string" ? 0 : (t.amount !== "" && !isNaN(Number(t.amount)) ? Number(t.amount) : 0),
        })),
        medicine_name: selectedMedicines.map((m) => ({
          medicine_name: typeof m === "string" ? m : (m.medicine_name || m.title || ""),
          title: typeof m === "string" ? m : (m.title || m.medicine_name || ""),
          amount: typeof m === "string" ? 0 : (m.amount !== "" && !isNaN(Number(m.amount)) ? Number(m.amount) : 0),
        })),
        doctor_name: selectedDoctors,
        service_list: selectedServices,
      };
      const res = await apiRequest(
        `${Hmsbaseurl}360_registration/`,
        "POST",
        payload
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

  const isLabTest = selectedServices.some((s) => s.toLowerCase() === "lab test");
  const isMedicineDelivery = selectedServices.some((s) => s.toLowerCase() === "medicine delivery");
  const isHomeCare = selectedServices.some((s) => s.toLowerCase() === "home care");

  const testsTotal = selectedTests.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const medicinesTotal = selectedMedicines.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  // Auto-calculate Total Amount, Staff Nurse Fees, Remaining, Hospital Amount and Medicine Charge
  useEffect(() => {
    const tTotal = selectedTests.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const mTotal = selectedMedicines.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

    if (isHomeCare && form.home_care_type === "Dr + Staff Nurse Visit") {
      const hasCash = form.cash_collected_amount !== "" && !isNaN(Number(form.cash_collected_amount));
      const cash = hasCash ? Number(form.cash_collected_amount) : 0;
      const dFees = Number(form.doctor_fees) || 0;
      const remAfterDr = Math.max(0, cash - dFees);
      const sFees = Math.round(remAfterDr * 0.20 * 100) / 100;
      const remAmt = Math.max(0, remAfterDr - sFees);
      const medCharge = isMedicineDelivery ? (mTotal > 0 ? mTotal : (Number(form.medicine_charge) || 0)) : 0;
      const hAmt = (hasCash ? remAmt : 0) + medCharge;
      const grand = (hasCash ? cash : 0) + medCharge + (isLabTest ? tTotal : 0);

      setForm((prev) => ({
        ...prev,
        staff_nurse_fees: hasCash ? sFees.toFixed(2) : "",
        doctor_staff_fees_remaining: hasCash ? remAmt.toFixed(2) : "",
        hospital_amount: hAmt > 0 ? hAmt.toFixed(2) : "",
        medicine_charge: isMedicineDelivery && mTotal > 0 ? mTotal.toFixed(2) : (isMedicineDelivery ? prev.medicine_charge : ""),
        total_amount: grand > 0 ? grand.toFixed(2) : "",
      }));
    } else if (isHomeCare && form.home_care_type === "Nursing Care") {
      const hasCash = form.cash_collected_amount !== "" && !isNaN(Number(form.cash_collected_amount));
      const cash = hasCash ? Number(form.cash_collected_amount) : 0;
      const sFees = Math.round(cash * 0.20 * 100) / 100;
      const remAmt = Math.max(0, cash - sFees);
      const medCharge = isMedicineDelivery ? (mTotal > 0 ? mTotal : (Number(form.medicine_charge) || 0)) : 0;
      const hAmt = (hasCash ? remAmt : 0) + medCharge;
      const grand = (hasCash ? cash : 0) + medCharge + (isLabTest ? tTotal : 0);

      setForm((prev) => ({
        ...prev,
        doctor_fees: "",
        staff_nurse_fees: hasCash ? sFees.toFixed(2) : "",
        doctor_staff_fees_remaining: hasCash ? remAmt.toFixed(2) : "",
        hospital_amount: hAmt > 0 ? hAmt.toFixed(2) : "",
        medicine_charge: isMedicineDelivery && mTotal > 0 ? mTotal.toFixed(2) : (isMedicineDelivery ? prev.medicine_charge : ""),
        total_amount: grand > 0 ? grand.toFixed(2) : "",
      }));
    } else {
      const dFees = isHomeCare ? (Number(form.doctor_fees) || 0) : 0;
      const nFees = isHomeCare ? (Number(form.staff_nurse_fees) || 0) : 0;
      const hAmt = Number(form.hospital_amount) || 0;
      const grand = (isLabTest ? tTotal : 0) + (isMedicineDelivery ? mTotal : 0) + dFees + nFees + hAmt;
      const rem = dFees + nFees;

      setForm((prev) => ({
        ...prev,
        medicine_charge: isMedicineDelivery && mTotal > 0 ? mTotal.toFixed(2) : (isMedicineDelivery ? prev.medicine_charge : ""),
        doctor_staff_fees_remaining: isHomeCare && rem > 0 ? rem.toFixed(2) : (isHomeCare ? prev.doctor_staff_fees_remaining : ""),
        total_amount: grand > 0 ? grand.toFixed(2) : "",
      }));
    }
  }, [
    selectedTests,
    selectedMedicines,
    form.cash_collected_amount,
    form.doctor_fees,
    form.home_care_type,
    form.hospital_amount,
    isLabTest,
    isMedicineDelivery,
    isHomeCare,
  ]);

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
  const toggleMedicine = (medItem) => {
    const mTitle = typeof medItem === "string" ? medItem : (medItem.medicine_name || medItem.title);
    const mPrice = typeof medItem === "string" ? 0 : (Number(medItem.product_price ?? medItem.amount) || 0);

    setSelectedMedicines((prev) => {
      const exists = prev.some((m) => (typeof m === "string" ? m : (m.medicine_name || m.title)) === mTitle);
      let updated;
      if (exists) {
        updated = prev.filter((m) => (typeof m === "string" ? m : (m.medicine_name || m.title)) !== mTitle);
      } else {
        updated = [...prev, { medicine_name: mTitle, title: mTitle, amount: mPrice }];
      }
      setForm((f) => ({
        ...f,
        medicine_name: updated,
      }));
      return updated;
    });
  };

  const removeMedicine = (title) => {
    setSelectedMedicines((prev) => {
      const updated = prev.filter((m) => (typeof m === "string" ? m : (m.medicine_name || m.title)) !== title);
      setForm((f) => ({
        ...f,
        medicine_name: updated,
      }));
      return updated;
    });
  };

  const handleMedicineAmountChange = (index, val) => {
    setSelectedMedicines((prev) => {
      const updated = [...prev];
      const parsedAmt = val === "" ? "" : (Number(val) || 0);
      updated[index] = {
        ...updated[index],
        amount: parsedAmt,
      };
      setForm((f) => ({
        ...f,
        medicine_name: updated,
      }));
      return updated;
    });
  };

  // Multi-select handlers for Test Name
  const toggleTest = (testItem) => {
    const tName = typeof testItem === "string" ? testItem : testItem.test_name;
    const tAmount = typeof testItem === "string" ? 0 : (Number(testItem.amount) || 0);

    setSelectedTests((prev) => {
      const exists = prev.some((t) => (typeof t === "string" ? t : t.test_name) === tName);
      let updated;
      if (exists) {
        updated = prev.filter((t) => (typeof t === "string" ? t : t.test_name) !== tName);
      } else {
        updated = [...prev, { test_name: tName, amount: tAmount }];
      }
      setForm((f) => ({
        ...f,
        test_name: updated,
      }));
      return updated;
    });
  };

  const removeTest = (testName) => {
    setSelectedTests((prev) => {
      const updated = prev.filter((t) => (typeof t === "string" ? t : t.test_name) !== testName);
      setForm((f) => ({
        ...f,
        test_name: updated,
      }));
      return updated;
    });
  };

  const handleTestAmountChange = (index, val) => {
    setSelectedTests((prev) => {
      const updated = [...prev];
      const parsedAmt = val === "" ? "" : (Number(val) || 0);
      updated[index] = {
        ...updated[index],
        amount: parsedAmt,
      };
      setForm((f) => ({
        ...f,
        test_name: updated,
      }));
      return updated;
    });
  };

  // Multi-select handlers for Service List
  const toggleService = (serviceItem) => {
    setSelectedServices((prev) => {
      const exists = prev.includes(serviceItem);
      const updated = exists
        ? prev.filter((s) => s !== serviceItem)
        : [...prev, serviceItem];

      // Cleanup when unchecking services
      const itemLower = serviceItem.toLowerCase();
      if (exists) {
        if (itemLower === "lab test") {
          setSelectedTests([]);
          setForm((f) => ({
            ...f,
            test_name: [],
            transportation_mode: "",
            sample_collector: updated.some((s) => s.toLowerCase() === "medicine delivery") ? f.sample_collector : "",
            lab_test_bill_number: "",
            labtestbillnumber: "",
          }));
        } else if (itemLower === "medicine delivery") {
          setSelectedMedicines([]);
          setForm((f) => ({
            ...f,
            medicine_name: [],
            medicine_charge: "",
            medicine_bill_number: "",
            sample_collector: updated.some((s) => s.toLowerCase() === "lab test") ? f.sample_collector : "",
          }));
        } else if (itemLower === "home care") {
          setSelectedDoctors([]);
          setForm((f) => ({
            ...f,
            home_care_type: "",
            cash_collected_amount: "",
            doctor_name: [],
            staff_name: "",
            doctor_fees: "",
            staff_nurse_fees: "",
            doctor_staff_fees_remaining: "",
          }));
        }
      }

      setForm((f) => ({ ...f, service_list: updated }));
      return updated;
    });
  };

  const removeService = (serviceItem) => {
    toggleService(serviceItem);
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
          <Field label="Patient Name *" name="patient_name" value={form.patient_name} onChange={handleChange} placeholder="Full patient name" error={errors.patient_name} />
          <Field label="Mobile Number *" name="mobile_number" value={form.mobile_number} onChange={handleChange} placeholder="10-digit mobile" error={errors.mobile_number} maxLength={10} />
        </div>

        {/* Section: Consultation */}
        <SectionTitle icon="🏥" title="Consultation & Service Details" />
        <div style={{ marginBottom: 16 }}>
          {/* Service List — multi-select dropdown */}
          <div style={{ ...styles.fieldWrap, position: "relative", maxWidth: 360 }} ref={serviceDropdownRef}>
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
                <div style={{ maxHeight: 170, overflowY: "auto" }}>
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
        </div>

        {/* Home Care Details: Service Type, Nurse Name & Doctor Name on the same row */}
        {isHomeCare && (
          <div style={{ marginBottom: 16 }}>
            <div style={form.home_care_type === "Dr + Staff Nurse Visit" ? styles.grid3 : styles.grid2}>
              {/* Home Care Service Type Dropdown */}
              <div style={{ ...styles.fieldWrap, maxWidth: 360 }}>
                <label style={styles.label}>Home Care Service Type</label>
                <select
                  name="home_care_type"
                  value={form.home_care_type}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => {
                      if (val === "Nursing Care") {
                        return {
                          ...prev,
                          home_care_type: val,
                          doctor_fees: "",
                          doctor_name: [],
                        };
                      }
                      return {
                        ...prev,
                        home_care_type: val,
                      };
                    });
                  }}
                  style={styles.input}
                >
                  <option value="">-- Select Home Care Type --</option>
                  {HOME_CARE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Staff Name -> Nurse Name */}
              <Field
                label="Nurse Name"
                name="staff_name"
                value={form.staff_name}
                onChange={handleChange}
                placeholder="Assigned nurse"
              />

              {/* Doctor Name — only shown when Dr + Staff Nurse Visit is selected (same row) */}
              {form.home_care_type === "Dr + Staff Nurse Visit" && (
                <div style={{ ...styles.fieldWrap, position: "relative", maxWidth: 360 }} ref={doctorDropdownRef}>
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
                      <div style={{ maxHeight: 170, overflowY: "auto" }}>
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
              )}
            </div>
          </div>
        )}

        {/* Lab Test Details: Transportation Mode, Lab Test Bill Number & Test Name Table */}
        {isLabTest && (
          <div style={{ marginBottom: 16 }}>
            <div style={form.transportation_mode === "By Person" ? styles.grid3 : styles.grid2}>
              {/* Transportation Mode */}
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Transportation Mode</label>
                <select
                  name="transportation_mode"
                  value={form.transportation_mode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      transportation_mode: val,
                      sample_collector: val === "By Person" ? prev.sample_collector : "",
                    }));
                    if (errors.transportation_mode) {
                      setErrors((prev) => ({ ...prev, transportation_mode: "" }));
                    }
                  }}
                  style={styles.input}
                >
                  <option value="">-- Select Mode --</option>
                  {TRANSPORTATION_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Sample Collector */}
              {form.transportation_mode === "By Person" && (
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Sample Collector</label>
                  <select
                    name="sample_collector"
                    value={form.sample_collector}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="">-- Select Sample Collector --</option>
                    {sampleCollectorList.map((sc) => {
                      const scName = typeof sc === "string" ? sc : (sc.employeeName || "");
                      return (
                        <option key={scName} value={scName}>
                          {scName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Lab Test Bill Number */}
              <Field
                label="Lab Test Bill Number"
                name="labtestbillnumber"
                value={form.labtestbillnumber || form.lab_test_bill_number || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    labtestbillnumber: val,
                    lab_test_bill_number: val,
                  }));
                }}
                placeholder="e.g. LAB-BILL-001"
              />
            </div>

            {/* Test Name — multi-select dropdown */}
            <div style={{ ...styles.fieldWrap, position: "relative", marginTop: 14, maxWidth: 360 }} ref={testDropdownRef}>
              <label style={styles.label}>
                Test Name
                {selectedTests.length > 0 && (
                  <span style={styles.medBadge}>{selectedTests.length} selected</span>
                )}
              </label>

              {/* Search input */}
              <input
                type="text"
                placeholder={showTestDropdown ? "Search test..." : (selectedTests.length > 0 ? `${selectedTests.length} test(s) selected — click to add more` : "Click to select tests")}
                value={testSearch}
                onChange={(e) => {
                  setTestSearch(e.target.value);
                  setShowTestDropdown(true);
                }}
                onFocus={() => setShowTestDropdown(true)}
                style={styles.input}
                autoComplete="off"
              />

              {/* Dropdown */}
              {showTestDropdown && testList.length > 0 && (
                <div style={styles.medicineDropdown} onMouseDown={(e) => e.stopPropagation()}>
                  <div style={{ maxHeight: 170, overflowY: "auto" }}>
                    {testList
                      .filter((t) => {
                        const tName = typeof t === "string" ? t : t.test_name;
                        return tName.toLowerCase().includes(testSearch.toLowerCase());
                      })
                      .slice(0, 80)
                      .map((t) => {
                        const tName = typeof t === "string" ? t : t.test_name;
                        const tAmt = typeof t === "string" ? 0 : (Number(t.amount) || 0);
                        const isSelected = selectedTests.some((st) => (typeof st === "string" ? st : st.test_name) === tName);
                        return (
                          <div
                            key={tName}
                            style={{
                              ...styles.medicineOption,
                              background: isSelected ? "#ccfbf1" : "#fff",
                              fontWeight: isSelected ? 600 : 400,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
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
                            <span style={{ display: "flex", alignItems: "center" }}>
                              <span style={styles.checkIcon}>
                                {isSelected ? "✓" : ""}
                              </span>
                              {tName}
                            </span>
                            {tAmt > 0 && (
                              <span style={{ fontSize: 12, color: "#0f766e", fontWeight: 600 }}>
                                ₹{tAmt.toFixed(2)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    {testList.filter((t) => {
                      const tName = typeof t === "string" ? t : t.test_name;
                      return tName.toLowerCase().includes(testSearch.toLowerCase());
                    }).length === 0 && (
                        <div style={{ ...styles.medicineOption, color: "#9ca3af", cursor: "default" }}>
                          No tests found
                        </div>
                      )}
                  </div>

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

            {/* Test Table UI */}
            {selectedTests.length > 0 && (
              <div style={styles.tableCard}>
                <div style={styles.tableHeader}>
                  <span style={styles.tableTitle}>🧪 Selected Tests ({selectedTests.length})</span>
                  <span style={styles.tableSubTotal}>
                    Tests Total: ₹{testsTotal.toFixed(2)}
                  </span>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: 45 }}>#</th>
                      <th style={styles.th}>Test Name</th>
                      <th style={{ ...styles.th, textAlign: "right", width: 140 }}>Amount (₹)</th>
                      <th style={{ ...styles.th, textAlign: "center", width: 60 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTests.map((t, idx) => {
                      const tName = typeof t === "string" ? t : t.test_name;
                      const tAmt = typeof t === "string" ? "" : t.amount;
                      return (
                        <tr key={tName}>
                          <td style={styles.td}>{idx + 1}</td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{tName}</td>
                          <td style={{ ...styles.td, textAlign: "right" }}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tAmt}
                              onChange={(e) => handleTestAmountChange(idx, e.target.value)}
                              style={styles.tableInput}
                            />
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeTest(tName)}
                              style={styles.deleteBtn}
                              title="Remove test"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#f8fafc" }}>
                      <td colSpan={2} style={{ ...styles.td, fontWeight: 700, color: "#0f766e" }}>
                        Total Tests Amount:
                      </td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: "#0f766e", fontSize: 14 }}>
                        ₹{testsTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Medicine Delivery Details: Medicine Bill Number, Sample Collector, Medicine Name & Medicine Table */}
        {isMedicineDelivery && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...styles.grid2, marginBottom: 14 }}>
              <Field
                label="Medicine Bill Number"
                name="medicine_bill_number"
                value={form.medicine_bill_number || ""}
                onChange={handleChange}
                placeholder="e.g. MED-BILL-001"
              />

              {/* Sample Collector */}
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Sample Collector</label>
                <select
                  name="sample_collector"
                  value={form.sample_collector}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">-- Select Sample Collector --</option>
                  {sampleCollectorList.map((sc) => {
                    const scName = typeof sc === "string" ? sc : (sc.employeeName || "");
                    return (
                      <option key={scName} value={scName}>
                        {scName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Medicine Name — multi-select dropdown */}
            <div style={{ ...styles.fieldWrap, position: "relative", maxWidth: 360 }} ref={medicineDropdownRef}>
              <label style={styles.label}>
                Medicine Name
                {selectedMedicines.length > 0 && (
                  <span style={styles.medBadge}>{selectedMedicines.length} selected</span>
                )}
              </label>

              {/* Search input */}
              <input
                type="text"
                placeholder={showMedicineDropdown ? "Search medicine..." : (selectedMedicines.length > 0 ? `${selectedMedicines.length} medicine(s) selected — click to add more` : "Click to select medicines")}
                value={medicineSearch}
                onChange={(e) => {
                  setMedicineSearch(e.target.value);
                  setShowMedicineDropdown(true);
                }}
                onFocus={() => setShowMedicineDropdown(true)}
                style={styles.input}
                autoComplete="off"
              />

              {/* Dropdown */}
              {showMedicineDropdown && medicineList.length > 0 && (
                <div style={styles.medicineDropdown} onMouseDown={(e) => e.stopPropagation()}>
                  <div style={{ maxHeight: 170, overflowY: "auto" }}>
                    {medicineList
                      .filter((m) =>
                        (m.title || "").toLowerCase().includes(medicineSearch.toLowerCase())
                      )
                      .slice(0, 80)
                      .map((m) => {
                        const mTitle = m.title;
                        const mPrice = Number(m.product_price) || 0;
                        const isSelected = selectedMedicines.some((sm) => (typeof sm === "string" ? sm : sm.title) === mTitle);
                        return (
                          <div
                            key={mTitle}
                            style={{
                              ...styles.medicineOption,
                              background: isSelected ? "#ccfbf1" : "#fff",
                              fontWeight: isSelected ? 600 : 400,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "#f0fdf9";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isSelected ? "#ccfbf1" : "#fff";
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              toggleMedicine(m);
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center" }}>
                              <span style={styles.checkIcon}>
                                {isSelected ? "✓" : ""}
                              </span>
                              {mTitle}
                            </span>
                            {mPrice > 0 && (
                              <span style={{ fontSize: 12, color: "#0f766e", fontWeight: 600 }}>
                                ₹{mPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    {medicineList.filter((m) =>
                      (m.title || "").toLowerCase().includes(medicineSearch.toLowerCase())
                    ).length === 0 && (
                        <div style={{ ...styles.medicineOption, color: "#9ca3af", cursor: "default" }}>
                          No medicines found
                        </div>
                      )}
                  </div>

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

            {/* Medicine Table UI */}
            {selectedMedicines.length > 0 && (
              <div style={styles.tableCard}>
                <div style={styles.tableHeader}>
                  <span style={styles.tableTitle}>💊 Selected Medicines ({selectedMedicines.length})</span>
                  <span style={styles.tableSubTotal}>
                    Medicine Total: ₹{medicinesTotal.toFixed(2)}
                  </span>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: 45 }}>#</th>
                      <th style={styles.th}>Medicine Name</th>
                      <th style={{ ...styles.th, textAlign: "right", width: 140 }}>Amount (₹)</th>
                      <th style={{ ...styles.th, textAlign: "center", width: 60 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMedicines.map((m, idx) => {
                      const mTitle = typeof m === "string" ? m : m.title;
                      const mAmt = typeof m === "string" ? "" : m.amount;
                      return (
                        <tr key={mTitle}>
                          <td style={styles.td}>{idx + 1}</td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{mTitle}</td>
                          <td style={{ ...styles.td, textAlign: "right" }}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={mAmt}
                              onChange={(e) => handleMedicineAmountChange(idx, e.target.value)}
                              style={styles.tableInput}
                            />
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeMedicine(mTitle)}
                              style={styles.deleteBtn}
                              title="Remove medicine"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#f8fafc" }}>
                      <td colSpan={2} style={{ ...styles.td, fontWeight: 700, color: "#0f766e" }}>
                        Total Medicine Charge:
                      </td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: "#0f766e", fontSize: 14 }}>
                        ₹{medicinesTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Section: Financial */}
        <SectionTitle icon="💰" title="Financial Details" />
        <div style={styles.grid3}>
          {isHomeCare && form.home_care_type === "Dr + Staff Nurse Visit" && (
            <>
              <Field
                label="Cash Collected Amount (₹)"
                name="cash_collected_amount"
                type="number"
                value={form.cash_collected_amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <Field
                label="Doctor Fees (₹)"
                name="doctor_fees"
                type="number"
                value={form.doctor_fees}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <Field
                label="Staff Nurse (20%) (₹)"
                name="staff_nurse_fees"
                type="number"
                value={form.staff_nurse_fees}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <Field
                label="Remaining Amount (₹)"
                name="doctor_staff_fees_remaining"
                type="number"
                value={form.doctor_staff_fees_remaining}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </>
          )}
          {isHomeCare && form.home_care_type === "Nursing Care" && (
            <>
              <Field
                label="Cash Collected Amount (₹)"
                name="cash_collected_amount"
                type="number"
                value={form.cash_collected_amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <Field
                label="Staff Nurse (20%) (₹)"
                name="staff_nurse_fees"
                type="number"
                value={form.staff_nurse_fees}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <Field
                label="Remaining Amount (₹)"
                name="doctor_staff_fees_remaining"
                type="number"
                value={form.doctor_staff_fees_remaining}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </>
          )}
          {isHomeCare && !form.home_care_type && (
            <>
              <Field
                label="Doctor Fees (₹)"
                name="doctor_fees"
                type="number"
                value={form.doctor_fees}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <Field
                label="Nurse Fees (₹)"
                name="staff_nurse_fees"
                type="number"
                value={form.staff_nurse_fees}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <Field
                label="Remaining Amount (₹)"
                name="doctor_staff_fees_remaining"
                type="number"
                value={form.doctor_staff_fees_remaining}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </>
          )}
          {isMedicineDelivery && (
            <Field
              label="Medicine Charge (₹)"
              name="medicine_charge"
              type="number"
              value={form.medicine_charge}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          )}
          <Field
            label="Hospital Amount (₹)"
            name="hospital_amount"
            type="number"
            value={form.hospital_amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          <Field
            label="Total Amount (₹)"
            name="total_amount"
            type="number"
            value={form.total_amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        {/* Section: Payment Details */}
        <SectionTitle icon="💳" title="Payment Details" />
        <div style={styles.grid3}>
          <Field label="Reference ID" name="reference_id" value={form.reference_id} onChange={handleChange} placeholder="Reference ID" />
          <Field label="Order ID" name="order_id" value={form.order_id} onChange={handleChange} placeholder="Order ID" />
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
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    border: "1.5px solid #99f6e4",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(13,148,136,0.12)",
    zIndex: 999,
    marginTop: 4,
  },
  medicineOption: {
    padding: "7px 12px",
    fontSize: 13,
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
    padding: "6px 8px",
    borderTop: "1.5px solid #99f6e4",
    background: "#f0fdf9",
    borderRadius: "0 0 10px 10px",
  },
  doneBtn: {
    width: "100%",
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: "linear-gradient(135deg, #0d9488, #0f766e)",
    color: "#fff",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  tableCard: {
    marginTop: 12,
    background: "#ffffff",
    borderRadius: 10,
    border: "1.5px solid #ccfbf1",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(13,148,136,0.06)",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    background: "#f0fdf9",
    borderBottom: "1.5px solid #ccfbf1",
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f766e",
  },
  tableSubTotal: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0d9488",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    background: "#f8fafc",
    padding: "9px 12px",
    textAlign: "left",
    fontWeight: 600,
    color: "#475569",
    borderBottom: "1.5px solid #e2e8f0",
    fontSize: 12,
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
    fontSize: 13,
  },
  tableInput: {
    width: 100,
    padding: "5px 8px",
    borderRadius: 6,
    border: "1.5px solid #cbd5e1",
    fontSize: 13,
    textAlign: "right",
    fontWeight: 600,
    color: "#0f766e",
    background: "#f8fafc",
    outline: "none",
    boxSizing: "border-box",
  },
  deleteBtn: {
    background: "#fee2e2",
    border: "none",
    color: "#ef4444",
    borderRadius: 6,
    width: 26,
    height: 26,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
};

