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

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

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
        axios
            .post(`${Hmsbaseurl}add-reference-doctor/`, doctor)
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

    // Patient state - UPDATED with firstName and lastName
    const [patient, setPatient] = useState({
        regDate: "",
        citizenIdType: "",
        citizenIdNo: "",
        customerType: "",
        firstName: "",
        lastName: "",
        name: "", // Keep for backward compatibility
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

    // Search states
    const [uhid, setUhid] = useState("")
    const [ipNumber, setIpNumber] = useState("")
    const [mobile, setMobile] = useState("")
    const [patients, setPatients] = useState([])

    // Doctor and fee states
    const [doctors, setDoctors] = useState([])
    const [referenceDoctors, setReferenceDoctors] = useState([])
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

    // Handle form field changes - UPDATED to handle firstName and lastName
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        if (name === "firstName" || name === "lastName") {
            // Auto-update full name when first or last name changes
            const newPatient = { ...patient, [name]: value }
            const fullName = `${newPatient.firstName} ${newPatient.lastName}`.trim()
            setPatient({ ...newPatient, name: fullName })
        } else if (name === "dob") {
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

            const backendKeys = {
                regDate: "registration_date",
                citizenIdType: "citizen_id_type",
                citizenIdNo: "citizen_id_no",
                customerType: "customer_type",
                permanentAddress: "permanent_address",
                homePhone: "home_phone",
                bloodGroup: "blood_group",
                spouseName: "spouse_name",
                insuranceCompany: "insurance_company",
                mlcType: "mlc_type",
                mlcDoc: "mlc_doc",
                mlcRemarks: "mlc_remarks",
                passAlertToAuthority: "pass_alert_to_authority",
                nextOfKin: "next_of_kin",
                kinAddress: "kin_address",
                kinMobile: "kin_mobile",
                kinAge: "kin_age",
                kinAgeUnit: "kin_age_unit",
                kinOccupation: "kin_occupation",
                memberNumber: "member_number",
                suffixNumber: "suffix_number",
                approvedAmount: "approved_amount",
                referredDrMobile: "referred_dr_mobile",
                referredDrRemarks: "referred_dr_remarks",
                birthTime: "birth_time",
                birthTimeAmPm: "birth_time_am_pm",
                mothersUhidNo: "mothers_uhid_no",
                pediatricianResponsible: "pediatrician_responsible",
            }

            // Append all patient data to formData
            Object.keys(patient).forEach((key) => {
                const backendKey = backendKeys[key] || key
                if (key === "mlcDoc" && patient[key]) {
                    formData.append(backendKey, patient[key])
                } else if (patient[key] !== null && patient[key] !== undefined) {
                    formData.append(backendKey, patient[key])
                }
            })

            const response = await fetch(`${Hmsbaseurl}patients/register/`, {
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
                    firstName: "",
                    lastName: "",
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

            const response = await axios.get(`${Hmsbaseurl}create/?${query}`)
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
            .get(`${Hmsbaseurl}doctor_schedule/`)
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

        axios.get(`${Hmsbaseurl}get-reference-doctors/`)
            .then((response) => {
                setReferenceDoctors(response.data)
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
            const hospFee = 0
            const bookFee = 0
            const total = regFee + consFee + hospFee + bookFee

            setSelectedDoctor(selected)
            setRegistrationFee(regFee)
            setConsultingFee(consFee)
            setHospitalFee(hospFee)
            setBookingFee(bookFee)
            setTotalFees(total)

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
        console.log("Searching for mother's UHID:", patient.mothersUhidNo)
    }

    const handleNewBornRegistration = () => {
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

                        {/* Personal Information Section - UPDATED WITH FIRST AND LAST NAME */}
                        <CollapsibleSection title="Personal Information">
                            <FormGrid columns={3}>
                                <InputWrapper>
                                    <Label htmlFor="firstName">
                                        First Name <RequiredAsterisk>*</RequiredAsterisk>
                                    </Label>
                                    <Input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={patient.firstName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter first name"
                                    />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="lastName">
                                        Last Name <RequiredAsterisk>*</RequiredAsterisk>
                                    </Label>
                                    <Input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={patient.lastName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter last name"
                                    />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="dob">
                                        Date of Birth <RequiredAsterisk>*</RequiredAsterisk>
                                    </Label>
                                    <Input type="date" id="dob" name="dob" value={patient.dob} onChange={handleChange} required />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="age">
                                        Age <RequiredAsterisk>*</RequiredAsterisk>
                                    </Label>
                                    <Input type="number" id="age" name="age" value={patient.age} onChange={handleChange} required placeholder="Auto-calculated" />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="gender">
                                        Gender <RequiredAsterisk>*</RequiredAsterisk>
                                    </Label>
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
                                        placeholder="Enter spouse name"
                                    />
                                </InputWrapper>
                            </FormGrid>
                        </CollapsibleSection>

                        {/* Address & Contact Information */}
                        <CollapsibleSection title="Address & Contact Information">
                            <FormGrid columns={3}>
                                <InputWrapper className="span-full">
                                    <Label htmlFor="permanentAddress">Permanent Address</Label>
                                    <Input
                                        type="text"
                                        id="permanentAddress"
                                        name="permanentAddress"
                                        value={patient.permanentAddress}
                                        onChange={handleChange}
                                        placeholder="Enter full address"
                                    />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="area">Area</Label>
                                    <Input type="text" id="area" name="area" value={patient.area} onChange={handleChange} placeholder="Enter area" />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="zipcode">Zipcode</Label>
                                    <Input type="text" id="zipcode" name="zipcode" value={patient.zipcode} onChange={handleChange} placeholder="Enter zipcode" />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="city">City</Label>
                                    <Input type="text" id="city" name="city" value={patient.city} onChange={handleChange} placeholder="Enter city" />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="state">State</Label>
                                    <Input type="text" id="state" name="state" value={patient.state} onChange={handleChange} placeholder="Enter state" />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="email">Email</Label>
                                    <Input type="email" id="email" name="email" value={patient.email} onChange={handleChange} placeholder="example@email.com" />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="mobilePhone">
                                        Mobile Phone <RequiredAsterisk>*</RequiredAsterisk>
                                    </Label>
                                    <Input
                                        type="text"
                                        id="mobilePhone"
                                        name="mobilePhone"
                                        value={patient.mobilePhone}
                                        onChange={handleChange}
                                        required
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
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
                                        placeholder="Enter home phone"
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
                                            {referenceDoctors.map((doc, index) => (
                                                <option key={index} value={doc.doctor}>
                                                    {doc.doctor} ({doc.qualification}) - {doc.area}
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
                                        placeholder="Enter mobile number"
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
                                        placeholder="Enter any remarks..."
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
                                        placeholder="Enter MLC remarks..."
                                    />
                                </InputWrapper>
                            </FormGrid>
                        </CollapsibleSection>

                        {/* Next of Kin Section */}
                        <CollapsibleSection title="Next of Kin" defaultOpen={false}>
                            <FormGrid columns={3}>
                                <InputWrapper>
                                    <Label htmlFor="nextOfKin">Next of Kin</Label>
                                    <Input
                                        type="text"
                                        id="nextOfKin"
                                        name="nextOfKin"
                                        value={patient.nextOfKin}
                                        onChange={handleChange}
                                        placeholder="Enter name"
                                    />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="relation">Relation</Label>
                                    <Input type="text" id="relation" name="relation" value={patient.relation} onChange={handleChange} placeholder="e.g., Father, Mother" />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="kinAddress">Address</Label>
                                    <Input
                                        type="text"
                                        id="kinAddress"
                                        name="kinAddress"
                                        value={patient.kinAddress}
                                        onChange={handleChange}
                                        placeholder="Enter address"
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
                                        placeholder="10-digit mobile"
                                        maxLength={10}
                                    />
                                </InputWrapper>
                                <InputWrapper>
                                    <Label htmlFor="kinAge">Age</Label>
                                    <InputGroup>
                                        <Input type="text" id="kinAge" name="kinAge" value={patient.kinAge} onChange={handleChange} placeholder="Enter age" />
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
                                        placeholder="Enter occupation"
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
                                        placeholder="Enter member number"
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
                                        placeholder="Enter suffix"
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
                                        placeholder="₹ 0.00"
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
                            <Button type="button" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`

const PageHeader = styled.header`
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 3px solid #15616d;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const PageTitle = styled.h1`
  color: #15616d;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin: 0;
  letter-spacing: -0.5px;
`

const MainContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 3fr 1fr;
  }
`

const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 32px;
  overflow: hidden;
`

const DoctorContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 32px;
  height: fit-content;
  position: sticky;
  top: 20px;
`

const SearchContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 32px;
  margin-bottom: 24px;
`

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: flex-end;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const ContainerTitle = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  color: #15616d;
  font-size: 24px;
  font-weight: 700;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(21, 97, 109, 0.2);
`

const SectionWrapper = styled.div`
  margin-bottom: 24px;
  border: 2px solid rgba(21, 97, 109, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(21, 97, 109, 0.3);
    box-shadow: 0 4px 12px rgba(21, 97, 109, 0.1);
  }
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(21, 97, 109, 0.08) 0%, rgba(21, 97, 109, 0.04) 100%);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(135deg, rgba(21, 97, 109, 0.12) 0%, rgba(21, 97, 109, 0.08) 100%);
  }
`

const SectionIcon = styled.span`
  margin-right: 12px;
  display: flex;
  align-items: center;
  color: #15616d;
`

const SectionTitle = styled.h3`
  margin: 0;
  flex: 1;
  color: #15616d;
  font-size: 18px;
  font-weight: 600;
`

const SectionContent = styled.div`
  padding: 24px;
  background-color: white;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .span-full {
    grid-column: 1 / -1;
  }
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  &.span-full {
    grid-column: 1 / -1;
  }
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 4px;
`

const RequiredAsterisk = styled.span`
  color: #e53e3e;
  font-weight: bold;
`

const Input = styled.input`
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
  font-family: inherit;
  
  &:focus {
    border-color: #15616d;
    box-shadow: 0 0 0 3px rgba(21, 97, 109, 0.1);
    outline: none;
  }
  
  &:disabled, &[readonly] {
    background-color: #f7fafc;
    cursor: not-allowed;
    color: #718096;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`

const Select = styled.select`
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: white;
  width: 100%;
  font-family: inherit;
  cursor: pointer;
  
  &:focus {
    border-color: #15616d;
    box-shadow: 0 0 0 3px rgba(21, 97, 109, 0.1);
    outline: none;
  }
  
  &.age-unit {
    width: auto;
    min-width: 100px;
  }
`

const Textarea = styled.textarea`
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  width: 100%;
  font-family: inherit;
  
  &:focus {
    border-color: #15616d;
    box-shadow: 0 0 0 3px rgba(21, 97, 109, 0.1);
    outline: none;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`

const InputGroup = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  
  ${Input}, ${Select} {
    border-radius: 8px 0 0 8px;
    border-right: none;
  }
  
  ${Select}.age-unit {
    border-radius: 0 8px 8px 0;
    border-right: 2px solid #e2e8f0;
    border-left: none;
  }
`

const InputAddon = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #15616d 0%, #1d7686 100%);
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #1d7686 0%, #15616d 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(21, 97, 109, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const FileInput = styled.input`
  padding: 10px 14px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #15616d;
    background-color: rgba(21, 97, 109, 0.02);
  }
  
  &::file-selector-button {
    padding: 10px 16px;
    background: linear-gradient(135deg, #15616d 0%, #1d7686 100%);
    color: white;
    border: none;
    border-radius: 6px;
    margin-right: 16px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, #1d7686 0%, #15616d 100%);
      transform: translateY(-1px);
    }
  }
`

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
`

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #15616d;
  border-radius: 4px;
`

const CheckboxLabel = styled.label`
  font-size: 14px;
  cursor: pointer;
  color: #2d3748;
  font-weight: 500;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  flex-wrap: wrap;
`

const Button = styled.button`
  padding: ${props => (props.small ? "8px 16px" : "14px 28px")};
  background: ${props => (props.primary
        ? "linear-gradient(135deg, #15616d 0%, #1d7686 100%)"
        : "white")};
  color: ${props => (props.primary ? "white" : "#15616d")};
  border: ${props => (props.primary ? "none" : "2px solid #15616d")};
  border-radius: 10px;
  font-size: ${props => (props.small ? "13px" : "15px")};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => (props.primary
        ? "0 4px 12px rgba(21, 97, 109, 0.3)"
        : "none")};
  
  &:hover {
    background: ${props => (props.primary
        ? "linear-gradient(135deg, #1d7686 0%, #15616d 100%)"
        : "rgba(21, 97, 109, 0.08)")};
    transform: translateY(-2px);
    box-shadow: ${props => (props.primary
        ? "0 6px 16px rgba(21, 97, 109, 0.4)"
        : "0 4px 12px rgba(21, 97, 109, 0.2)")};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const FeeContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
`

const FeeItem = styled.div`
  margin-bottom: 16px;
  
  &:last-of-type {
    margin-bottom: 0;
  }
`

const TotalFeeItem = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #15616d;
  font-weight: bold;
  
  ${Label} {
    color: #15616d;
    font-size: 16px;
  }
  
  ${Input} {
    font-weight: 700;
    color: #15616d;
    background: rgba(21, 97, 109, 0.08);
    font-size: 18px;
    border-color: #15616d;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(21, 97, 109, 0.08) 0%, rgba(21, 97, 109, 0.04) 100%);
`

const ModalTitle = styled.h3`
  margin: 0;
  color: #15616d;
  font-size: 20px;
  font-weight: 700;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #718096;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: #e53e3e;
  }
`

const ModalBody = styled.div`
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
`

const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: linear-gradient(135deg, rgba(21, 97, 109, 0.02) 0%, rgba(21, 97, 109, 0.04) 100%);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const TableHeader = styled.thead`
  background: linear-gradient(135deg, rgba(21, 97, 109, 0.12) 0%, rgba(21, 97, 109, 0.08) 100%);
`

const TableBody = styled.tbody``

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f7fafc;
  }
  
  &:hover {
    background-color: rgba(21, 97, 109, 0.05);
  }
`

const TableHeaderCell = styled.th`
  padding: 14px 16px;
  text-align: left;
  font-weight: 700;
  color: #15616d;
  border-bottom: 2px solid rgba(21, 97, 109, 0.3);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const TableCell = styled.td`
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
  
  &.text-center {
    text-align: center;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`

const Tooltip = styled.div`
  position: relative;
  display: inline-block;
  
  .tooltip-icon {
    color: #15616d;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      color: #1d7686;
      transform: scale(1.1);
    }
  }
  
  .tooltip-text {
    visibility: hidden;
    width: 280px;
    background-color: #2d3748;
    color: #fff;
    text-align: center;
    border-radius: 8px;
    padding: 12px;
    position: absolute;
    z-index: 1;
    bottom: 150%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 13px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    line-height: 1.5;
  }
  
  .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: #2d3748 transparent transparent transparent;
  }
  
  &:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`

export default PatientRegistrationForm
