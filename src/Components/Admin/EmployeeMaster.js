import ReportConfigurationTab from "./ReportConfigurationTab";
import IntentDepartmentAssignmentTab from "./IntentDepartmentAssignmentTab";
import React, { useState, useEffect, useCallback, useRef } from "react";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Search,
  Edit2,
  Save,
  X,
  Upload,
  User,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  CreditCard,
  Building
} from "lucide-react";
import "./EmployeeMaster.css";

const EmployeeMaster = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [cashcounters, setCashcounters] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorFilter, setDoctorFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selection & Tabs
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [activeTab, setActiveTab] = useState("Mandatory");

  // Form State
  const initialFormState = {
    employeeId: "",
    employeeName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    guardian: "",
    fatherName: "",
    gender: "Male",
    maritalStatus: "Single",
    spouseName: "",
    dateOfBirth: "",
    age: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    area: "",
    mobileNumber: "",
    email: "",
    dateOfJoining: "",
    permanentDate: "",
    category: "General",
    department: "",
    designation: "",
    has_hms: false,
    cashcounter: "",
    doctorAssistant: false,
    consultant: false,
    doctors: [],
    qualification1: "",
    qualification2: "",
    profileImage: null,
    signatureFileId: null,
    kycDetails: {
      aadhaarNumber: "",
      panNumber: "",
      panType: ""
    },
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branch: "",
      paymentMode: "Bank Transfer"
    },
    familyDetails: {
      fatherAadhaar: "",
      motherAadhaar: "",
      spouseAadhaar: ""
    }
  };

  const [formData, setFormData] = useState(initialFormState);
  const photoInputRef = useRef(null);
  const signatureInputRef = useRef(null);

  // Fetch Employees List & Dropdowns
  const fetchEmployees = useCallback(
    async (targetPage = page, search = searchTerm, isDoc = doctorFilter) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: targetPage.toString(),
          limit: limit.toString(),
          search: search.trim()
        });
        if (isDoc) {
          queryParams.append("is_doctor", "true");
        }

        const url = `${process.env.REACT_APP_BACKEND_HMS_BASE_URL}employee-master/?${queryParams.toString()}`;
        const res = await apiRequest(url, "GET");

        if (res.success && res.data && res.data.data) {
          const payload = res.data.data;
          setEmployees(payload.employees || []);
          if (payload.pagination) {
            setTotalCount(payload.pagination.total || 0);
            setTotalPages(payload.pagination.total_pages || 1);
          }

          if (payload.departments && departments.length === 0) {
            setDepartments(payload.departments);
          }
          if (payload.designations && designations.length === 0) {
            setDesignations(payload.designations);
          }
          if (payload.cashcounters && cashcounters.length === 0) {
            setCashcounters(payload.cashcounters);
          }
          if (payload.doctors && doctorsList.length === 0) {
            setDoctorsList(payload.doctors);
          }

          // If no employee selected or previous selected is not in view, select the first
          if (!selectedEmpId && payload.employees && payload.employees.length > 0) {
            selectEmployee(payload.employees[0]);
          }
        } else {
          toast.error(res.data?.message || "Failed to load employee list");
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        toast.error("Error fetching employees");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, selectedEmpId]
  );

  useEffect(() => {
    fetchEmployees(page, searchTerm, doctorFilter);
  }, [fetchEmployees, page, doctorFilter]);

  // Handle Search Input with debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setPage(1);
    fetchEmployees(1, val, doctorFilter);
  };

  const toggleDoctorFilter = () => {
    const nextVal = !doctorFilter;
    setDoctorFilter(nextVal);
    setPage(1);
    fetchEmployees(1, searchTerm, nextVal);
  };

  // Select an employee into the right panel form
  const selectEmployee = (emp) => {
    if (!emp) return;
    setSelectedEmpId(emp.employeeId);

    // Compute age if DOB exists but age is blank
    let computedAge = emp.age;
    if (!computedAge && emp.dateOfBirth) {
      try {
        const birthDate = new Date(emp.dateOfBirth);
        const today = new Date();
        let calculated = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculated--;
        }
        if (calculated > 0) computedAge = calculated;
      } catch (e) {
        // ignore
      }
    }

    setFormData({
      employeeId: emp.employeeId || "",
      employeeName: emp.employeeName || "",
      firstName: emp.firstName || "",
      middleName: emp.middleName || "",
      lastName: emp.lastName || "",
      guardian: emp.guardian || emp.fatherName || "",
      fatherName: emp.fatherName || "",
      gender: emp.gender || "Male",
      maritalStatus: emp.maritalStatus || "Single",
      spouseName: emp.spouseName || "",
      dateOfBirth: emp.dateOfBirth || "",
      age: computedAge || "",
      addressLine1: emp.addressLine1 || "",
      addressLine2: emp.addressLine2 || "",
      addressLine3: emp.addressLine3 || "",
      area: emp.area || "",
      mobileNumber: emp.mobileNumber || "",
      email: emp.email || "",
      dateOfJoining: emp.dateOfJoining || "",
      permanentDate: emp.permanentDate || "",
      category: emp.category || "General",
      department: emp.department || "",
      designation: emp.designation || "",
      has_hms: !!emp.has_hms,
      cashcounter: emp.cashcounter || "",
      doctorAssistant: !!emp.doctorAssistant,
      consultant: !!emp.consultant,
      doctors: emp.doctors || [],
      qualification1: emp.qualification1 || "",
      qualification2: emp.qualification2 || "",
      profileImage: emp.profileImage || null,
      signatureFileId: emp.signatureFileId || null,
      kycDetails: {
        aadhaarNumber: emp.kycDetails?.aadhaarNumber || "",
        panNumber: emp.kycDetails?.panNumber || "",
        panType: emp.kycDetails?.panType || ""
      },
      bankDetails: {
        bankName: emp.bankDetails?.bankName || "",
        accountNumber: emp.bankDetails?.accountNumber || "",
        ifscCode: emp.bankDetails?.ifscCode || "",
        branch: emp.bankDetails?.branch || "",
        paymentMode: emp.bankDetails?.paymentMode || "Bank Transfer"
      },
      familyDetails: {
        fatherAadhaar: emp.familyDetails?.fatherAadhaar || "",
        motherAadhaar: emp.familyDetails?.motherAadhaar || "",
        spouseAadhaar: emp.familyDetails?.spouseAadhaar || ""
      }
    });
  };

  // Field change handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (name === "dateOfBirth" && val) {
      try {
        const birthDate = new Date(val);
        const today = new Date();
        let calculated = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculated--;
        }
        setFormData((prev) => ({
          ...prev,
          [name]: val,
          age: calculated > 0 ? calculated : prev.age
        }));
        return;
      } catch (err) {
        // fallback
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Image & Signature file upload to DataURL
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.warning("Photo size must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.warning("Signature size must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, signatureFileId: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.employeeId) {
      toast.warning("No employee selected");
      return;
    }

    setSaving(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_HMS_BASE_URL}employee-master/${formData.employeeId}/`;
      const res = await apiRequest(url, "PATCH", formData);

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: `Employee ${formData.employeeName || formData.employeeId} updated successfully.`,
          timer: 2000,
          showConfirmButton: false
        });

        // Update the employee in local list immediately
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.employeeId === formData.employeeId
              ? {
                  ...emp,
                  ...res.data?.data,
                  has_hms: formData.has_hms,
                  cashcounter: formData.cashcounter,
                  department: formData.department,
                  designation: formData.designation
                }
              : emp
          )
        );

        if (res.data?.data) {
          selectEmployee(res.data.data);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: res.data?.message || res.error || "Failed to update employee"
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Cancel / Reset
  const handleCancel = () => {
    const original = employees.find((e) => e.employeeId === selectedEmpId);
    if (original) {
      selectEmployee(original);
      toast.info("Changes reverted");
    }
  };

  return (
    <div className="employee-master-container">
      {/* LEFT PANEL: Employee Table & Search */}
      <div className="em-left-panel">
        <div className="em-search-row">
          <div className="em-search-box">
            <label>Search:</label>
            <div className="em-search-input-wrap">
              <Search size={14} className="em-search-icon" />
              <input
                type="text"
                className="em-search-input"
                placeholder="Employee..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="em-filter-badges">
            <span
              className={`em-badge-doctor ${doctorFilter ? "active" : ""}`}
              onClick={toggleDoctorFilter}
              title="Filter Doctors"
            >
              <span className="em-dot" />
              Doctor
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="em-table-container">
          <table className="em-table">
            <thead>
              <tr>
                <th style={{ width: "32%" }}>Employee code</th>
                <th style={{ width: "36%" }}>Name</th>
                <th style={{ width: "22%" }}>Designation</th>
                <th style={{ width: "10%", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isSelected = emp.employeeId === selectedEmpId;
                  return (
                    <tr
                      key={emp.employeeId}
                      className={isSelected ? "selected" : ""}
                      onClick={() => selectEmployee(emp)}
                    >
                      <td>
                        <div className="em-code-cell">
                          {emp.isDoctor ? (
                            <span className="em-doc-dot" title="Doctor" />
                          ) : (
                            <span className="em-doc-dot-placeholder" />
                          )}
                          <span>{emp.employeeId}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: isSelected ? 600 : 400 }}>
                        {emp.employeeName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "-"}
                      </td>
                      <td style={{ color: "#64748b" }}>{emp.designation_name || emp.designation || "-"}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="em-action-btn"
                          title="Edit Employee Demographics"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectEmployee(emp);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="em-pagination">
          <span>
            Showing {employees.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, totalCount)} of {totalCount} entries
          </span>
          <div className="em-page-controls">
            <button
              type="button"
              className="em-page-btn"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              <ChevronLeft size={13} />
            </button>
            <span style={{ padding: "3px 8px", fontSize: "11px", fontWeight: 600, color: "#0891b2" }}>
              {page} / {totalPages || 1}
            </span>
            <button
              type="button"
              className="em-page-btn"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Employee Demographics Form */}
      <div className="em-right-panel">
        {/* Top Header with Avatar & Name */}
        <div className="em-top-header">
          <div className="em-photo-section">
            <div className="em-avatar-box">
              {formData.profileImage ? (
                <img src={formData.profileImage} alt="Profile" />
              ) : (
                <User size={36} />
              )}
            </div>
            <button
              type="button"
              className="em-upload-photo-btn"
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload size={11} /> Upload Photo
            </button>
            <input
              type="file"
              ref={photoInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="em-name-inputs">
            <div className="em-name-group">
              <label>
                First Name <span className="em-req">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                className="em-name-input"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="em-name-group">
              <label>Middle Name</label>
              <input
                type="text"
                name="middleName"
                className="em-name-input"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>
            <div className="em-name-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                className="em-name-input"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Demographics Card */}
        <div className="em-card">
          <div className="em-card-header">
            <div className="em-card-title">
              <FileText size={16} /> Employee Demographics
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="em-tabs">
            <button
              type="button"
              className={`em-tab-btn ${activeTab === "Mandatory" ? "active" : ""}`}
              onClick={() => setActiveTab("Mandatory")}
            >
              Mandatory
            </button>
            <button
              type="button"
              className={`em-tab-btn ${activeTab === "Optional" ? "active" : ""}`}
              onClick={() => setActiveTab("Optional")}
            >
              Optional
            </button>
            <button
              type="button"
              className={`em-tab-btn ${activeTab === "ReportConfig" ? "active" : ""}`}
              onClick={() => setActiveTab("ReportConfig")}
            >
              Report Configuration
            </button>
            <button
              type="button"
              className={`em-tab-btn ${activeTab === "IntentDeptApproval" ? "active" : ""}`}
              onClick={() => setActiveTab("IntentDeptApproval")}
            >
              Intent Dept Approval
            </button>
          </div>

          {/* Form Content */}
          {activeTab === "ReportConfig" ? (
            <div className="em-card-body" style={{ padding: "16px 20px" }}>
              <ReportConfigurationTab selectedEmployee={formData} employees={employees} />
            </div>
          ) : activeTab === "IntentDeptApproval" ? (
            <div className="em-card-body" style={{ padding: "16px 20px" }}>
              <IntentDepartmentAssignmentTab
                selectedEmployee={formData}
                departments={departments}
                employees={employees}
              />
            </div>
          ) : (
          <form onSubmit={handleSave} className="em-card-body">
            {activeTab === "Mandatory" ? (
              <>
                {/* Row 1 */}
                <div className="em-form-row">
                  <div className="em-form-group">
                    <label>
                      Login Name <span className="em-req">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      className="em-input"
                      value={formData.employeeId}
                      disabled
                      title="Employee ID / Login Name"
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Guardian</label>
                    <input
                      type="text"
                      name="guardian"
                      className="em-input"
                      placeholder="Father / Guardian Name"
                      value={formData.guardian}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>
                      Gender <span className="em-req">*</span>
                    </label>
                    <select
                      name="gender"
                      className="em-select"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="em-form-group">
                    <label>Marital Status</label>
                    <select
                      name="maritalStatus"
                      className="em-select"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                    >
                      <option value="">Please Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="em-form-row">
                  <div className="em-form-group">
                    <label>Spouse Name</label>
                    <input
                      type="text"
                      name="spouseName"
                      className="em-input"
                      placeholder="Spouse Name"
                      value={formData.spouseName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>
                      DOB <span className="em-req">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="em-input"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      className="em-input"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>
                      Address Line 1 <span className="em-req">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      className="em-input"
                      placeholder="House / Street / Flat"
                      value={formData.addressLine1}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="em-form-row">
                  <div className="em-form-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      className="em-input"
                      placeholder="Locality / Landmark"
                      value={formData.addressLine2}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Address Line 3</label>
                    <input
                      type="text"
                      name="addressLine3"
                      className="em-input"
                      placeholder="City / District"
                      value={formData.addressLine3}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>
                      Area <span className="em-req">*</span>
                    </label>
                    <input
                      type="text"
                      name="area"
                      className="em-input"
                      placeholder="Area / PIN code"
                      value={formData.area}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="mobileNumber"
                      className="em-input"
                      placeholder="Mobile Phone"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="em-form-row">
                  <div className="em-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="em-input"
                      placeholder="user@hospital.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>
                      Date of Joining <span className="em-req">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfJoining"
                      className="em-input"
                      value={formData.dateOfJoining}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Permanent Date</label>
                    <input
                      type="date"
                      name="permanentDate"
                      className="em-input"
                      value={formData.permanentDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>
                      Category <span className="em-req">*</span>
                    </label>
                    <select
                      name="category"
                      className="em-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="General">General</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Non-Clinical">Non-Clinical</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Technical">Technical</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Department & Designation */}
                <div className="em-form-row">
                  <div className="em-form-group col-span-2">
                    <label>
                      Department <span className="em-req">*</span>
                    </label>
                    <select
                      name="department"
                      className="em-select"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="em-form-group col-span-2">
                    <label>
                      Designation <span className="em-req">*</span>
                    </label>
                    <select
                      name="designation"
                      className="em-select"
                      value={formData.designation}
                      onChange={handleChange}
                    >
                      <option value="">Select Designation</option>
                      {designations.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 6: HMS Toggle, Cash Counter, Consultant */}
                <div className="em-form-row">
                  {/* HMS Toggle */}
                  <div className="em-toggle-group">
                    <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Shield size={13} color="#0891b2" /> HMS Access (HMS-R-V)
                    </label>
                    <div className="em-switch-container">
                      <label className="em-switch">
                        <input
                          type="checkbox"
                          name="has_hms"
                          checked={formData.has_hms}
                          onChange={handleChange}
                        />
                        <span className="em-slider">
                          {formData.has_hms ? "YES" : "NO"}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Cash Counter Select Dropdown */}
                  <div className="em-form-group col-span-2">
                    <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <CreditCard size={13} color="#0891b2" /> Cash Counter
                    </label>
                    <select
                      name="cashcounter"
                      className="em-select"
                      value={formData.cashcounter}
                      onChange={handleChange}
                    >
                      <option value="">Select Cash Counter</option>
                      {cashcounters.map((c) => (
                        <option key={c.counter_id} value={c.counter_id}>
                          {c.counter_name} ({c.counter_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Consultant Toggle */}
                  <div className="em-toggle-group">
                    <label>Consultant</label>
                    <div className="em-switch-container">
                      <label className="em-switch">
                        <input
                          type="checkbox"
                          name="consultant"
                          checked={formData.consultant}
                          onChange={handleChange}
                        />
                        <span className="em-slider">
                          {formData.consultant ? "YES" : "NO"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Row 7: Qualifications */}
                <div className="em-form-row">
                  <div className="em-form-group col-span-2">
                    <label>Qualification 1</label>
                    <input
                      type="text"
                      name="qualification1"
                      className="em-input"
                      placeholder="e.g. MBBS, B.Sc"
                      value={formData.qualification1}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="em-form-group col-span-2">
                    <label>Qualification 2</label>
                    <input
                      type="text"
                      name="qualification2"
                      className="em-input"
                      placeholder="e.g. MD, MS"
                      value={formData.qualification2}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* OPTIONAL TAB: KYC, Bank Details, Family */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0e7490", margin: "4px 0 0 0" }}>
                  KYC & Identification Details
                </h4>
                <div className="em-form-row">
                  <div className="em-form-group">
                    <label>Aadhaar Number</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="12 Digit Aadhaar"
                      value={formData.kycDetails?.aadhaarNumber || ""}
                      onChange={(e) => handleNestedChange("kycDetails", "aadhaarNumber", e.target.value)}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>PAN Number</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="PAN Number"
                      value={formData.kycDetails?.panNumber || ""}
                      onChange={(e) => handleNestedChange("kycDetails", "panNumber", e.target.value)}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>PAN Type</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="Individual / Business"
                      value={formData.kycDetails?.panType || ""}
                      onChange={(e) => handleNestedChange("kycDetails", "panType", e.target.value)}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0e7490", margin: "10px 0 0 0" }}>
                  Bank & Payroll Account
                </h4>
                <div className="em-form-row">
                  <div className="em-form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="Bank Name"
                      value={formData.bankDetails?.bankName || ""}
                      onChange={(e) => handleNestedChange("bankDetails", "bankName", e.target.value)}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="Account Number"
                      value={formData.bankDetails?.accountNumber || ""}
                      onChange={(e) => handleNestedChange("bankDetails", "accountNumber", e.target.value)}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>IFSC Code</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="IFSC Code"
                      value={formData.bankDetails?.ifscCode || ""}
                      onChange={(e) => handleNestedChange("bankDetails", "ifscCode", e.target.value)}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Branch</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="Branch"
                      value={formData.bankDetails?.branch || ""}
                      onChange={(e) => handleNestedChange("bankDetails", "branch", e.target.value)}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0e7490", margin: "10px 0 0 0" }}>
                  Family Details
                </h4>
                <div className="em-form-row">
                  <div className="em-form-group">
                    <label>Father Aadhaar</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="Father Aadhaar"
                      value={formData.familyDetails?.fatherAadhaar || ""}
                      onChange={(e) => handleNestedChange("familyDetails", "fatherAadhaar", e.target.value)}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Mother Aadhaar</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="Mother Aadhaar"
                      value={formData.familyDetails?.motherAadhaar || ""}
                      onChange={(e) => handleNestedChange("familyDetails", "motherAadhaar", e.target.value)}
                    />
                  </div>
                  <div className="em-form-group">
                    <label>Spouse Aadhaar</label>
                    <input
                      type="text"
                      className="em-input"
                      placeholder="Spouse Aadhaar"
                      value={formData.familyDetails?.spouseAadhaar || ""}
                      onChange={(e) => handleNestedChange("familyDetails", "spouseAadhaar", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Row: Signature & Save / Cancel */}
            <div className="em-footer-row">
              <div className="em-signature-box">
                <button
                  type="button"
                  className="em-signature-upload-btn"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  <Upload size={13} />
                  {formData.signatureFileId ? "Signature Uploaded (Change)" : "Upload Signature"}
                </button>
                <input
                  type="file"
                  ref={signatureInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleSignatureUpload}
                />
              </div>

              <div className="em-btn-group">
                <button
                  type="button"
                  className="em-btn-cancel"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  type="submit"
                  className="em-btn-save"
                  disabled={saving}
                >
                  <Save size={14} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeMaster;

