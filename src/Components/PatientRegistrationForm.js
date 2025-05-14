"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Search, Plus, ChevronDown, ChevronUp, Info } from "lucide-react"

// Modal component for search results
const Modal = ({ show, onClose, title, children, footer }) => {
  if (!show) return null

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  )
}

// Reference Doctor Form Component
const ReferenceDoctorForm = ({ closeModal }) => {
  const [doctor, setDoctor] = useState({
    name: "",
    qualification: "",
    area: "",
    mobile: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setDoctor({ ...doctor, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Submit logic here
    axios
      .post("http://127.0.0.1:8000/add-reference-doctor/", doctor)
      .then((response) => {
        console.log("Doctor added:", response.data)
        closeModal()
      })
      .catch((error) => {
        console.error("Error adding doctor:", error)
      })
  }

  return (
    <Modal
      show={true}
      onClose={closeModal}
      title="Add Reference Doctor"
      footer={
        <ButtonGroup>
          <Button type="button" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} primary>
            Save
          </Button>
        </ButtonGroup>
      }
    >
      <FormGrid columns={1}>
        <InputWrapper>
          <Label htmlFor="name">Doctor Name</Label>
          <Input type="text" id="name" name="name" value={doctor.name} onChange={handleChange} required />
        </InputWrapper>
        <InputWrapper>
          <Label htmlFor="qualification">Qualification</Label>
          <Input
            type="text"
            id="qualification"
            name="qualification"
            value={doctor.qualification}
            onChange={handleChange}
            required
          />
        </InputWrapper>
        <InputWrapper>
          <Label htmlFor="area">Area</Label>
          <Input type="text" id="area" name="area" value={doctor.area} onChange={handleChange} />
        </InputWrapper>
        <InputWrapper>
          <Label htmlFor="mobile">Mobile</Label>
          <Input type="text" id="mobile" name="mobile" value={doctor.mobile} onChange={handleChange} />
        </InputWrapper>
      </FormGrid>
    </Modal>
  )
}

// Collapsible Section Component
const CollapsibleSection = ({ title, children, defaultOpen = true, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <SectionWrapper>
      <SectionHeader onClick={() => setIsOpen(!isOpen)}>
        {icon && <SectionIcon>{icon}</SectionIcon>}
        <SectionTitle>{title}</SectionTitle>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </SectionHeader>
      {isOpen && <SectionContent>{children}</SectionContent>}
    </SectionWrapper>
  )
}

const PatientRegistrationForm = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)

  // Patient state
  const [patient, setPatient] = useState({
    regDate: "",
    citizenIdType: "",
    citizenIdNo: "",
    customerType: "",
    name: "",
    dob: "",
    age: "",
    gender: "",
    permanentAddress: "",
    area: "",
    zipcode: "",
    city: "",
    state: "",
    email: "",
    mobilePhone: "",
    homePhone: "",
    bloodGroup: "",
    spouseName: "",
    referredBy: "",
    doctorName: "",
    registrationFee: 0,
    consultingFee: 0,
    totalFees: 0,
    insuranceCompany: "",
    // MLC fields
    mlcType: "",
    mlcDoc: null,
    mlcRemarks: "",
    passAlertToAuthority: false,
    // Next of Kin fields
    nextOfKin: "",
    relation: "",
    kinAddress: "",
    kinMobile: "",
    kinAge: "",
    kinAgeUnit: "Years",
    kinOccupation: "",
    memberNumber: "",
    suffixNumber: "",
    approvedAmount: "",
    // Referred fields
    referredDrMobile: "",
    referredDrRemarks: "",
    // New Born fields
    birthTime: "",
    birthTimeAmPm: "AM",
    weight: "",
    mothersUhidNo: "",
    pediatricianResponsible: "",
  })

  // Search states
  const [uhid, setUhid] = useState("")
  const [ipNumber, setIpNumber] = useState("")
  const [mobile, setMobile] = useState("")
  const [patients, setPatients] = useState([])

  // Doctor and fee states
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState({})
  const [registrationFee, setRegistrationFee] = useState(0)
  const [consultingFee, setConsultingFee] = useState(0)
  const [hospitalFee, setHospitalFee] = useState(0)
  const [bookingFee, setBookingFee] = useState(0)
  const [totalFees, setTotalFees] = useState(0)

  // Age calculation functions
  const calculateAgeFromDOB = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : ""
  }

  const calculateDOBFromAge = (age) => {
    const today = new Date()
    const birthYear = today.getFullYear() - age
    return new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split("T")[0]
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "dob") {
      const calculatedAge = calculateAgeFromDOB(value)
      setPatient({ ...patient, dob: value, age: calculatedAge })
    } else if (name === "age") {
      const calculatedDOB = calculateDOBFromAge(value)
      setPatient({ ...patient, age: value, dob: calculatedDOB })
    } else if (type === "checkbox") {
      setPatient({ ...patient, [name]: checked })
    } else {
      setPatient({ ...patient, [name]: value })
    }
  }

  // Handle file upload
  const handleFileChange = (e) => {
    setPatient({ ...patient, mlcDoc: e.target.files[0] })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()

      // Append all patient data to formData
      Object.keys(patient).forEach((key) => {
        if (key === "mlcDoc" && patient[key]) {
          formData.append(key, patient[key])
        } else {
          formData.append(key, patient[key])
        }
      })

      const response = await fetch("http://127.0.0.1:8000/patients/register/", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Patient Registered:", data)
        alert("Patient Registered Successfully! UHID: " + data.uhid)
        // Reset form
        setPatient({
          regDate: "",
          citizenIdType: "",
          citizenIdNo: "",
          customerType: "",
          name: "",
          dob: "",
          age: "",
          gender: "",
          permanentAddress: "",
          area: "",
          zipcode: "",
          city: "",
          state: "",
          email: "",
          mobilePhone: "",
          homePhone: "",
          bloodGroup: "",
          spouseName: "",
          referredBy: "",
          doctorName: "",
          registrationFee: 0,
          consultingFee: 0,
          totalFees: 0,
          insuranceCompany: "",
          mlcType: "",
          mlcDoc: null,
          mlcRemarks: "",
          passAlertToAuthority: false,
          nextOfKin: "",
          relation: "",
          kinAddress: "",
          kinMobile: "",
          kinAge: "",
          kinAgeUnit: "Years",
          kinOccupation: "",
          memberNumber: "",
          suffixNumber: "",
          approvedAmount: "",
          referredDrMobile: "",
          referredDrRemarks: "",
          birthTime: "",
          birthTimeAmPm: "AM",
          weight: "",
          mothersUhidNo: "",
          pediatricianResponsible: "",
        })

        // Reset fee calculator
        setSelectedDoctor({})
        setRegistrationFee(0)
        setConsultingFee(0)
        setHospitalFee(0)
        setBookingFee(0)
        setTotalFees(0)
      } else {
        const errorData = await response.json()
        console.error("Error:", errorData)
        alert("Error registering patient. Check console for details.")
      }
    } catch (error) {
      console.error("Network Error:", error)
      alert("Failed to connect to the server.")
    }
  }

  // Fetch patients based on search criteria
  const fetchPatients = async () => {
    try {
      let query = ""
      if (uhid) {
        query = `uhid=${uhid}`
      } else if (ipNumber) {
        query = `ip_number=${ipNumber}`
      } else if (mobile) {
        query = `mobile=${mobile}`
      }

      const response = await axios.get(`http://127.0.0.1:8000/create/?${query}`)
      setPatients(response.data)
      setShowSearchModal(true)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  // Select patient from search results
  const handleSelectPatient = (selectedPatient) => {
    setPatient({ ...selectedPatient })
    setShowSearchModal(false)
  }

  // Fetch doctors on component mount
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/doctor_list/")
      .then((response) => {
        const doctorsData = response.data.map((doctor) => ({
          name: `${doctor.first_name} ${doctor.middle_name || ""} ${doctor.last_name}`.trim(),
          registrationFee: Number.parseFloat(doctor.registration_fee),
          consultingFee: Number.parseFloat(doctor.consulting_fee),
          specialty: doctor.specialty,
        }))
        setDoctors(doctorsData)
      })
      .catch((error) => console.error("Error fetching doctors:", error))

    // Fetch reference doctors
    axios
      .get("http://127.0.0.1:8000/get-reference-doctors/")
      .then((response) => {
        const doctorOptions = response.data.map((doc) => ({
          value: doc.doctor,
          label: `${doc.doctor} (${doc.qualification}) - ${doc.area}`,
        }))
        // Update doctors state if needed
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error)
      })
  }, [])

  // Handle doctor selection for fee calculation
  const handleDoctorChange = (event) => {
    const doctorName = event.target.value
    const selected = doctors.find((doctor) => doctor.name === doctorName)

    if (selected) {
      const regFee = selected.registrationFee || 0
      const consFee = selected.consultingFee || 0
      const hospFee = 0 // Default value
      const bookFee = 0 // Default value
      const total = regFee + consFee + hospFee + bookFee

      setSelectedDoctor(selected)
      setRegistrationFee(regFee)
      setConsultingFee(consFee)
      setHospitalFee(hospFee)
      setBookingFee(bookFee)
      setTotalFees(total)

      // Update the patient state with doctor details
      setPatient({
        ...patient,
        doctorName: selected.name,
        registrationFee: regFee,
        consultingFee: consFee,
        totalFees: total,
      })
    } else {
      resetFeeCalculator()
    }
  }

  // Handle fee changes
  const handleFeeChange = (feeType, value) => {
    const newFee = Number.parseFloat(value) || 0

    if (feeType === "registration") {
      setRegistrationFee(newFee)
      setTotalFees(newFee + consultingFee + hospitalFee + bookingFee)
      setPatient({
        ...patient,
        registrationFee: newFee,
        totalFees: newFee + consultingFee + hospitalFee + bookingFee,
      })
    } else if (feeType === "consulting") {
      setConsultingFee(newFee)
      setTotalFees(registrationFee + newFee + hospitalFee + bookingFee)
      setPatient({
        ...patient,
        consultingFee: newFee,
        totalFees: registrationFee + newFee + hospitalFee + bookingFee,
      })
    } else if (feeType === "hospital") {
      setHospitalFee(newFee)
      setTotalFees(registrationFee + consultingFee + newFee + bookingFee)
    } else if (feeType === "booking") {
      setBookingFee(newFee)
      setTotalFees(registrationFee + consultingFee + hospitalFee + newFee)
    }
  }

  // Reset fee calculator
  const resetFeeCalculator = () => {
    setSelectedDoctor({})
    setRegistrationFee(0)
    setConsultingFee(0)
    setHospitalFee(0)
    setBookingFee(0)
    setTotalFees(0)

    setPatient({
      ...patient,
      doctorName: "",
      registrationFee: 0,
      consultingFee: 0,
      totalFees: 0,
    })
  }

  const searchMotherUhid = () => {
    // Implement logic to search for mother's UHID
    console.log("Searching for mother's UHID:", patient.mothersUhidNo)
  }

  const handleNewBornRegistration = () => {
    // Implement logic to register the newborn
    console.log("Registering newborn with details:", {
      birthTime: patient.birthTime,
      birthTimeAmPm: patient.birthTimeAmPm,
      weight: patient.weight,
      mothersUhidNo: patient.mothersUhidNo,
      pediatricianResponsible: patient.pediatricianResponsible,
    })
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Patient Registration System</PageTitle>
      </PageHeader>

      {/* Search Container */}
      <SearchContainer>
  <SectionTitle>Patient Search</SectionTitle>
  <SearchRow>
    <InputWrapper>
      <Label htmlFor="uhid">UHID No</Label>
      <InputGroup>
        <Input
          type="text"
          id="uhid"
          placeholder="Enter UHID No"
          value={uhid}
          onChange={(e) => setUhid(e.target.value)}
        />
        <InputAddon onClick={fetchPatients}>
          <Search size={16} />
        </InputAddon>
      </InputGroup>
    </InputWrapper>

    <InputWrapper>
      <Label htmlFor="ipNumber">IP Number</Label>
      <InputGroup>
        <Input
          type="text"
          id="ipNumber"
          placeholder="Enter IP Number"
          value={ipNumber}
          onChange={(e) => setIpNumber(e.target.value)}
        />
        <InputAddon onClick={fetchPatients}>
          <Search size={16} />
        </InputAddon>
      </InputGroup>
    </InputWrapper>

    <InputWrapper>
      <Label htmlFor="mobile">Mobile</Label>
      <InputGroup>
        <Input
          type="text"
          id="mobile"
          placeholder="Enter Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <InputAddon onClick={fetchPatients}>
          <Search size={16} />
        </InputAddon>
      </InputGroup>
    </InputWrapper>
  </SearchRow>
</SearchContainer>

      {/* Main Content Container */}
      <MainContentWrapper>
        {/* Patient Registration Form */}
        <FormContainer>
          <ContainerTitle>Patient Registration</ContainerTitle>
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <CollapsibleSection title="Basic Information">
              <FormGrid>
                <InputWrapper>
                  <Label htmlFor="citizenIdType">Citizen ID Type</Label>
                  <Select id="citizenIdType" name="citizenIdType" value={patient.citizenIdType} onChange={handleChange}>
                    <option value="">Select ID Type</option>
                    <option value="Aadhar">Aadhar</option>
                    <option value="PAN">PAN</option>
                    <option value="Passport">Passport</option>
                  </Select>
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="citizenIdNo">Citizen ID Number</Label>
                  <Input
                    type="text"
                    id="citizenIdNo"
                    name="citizenIdNo"
                    value={patient.citizenIdNo}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="customerType">Customer Type</Label>
                  <Select id="customerType" name="customerType" value={patient.customerType} onChange={handleChange}>
                    <option value="">Select Customer Type</option>
                    <option value="General">General</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Employee">Employee</option>
                  </Select>
                </InputWrapper>

                {patient.customerType === "Insurance" && (
                  <InputWrapper>
                    <Label htmlFor="insuranceCompany">Insurance Company</Label>
                    <Select
                      id="insuranceCompany"
                      name="insuranceCompany"
                      value={patient.insuranceCompany}
                      onChange={handleChange}
                    >
                      <option value="">Select Insurance Company</option>
                      <option value="CompanyA">Company A</option>
                      <option value="CompanyB">Company B</option>
                      <option value="CompanyC">Company C</option>
                    </Select>
                  </InputWrapper>
                )}
              </FormGrid>
            </CollapsibleSection>

            {/* Personal Information Section */}
            <CollapsibleSection title="Personal Information">
              <FormGrid>
                <InputWrapper>
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" name="name" value={patient.name} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input type="date" id="dob" name="dob" value={patient.dob} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="age">Age</Label>
                  <Input type="number" id="age" name="age" value={patient.age} onChange={handleChange} required />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="gender">Gender</Label>
                  <Select id="gender" name="gender" value={patient.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select id="bloodGroup" name="bloodGroup" value={patient.bloodGroup} onChange={handleChange}>
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Select>
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="spouseName">Spouse Name</Label>
                  <Input
                    type="text"
                    id="spouseName"
                    name="spouseName"
                    value={patient.spouseName}
                    onChange={handleChange}
                  />
                </InputWrapper>
              </FormGrid>
            </CollapsibleSection>

            {/* Address & Contact Information */}
            <CollapsibleSection title="Address & Contact Information">
              <FormGrid>
                <InputWrapper className="span-full">
                  <Label htmlFor="permanentAddress">Permanent Address</Label>
                  <Input
                    type="text"
                    id="permanentAddress"
                    name="permanentAddress"
                    value={patient.permanentAddress}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="area">Area</Label>
                  <Input type="text" id="area" name="area" value={patient.area} onChange={handleChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="zipcode">Zipcode</Label>
                  <Input type="text" id="zipcode" name="zipcode" value={patient.zipcode} onChange={handleChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="city">City</Label>
                  <Input type="text" id="city" name="city" value={patient.city} onChange={handleChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="state">State</Label>
                  <Input type="text" id="state" name="state" value={patient.state} onChange={handleChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" name="email" value={patient.email} onChange={handleChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="mobilePhone">Mobile Phone</Label>
                  <Input
                    type="text"
                    id="mobilePhone"
                    name="mobilePhone"
                    value={patient.mobilePhone}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="homePhone">Home Phone</Label>
                  <Input
                    type="text"
                    id="homePhone"
                    name="homePhone"
                    value={patient.homePhone}
                    onChange={handleChange}
                  />
                </InputWrapper>
              </FormGrid>
            </CollapsibleSection>

            {/* Referred Section */}
            <CollapsibleSection title="Referred Information">
              <FormGrid>
                <InputWrapper>
                  <Label htmlFor="referredBy">Referred By</Label>
                  <InputGroup>
                    <Select id="referredBy" name="referredBy" value={patient.referredBy} onChange={handleChange}>
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor, index) => (
                        <option key={index} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </Select>
                    <InputAddon onClick={() => setIsModalOpen(true)}>
                      <Plus size={16} />
                    </InputAddon>
                  </InputGroup>
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="referredDrMobile">Referred Dr Mobile</Label>
                  <Input
                    type="text"
                    id="referredDrMobile"
                    name="referredDrMobile"
                    value={patient.referredDrMobile}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper className="span-full">
                  <Label htmlFor="referredDrRemarks">Referred Dr Remarks</Label>
                  <Textarea
                    id="referredDrRemarks"
                    name="referredDrRemarks"
                    value={patient.referredDrRemarks}
                    onChange={handleChange}
                    rows={3}
                  />
                </InputWrapper>
              </FormGrid>
            </CollapsibleSection>

            {/* MLC Section */}
            <CollapsibleSection title="MLC Information" defaultOpen={false}>
              <FormGrid>
                <InputWrapper>
                  <Label htmlFor="mlcType">MLC Type</Label>
                  <Select id="mlcType" name="mlcType" value={patient.mlcType} onChange={handleChange}>
                    <option value="">Select MLC Type</option>
                    <option value="Type1">Type 1</option>
                    <option value="Type2">Type 2</option>
                    <option value="Type3">Type 3</option>
                  </Select>
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="mlcDoc">Upload MLC Doc</Label>
                  <FileInput type="file" id="mlcDoc" name="mlcDoc" onChange={handleFileChange} />
                </InputWrapper>
                <InputWrapper className="span-full">
                  <CheckboxWrapper>
                    <Checkbox
                      type="checkbox"
                      id="passAlertToAuthority"
                      name="passAlertToAuthority"
                      checked={patient.passAlertToAuthority}
                      onChange={handleChange}
                    />
                    <CheckboxLabel htmlFor="passAlertToAuthority">Pass alert to authority</CheckboxLabel>
                  </CheckboxWrapper>
                </InputWrapper>
                <InputWrapper className="span-full">
                  <Label htmlFor="mlcRemarks">MLC Remarks</Label>
                  <Textarea
                    id="mlcRemarks"
                    name="mlcRemarks"
                    value={patient.mlcRemarks}
                    onChange={handleChange}
                    rows={3}
                  />
                </InputWrapper>
              </FormGrid>
            </CollapsibleSection>

            {/* Next of Kin Section */}
            <CollapsibleSection title="Next of Kin" defaultOpen={false}>
              <FormGrid>
                <InputWrapper>
                  <Label htmlFor="nextOfKin">Next of Kin</Label>
                  <Input
                    type="text"
                    id="nextOfKin"
                    name="nextOfKin"
                    value={patient.nextOfKin}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="relation">Relation</Label>
                  <Input type="text" id="relation" name="relation" value={patient.relation} onChange={handleChange} />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="kinAddress">Address</Label>
                  <Input
                    type="text"
                    id="kinAddress"
                    name="kinAddress"
                    value={patient.kinAddress}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="kinMobile">Mobile</Label>
                  <Input
                    type="text"
                    id="kinMobile"
                    name="kinMobile"
                    value={patient.kinMobile}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="kinAge">Age</Label>
                  <InputGroup>
                    <Input type="text" id="kinAge" name="kinAge" value={patient.kinAge} onChange={handleChange} />
                    <Select
                      id="kinAgeUnit"
                      name="kinAgeUnit"
                      value={patient.kinAgeUnit}
                      onChange={handleChange}
                      className="age-unit"
                    >
                      <option value="Years">Years</option>
                      <option value="Months">Months</option>
                      <option value="Days">Days</option>
                    </Select>
                  </InputGroup>
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="kinOccupation">Occupation</Label>
                  <Input
                    type="text"
                    id="kinOccupation"
                    name="kinOccupation"
                    value={patient.kinOccupation}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="memberNumber">Member Number</Label>
                  <Input
                    type="text"
                    id="memberNumber"
                    name="memberNumber"
                    value={patient.memberNumber}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="suffixNumber">Suffix Number</Label>
                  <Input
                    type="text"
                    id="suffixNumber"
                    name="suffixNumber"
                    value={patient.suffixNumber}
                    onChange={handleChange}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label htmlFor="approvedAmount">Approved Amount</Label>
                  <Input
                    type="text"
                    id="approvedAmount"
                    name="approvedAmount"
                    value={patient.approvedAmount}
                    onChange={handleChange}
                  />
                </InputWrapper>
              </FormGrid>
            </CollapsibleSection>

            {/* New Born Section */}
            <CollapsibleSection
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  New Born
                  <Tooltip style={{ marginLeft: "8px" }}>
                    <Info size={16} className="tooltip-icon" />
                    <span className="tooltip-text">
                      Register a newborn baby with mother's information. The mother must be registered in the system
                      with a valid UHID.
                    </span>
                  </Tooltip>
                </div>
              }
              defaultOpen={false}
            >
              <FormGrid>
                <InputWrapper>
                  <Label htmlFor="birthTime">Birth Time</Label>
                  <InputGroup>
                    <Input
                      type="time"
                      id="birthTime"
                      name="birthTime"
                      value={patient.birthTime || ""}
                      onChange={handleChange}
                    />
                    <Select
                      id="birthTimeAmPm"
                      name="birthTimeAmPm"
                      value={patient.birthTimeAmPm || "AM"}
                      onChange={handleChange}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </Select>
                  </InputGroup>
                </InputWrapper>

                <InputWrapper>
                  <Label htmlFor="weight">Weight</Label>
                  <Select id="weight" name="weight" value={patient.weight || ""} onChange={handleChange}>
                    <option value="">Select Weight</option>
                    <option value="1">1 kg</option>
                    <option value="1.5">1.5 kg</option>
                    <option value="2">2 kg</option>
                    <option value="2.5">2.5 kg</option>
                    <option value="3">3 kg</option>
                    <option value="3.5">3.5 kg</option>
                    <option value="4">4 kg</option>
                    <option value="4.5">4.5 kg</option>
                  </Select>
                </InputWrapper>

                <InputWrapper>
                  <Label htmlFor="mothersUhidNo">Mother's UHID No</Label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="mothersUhidNo"
                      name="mothersUhidNo"
                      value={patient.mothersUhidNo || ""}
                      onChange={handleChange}
                      placeholder="Enter Mother's UHID"
                    />
                    <InputAddon onClick={searchMotherUhid}>
                      <Search size={16} />
                    </InputAddon>
                  </InputGroup>
                </InputWrapper>

                <InputWrapper>
                  <Label htmlFor="pediatricianResponsible">Pediatrician Responsible</Label>
                  <Select
                    id="pediatricianResponsible"
                    name="pediatricianResponsible"
                    value={patient.pediatricianResponsible || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Pediatrician</option>
                    {doctors
                      .filter((doctor) => doctor.specialty === "Pediatrician")
                      .map((doctor, index) => (
                        <option key={`ped-${index}`} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    {/* If no pediatricians are found, show all doctors */}
                    {doctors.filter((doctor) => doctor.specialty === "Pediatrician").length === 0 &&
                      doctors.map((doctor, index) => (
                        <option key={index} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                  </Select>
                </InputWrapper>
              </FormGrid>

              <ButtonContainer>
                <Button type="button" onClick={handleNewBornRegistration} primary>
                  Register New Born
                </Button>
              </ButtonContainer>
            </CollapsibleSection>

            <ButtonContainer>
              <Button type="submit" primary>
                Save Patient
              </Button>
              <button type="button" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </ButtonContainer>
          </form>
        </FormContainer>

        {/* Doctor Fee Calculator */}
        <DoctorContainer>
          <ContainerTitle>Doctor Fee Calculator</ContainerTitle>
          <FormGrid columns={1}>
            <InputWrapper>
              <Label htmlFor="doctorSelect">Doctor</Label>
              <Select id="doctorSelect" onChange={handleDoctorChange} value={patient.doctorName || ""}>
                <option value="">-- Select a Doctor --</option>
                {doctors.map((doctor, index) => (
                  <option key={index} value={doctor.name}>
                    {doctor.name}
                  </option>
                ))}
              </Select>
            </InputWrapper>

            <FeeContainer>
              <FeeItem>
                <Label htmlFor="registrationFee">Registration Fee (₹)</Label>
                <Input
                  id="registrationFee"
                  type="number"
                  value={registrationFee.toFixed(2)}
                  onChange={(e) => handleFeeChange("registration", e.target.value)}
                />
              </FeeItem>
              <FeeItem>
                <Label htmlFor="consultingFee">Consulting Fee (₹)</Label>
                <Input
                  id="consultingFee"
                  type="number"
                  value={consultingFee.toFixed(2)}
                  onChange={(e) => handleFeeChange("consulting", e.target.value)}
                />
              </FeeItem>
              <FeeItem>
                <Label htmlFor="hospitalFee">Hospital Fee (₹)</Label>
                <Input
                  id="hospitalFee"
                  type="number"
                  value={hospitalFee.toFixed(2)}
                  onChange={(e) => handleFeeChange("hospital", e.target.value)}
                />
              </FeeItem>
              <FeeItem>
                <Label htmlFor="bookingFee">Booking Fee (₹)</Label>
                <Input
                  id="bookingFee"
                  type="number"
                  value={bookingFee.toFixed(2)}
                  onChange={(e) => handleFeeChange("booking", e.target.value)}
                />
              </FeeItem>
              <TotalFeeItem>
                <Label htmlFor="totalFee">Total Fees (₹)</Label>
                <Input id="totalFee" type="number" value={totalFees.toFixed(2)} readOnly />
              </TotalFeeItem>
            </FeeContainer>

            <ButtonContainer>
              <Button type="button" onClick={resetFeeCalculator}>
                Reset
              </Button>
              <Button type="button" primary onClick={handleSubmit}>
                Save
              </Button>
            </ButtonContainer>
          </FormGrid>
        </DoctorContainer>
      </MainContentWrapper>

      {/* Search Results Modal */}
      <Modal
        show={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Search Results"
        footer={
          <Button type="button" onClick={() => setShowSearchModal(false)}>
            Close
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>UHID</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Gender</TableHeaderCell>
              <TableHeaderCell>Mobile</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((p, index) => (
                <TableRow key={index}>
                  <TableCell>{p.uhid}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.gender}</TableCell>
                  <TableCell>{p.mobilePhone}</TableCell>
                  <TableCell>
                    <Button type="button" small onClick={() => handleSelectPatient(p)}>
                      Renew
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No patients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Modal>

      {/* Reference Doctor Form Modal */}
      {isModalOpen && <ReferenceDoctorForm closeModal={() => setIsModalOpen(false)} />}
    </PageContainer>
  )
}

// Styled Components
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`

const PageHeader = styled.header`
  margin-bottom: 20px;
  padding: 15px 0;
  border-bottom: 2px solid #15616d;
`

const PageTitle = styled.h1`
  color: #15616d;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin: 0;
`

const MainContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 3fr 1fr;
  }
`

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  overflow: hidden;
`

const DoctorContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  height: fit-content;
`

const SearchContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 20px;
`

const SearchRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 60px;
  align-items: flex-end;
`

const ContainerTitle = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #15616d;
  font-size: 22px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(21, 97, 109, 0.2);
`

const SectionWrapper = styled.div`
  margin-bottom: 20px;
  border: 1px solid rgba(21, 97, 109, 0.2);
  border-radius: 8px;
  overflow: hidden;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(21, 97, 109, 0.05);
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(21, 97, 109, 0.1);
  }
`

const SectionIcon = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
`

const SectionTitle = styled.h3`
  margin: 0;
  flex: 1;
  color: #15616d;
  font-size: 18px;
  font-weight: 500;
`

const SectionContent = styled.div`
  padding: 16px;
  background-color: white;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) => (props.columns ? `repeat(${props.columns}, 1fr)` : "repeat(1, 1fr)")};
  gap: 16px;
  
  @media (min-width: 640px) {
    grid-template-columns: ${(props) => (props.columns ? `repeat(${props.columns}, 1fr)` : "repeat(2, 1fr)")};
  }
  
  .span-full {
    grid-column: 1 / -1;
  }
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  &.span-full {
    grid-column: 1 / -1;
  }
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  width: 100%;
  
  &:focus {
    border-color: #15616d;
    box-shadow: 0 0 0 2px rgba(21, 97, 109, 0.2);
    outline: none;
  }
  
  &:disabled, &[readonly] {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: white;
  width: 100%;
  
  &:focus {
    border-color: #15616d;
    box-shadow: 0 0 0 2px rgba(21, 97, 109, 0.2);
    outline: none;
  }
`

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  resize: vertical;
  min-height: 80px;
  width: 100%;
  
  &:focus {
    border-color: #15616d;
    box-shadow: 0 0 0 2px rgba(21, 97, 109, 0.2);
    outline: none;
  }
`

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  
  ${Input}, ${Select} {
    border-radius: 6px 0 0 6px;
  }
`

const InputAddon = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #15616d;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  height: 100%;
  
  &:hover {
    background-color: #1d7686;
  }
`

const FileInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  
  &::file-selector-button {
    padding: 8px 12px;
    background: #15616d;
    color: white;
    border: none;
    border-radius: 4px;
    margin-right: 12px;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #1d7686;
    }
  }
`

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #15616d;
`

const CheckboxLabel = styled.label`
  font-size: 14px;
  cursor: pointer;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`

const Button = styled.button`
  padding: ${(props) => (props.small ? "6px 12px" : "10px 20px")};
  background: ${(props) => (props.primary ? "#15616d" : "white")};
  color: ${(props) => (props.primary ? "white" : "#15616d")};
  border: ${(props) => (props.primary ? "none" : "1px solid #15616d")};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${(props) => (props.primary ? "#1d7686" : "rgba(21, 97, 109, 0.1)")};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const FeeContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
`

const FeeItem = styled.div`
  margin-bottom: 12px;
`

const TotalFeeItem = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ddd;
  font-weight: bold;
  
  ${Label} {
    color: #15616d;
  }
  
  ${Input} {
    font-weight: bold;
    color: #15616d;
    background-color: rgba(21, 97, 109, 0.05);
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
`

const ModalTitle = styled.h3`
  margin: 0;
  color: #15616d;
  font-size: 18px;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`

const ModalBody = styled.div`
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
`

const ModalFooter = styled.div`
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const TableHeader = styled.thead`
  background-color: rgba(21, 97, 109, 0.1);
`

const TableBody = styled.tbody``

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  &:hover {
    background-color: rgba(21, 97, 109, 0.05);
  }
`

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #15616d;
  border-bottom: 2px solid rgba(21, 97, 109, 0.2);
`

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  
  &.text-center {
    text-align: center;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const Tooltip = styled.div`
  position: relative;
  display: inline-block;
  
  .tooltip-icon {
    color: #15616d;
    cursor: pointer;
  }
  
  .tooltip-text {
    visibility: hidden;
    width: 250px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
  
  &:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`

export default PatientRegistrationForm

