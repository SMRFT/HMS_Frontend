import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Admission = () => {
  const [formData, setFormData] = useState({
    uhid: "",
    ipNumber: "",
    salutation: "",
    firstName: "",
    middleName: "",
    lastName: "",
    admissionDate: "",
    time: "",
    customerType: "General",
    admittingDoctor: "",
    consultingDoctor: "",
    roomNo: "",
    bedNo: "",
    extensionNumber: "",
    callRelease: "Local",
    nursingStation: "",
    presentComplaints: "",
    reasonForAdmission: "",
    admissionFee: "",
    creditLimit: "",
    mlcType: "",
    mlcRemarks: "",
    uploadMLCDoc: "",
    passAlertToAuthority: false,
    birthTime: "",
    weight: "",
    mothersUHIDNo: "",
    pediatricianResponsible: "",
  });

  const [mlcVisible, setMlcVisible] = useState(false);
  const [newBornVisible, setNewBornVisible] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const fetchPatientDetails = async () => {
    if (!formData.uhid) {
      alert("Please enter UHID");
      return;
    }

    const encodedUhid = encodeURIComponent(formData.uhid);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/op-patient/${encodedUhid}/`
      );
      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          salutation: data.salutation || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          age: data.age || "",
          gender: data.gender || "",
        });
      } else {
        alert("Patient not found");
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      alert("Error fetching patient details");
    }
  };

  const fetchNextIpNumber = async () => {
    console.log("fetchNextIpNumber function is called...");
    try {
      const response = await fetch("http://127.0.0.1:8000/autoipNumber/");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched IP Number:", data.next_ipNumber); // Debugging

        if (data.next_ipNumber) {
          setFormData((prevState) => ({
            ...prevState,
            ipNumber: data.next_ipNumber,
          }));
        }
      } else {
        console.error("Failed to fetch next IP number");
      }
    } catch (error) {
      console.error("Error fetching next IP number:", error);
    }
  };

  // useEffect calling fetchNextIpNumber on mount
  useEffect(() => {
    console.log("useEffect is running...");
    fetchNextIpNumber();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/doctor_list/");
        if (response.ok) {
          const data = await response.json();
          setDoctors(data); // Store the fetched doctor data
        } else {
          console.error("Failed to fetch doctors");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []); // Runs once when the component mounts

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        [name]: e.target.files[0], // Store file object
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleToggleSection = (section) => {
    if (section === "mlc") {
      setMlcVisible(!mlcVisible);
    } else if (section === "newBorn") {
      setNewBornVisible(!newBornVisible);
    }
  };

  const handleReset = () => {
    setFormData({
      uhid: "",
      ipNumber: "",
      salutation: "",
      firstName: "",
      middleName: "",
      lastName: "",
      age: "",
      gender: "",
      admissionDate: "",
      time: "",
      customerType: "General",
      admittingDoctor: "",
      consultingDoctor: "",
      roomNo: "",
      bedNo: "",
      extensionNumber: "",
      callRelease: "Local",
      nursingStation: "",
      presentComplaints: "",
      reasonForAdmission: "",
      admissionFee: "",
      creditLimit: "",
      mlcType: "",
      mlcRemarks: "",
      uploadMLCDoc: "",
      passAlertToAuthority: false,
      birthTime: "",
      weight: "",
      mothersUHIDNo: "",
      pediatricianResponsible: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      formPayload.append(key, formData[key]);
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/admission/", {
        method: "POST",
        body: formPayload,
      });

      if (response.ok) {
        alert("Form data saved successfully!");

        // Fetch new IP number first
        const response = await fetch("http://127.0.0.1:8000/autoipNumber/");
        if (response.ok) {
          const data = await response.json();
          const newIpNumber = data.next_ipNumber;

          // Reset form but keep new IP number
          setFormData({
            uhid: "",
            ipNumber: newIpNumber, // Keep new IP number
            salutation: "",
            firstName: "",
            middleName: "",
            lastName: "",
            age: "",
            gender: "",
            admissionDate: "",
            time: "",
            customerType: "General",
            admittingDoctor: "",
            consultingDoctor: "",
            roomNo: "",
            bedNo: "",
            extensionNumber: "",
            callRelease: "Local",
            nursingStation: "",
            presentComplaints: "",
            reasonForAdmission: "",
            admissionFee: "",
            creditLimit: "",
            mlcType: "",
            mlcRemarks: "",
            uploadMLCDoc: "",
            passAlertToAuthority: false,
            birthTime: "",
            weight: "",
            mothersUHIDNo: "",
            pediatricianResponsible: "",
          });
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to save form data: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving form data!");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "1600px" }}>
      <h2 className="text-center mb-4">Admission Form</h2>
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow">
        <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">UHID:</label>
            <input
              type="text"
              name="uhid"
              value={formData.uhid}
              onChange={handleInputChange}
              className="form-control"
            />
            <button
              type="button"
              onClick={fetchPatientDetails}
              className="btn btn-primary mt-2"
            >
              Search
            </button>
          </div>
          <div className="col-md-2">
            <label className="form-label">IP Number:</label>
            <input
              type="text"
              name="ipNumber"
              value={formData.ipNumber}
              className="form-control"
              readOnly
            />
          </div>

          <div className="col-md-1">
            <label className="form-label">Salutation:</label>
            <input
              type="text"
              name="salutation"
              value={formData.salutation}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="col-md-1">
            <label className="form-label">Age:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Gender:</label>
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">Admission Date:</label>
            <input
              type="date"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Time:</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Customer Type:</label>
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="General">General</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Admitting Doctor:</label>
            <select
              name="admittingDoctor"
              value={formData.admittingDoctor}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={`${doctor.first_name} ${doctor.middle_name || ""} ${
                    doctor.last_name
                  }`.trim()}
                >
                  {`${doctor.first_name} ${doctor.middle_name || ""} ${
                    doctor.last_name
                  }`.trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Consulting Doctor:</label>
            <select
              name="consultingDoctor"
              value={formData.consultingDoctor}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={`${doctor.first_name} ${doctor.middle_name || ""} ${
                    doctor.last_name
                  }`.trim()}
                >
                  {`${doctor.first_name} ${doctor.middle_name || ""} ${
                    doctor.last_name
                  }`.trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-1">
            <label className="form-label">Room No:</label>
            <input
              type="text"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-1">
            <label className="form-label">Bed No:</label>
            <input
              type="text"
              name="bedNo"
              value={formData.bedNo}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Extension Number:</label>
            <input
              type="text"
              name="extensionNumber"
              value={formData.extensionNumber}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Call Release:</label>
            <select
              name="callRelease"
              value={formData.callRelease}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Local">Local</option>
              <option value="STD">STD</option>
              <option value="ISD">ISD</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Nursing Station:</label>
            <input
              type="text"
              name="nursingStation"
              value={formData.nursingStation}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Present Complaints:</label>
            <textarea
              name="presentComplaints"
              value={formData.presentComplaints}
              onChange={handleInputChange}
              className="form-control"
            ></textarea>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Reason for Admission:</label>
            <textarea
              name="reasonForAdmission"
              value={formData.reasonForAdmission}
              onChange={handleInputChange}
              className="form-control"
            ></textarea>
          </div>
          <div className="col-md-2">
            <label className="form-label">Admission Fee:</label>
            <input
              type="number"
              name="admissionFee"
              value={formData.admissionFee}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Credit Limit:</label>
            <input
              type="number"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          {/* MLC Section Header */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center">
              <h5>MLC</h5>
              <button
                type="button"
                onClick={() => handleToggleSection("mlc")}
                className="btn btn-link p-0"
                aria-expanded={mlcVisible}
              >
                {mlcVisible ? "▲" : "▼"}
              </button>
            </div>
            {mlcVisible && (
              <div className="border p-3 rounded">
                <div className="mb-2">
                  <label className="form-label">MLC Type:</label>
                  <select
                    name="mlcType"
                    value={formData.mlcType}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select</option>
                    <option value="Accident">Accident</option>
                    <option value="Assault">Assault</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Upload MLC Doc:</label>
                  <input
                    type="file"
                    name="uploadMLCDoc"
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="passAlertToAuthority"
                      checked={formData.passAlertToAuthority}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">
                      Pass alert to authority
                    </label>
                  </div>
                </div>
                <div>
                  <label className="form-label">MLC Remarks:</label>
                  <textarea
                    name="mlcRemarks"
                    value={formData.mlcRemarks}
                    onChange={handleInputChange}
                    className="form-control"
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* New Born Section Header */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center">
              <h5>New Born</h5>
              <button
                type="button"
                onClick={() => handleToggleSection("newBorn")}
                className="btn btn-link p-0"
                aria-expanded={newBornVisible}
              >
                {newBornVisible ? "▲" : "▼"}
              </button>
            </div>
            {newBornVisible && (
              <div className="border p-3 rounded">
                <div className="mb-2">
                  <label className="form-label">Birth Time:</label>
                  <input
                    type="time"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Weight:</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Mother's UHID No:</label>
                  <input
                    type="text"
                    name="mothersUHIDNo"
                    value={formData.mothersUHIDNo}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Pediatrician Responsible:
                  </label>
                  <select
                    name="pediatricianResponsible"
                    value={formData.pediatricianResponsible}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select</option>
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. Johnson">Dr. Johnson</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary me-2"
          >
            Reset
          </button>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Admission;
