import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import { FaArrowLeft, FaUserMd, FaDollarSign, FaCalendarAlt, FaClock, FaSave } from 'react-icons/fa';
import {
    PageWrapper,
    Header,
    Section,
    FormGrid,
    InputWrapper,
    Label,
    Input,
    CheckboxGroup,
    CheckboxLabel,
    PrimaryButton,
    SecondaryButton,
    ButtonGroup,
    LoadingIndicator
} from '../GlobalStyledComponents';

const DAYS_OF_WEEK = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" }
];

const TIME_SLOTS = [
    { value: "09:00-10:00", label: "09:00 AM - 10:00 AM" },
    { value: "10:00-11:00", label: "10:00 AM - 11:00 AM" },
    { value: "11:00-12:00", label: "11:00 AM - 12:00 PM" },
    { value: "12:00-13:00", label: "12:00 PM - 01:00 PM" },
    { value: "13:00-14:00", label: "01:00 PM - 02:00 PM" },
    { value: "14:00-15:00", label: "02:00 PM - 03:00 PM" },
    { value: "15:00-16:00", label: "03:00 PM - 04:00 PM" },
    { value: "16:00-17:00", label: "04:00 PM - 05:00 PM" },
    { value: "17:00-18:00", label: "05:00 PM - 06:00 PM" }
];

function DoctorSchedule() {
    const { employee_id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [scheduleExists, setScheduleExists] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: "",
        employeeName: "",
        email: "",
        mobileNumber: "",
        department: "",
        designation: "",
        consulting_fee: "",
        renewal_fee: "",
        day_schedule: [],
        time_schedule: []
    });

    const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (employee_id) {
            fetchDoctorSchedule();
        }
    }, [employee_id]);

    const fetchDoctorSchedule = async () => {
        setLoading(true);
        console.log('Fetching schedule for employee_id:', employee_id);

        const result = await apiRequest(
            `${HMSURL}doctor_schedule/${employee_id}/`,
            'GET'
        );

        console.log('Schedule API Result:', result);

        if (result.success) {
            const data = result.data;
            console.log('Doctor Schedule Data:', data);
            console.log('Employee Name:', data.employeeName);

            setScheduleExists(data.schedule_exists);
            setFormData({
                employeeId: data.employeeId || "",
                employeeName: data.employeeName || "N/A",
                email: data.email || "",
                mobileNumber: data.mobileNumber || "",
                department: data.department || "",
                designation: data.designation || "",
                consulting_fee: data.consulting_fee || "",
                renewal_fee: data.renewal_fee || "",
                day_schedule: data.day_schedule || [],
                time_schedule: data.time_schedule || []
            });

            console.log('Form Data after setting:', formData);
        } else {
            console.error("Error fetching doctor schedule:", result.error);
            toast.error(result.error || 'Failed to fetch doctor schedule');
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDayScheduleChange = (day) => {
        const currentDays = [...formData.day_schedule];
        const index = currentDays.indexOf(day);

        if (index > -1) {
            currentDays.splice(index, 1);
        } else {
            currentDays.push(day);
        }

        setFormData({ ...formData, day_schedule: currentDays });
    };

    const handleTimeScheduleChange = (timeSlot) => {
        const currentSlots = [...formData.time_schedule];
        const index = currentSlots.indexOf(timeSlot);

        if (index > -1) {
            currentSlots.splice(index, 1);
        } else {
            currentSlots.push(timeSlot);
        }

        setFormData({ ...formData, time_schedule: currentSlots });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.consulting_fee || !formData.renewal_fee) {
            toast.error("Please fill in all required fee fields");
            return;
        }

        if (formData.day_schedule.length === 0) {
            toast.error("Please select at least one working day");
            return;
        }

        if (formData.time_schedule.length === 0) {
            toast.error("Please select at least one time slot");
            return;
        }

        const method = scheduleExists ? 'PATCH' : 'POST';
        const result = await apiRequest(
            `${HMSURL}doctor_schedule_upsert/${employee_id}/`,
            method,
            formData
        );

        if (result.success) {
            toast.success(result.data.message || "Doctor schedule saved successfully!");
            setScheduleExists(true);
        } else {
            console.error("Error saving doctor schedule:", result.error);
            toast.error(result.error || 'Failed to save doctor schedule');
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <LoadingIndicator>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    Loading doctor schedule...
                </LoadingIndicator>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <Header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaUserMd size={24} />
                    <span>Doctor Schedule Management</span>
                </div>
                <SecondaryButton onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaArrowLeft />
                    Back
                </SecondaryButton>
            </Header>

            {/* Doctor Information Section */}
            <Section>
                <div style={{
                    background: 'linear-gradient(135deg, #e6f2f2 0%, #f0f8f8 100%)',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '2px solid #008080'
                }}>
                    <h3 style={{ color: '#15616d', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaUserMd size={20} />
                        Doctor Information
                    </h3>
                    <FormGrid>
                        <InputWrapper>
                            <Label>Employee ID</Label>
                            <Input value={formData.employeeId} disabled />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Doctor Name</Label>
                            <Input
                                value={formData.employeeName || 'Loading...'}
                                disabled
                                style={{
                                    fontWeight: 'bold',
                                    color: formData.employeeName ? '#15616d' : '#999'
                                }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Email</Label>
                            <Input value={formData.email} disabled />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Mobile Number</Label>
                            <Input value={formData.mobileNumber} disabled />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Department</Label>
                            <Input value={formData.department} disabled />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Designation</Label>
                            <Input value={formData.designation} disabled />
                        </InputWrapper>
                    </FormGrid>
                </div>
            </Section>

            {/* Fee Details Section */}
            <Section>
                <div style={{
                    background: '#f9f9f9',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #ddd'
                }}>
                    <h3 style={{ color: '#15616d', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaDollarSign size={20} />
                        Fee Details
                    </h3>
                    <FormGrid>
                        <InputWrapper>
                            <Label required>Consulting Fee</Label>
                            <Input
                                name="consulting_fee"
                                type="number"
                                value={formData.consulting_fee}
                                onChange={handleChange}
                                placeholder="Enter consulting fee"
                                required
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label required>Renewal Fee</Label>
                            <Input
                                name="renewal_fee"
                                type="number"
                                value={formData.renewal_fee}
                                onChange={handleChange}
                                placeholder="Enter renewal fee"
                                required
                            />
                        </InputWrapper>
                    </FormGrid>
                </div>
            </Section>

            {/* Working Days Schedule Section */}
            <Section>
                <div style={{
                    background: '#f0f8ff',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #b3d9ff'
                }}>
                    <h3 style={{ color: '#15616d', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaCalendarAlt size={20} />
                        Working Days Schedule <span style={{ color: 'red' }}>*</span>
                    </h3>
                    <CheckboxGroup>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '10px',
                            marginBottom: '15px'
                        }}>
                            {DAYS_OF_WEEK.map((day) => (
                                <CheckboxLabel key={day.value} style={{
                                    background: formData.day_schedule.includes(day.value) ? '#e6f9f5' : 'white',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: `2px solid ${formData.day_schedule.includes(day.value) ? '#008080' : '#ddd'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.day_schedule.includes(day.value)}
                                        onChange={() => handleDayScheduleChange(day.value)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontWeight: formData.day_schedule.includes(day.value) ? 'bold' : 'normal' }}>
                                        {day.label}
                                    </span>
                                </CheckboxLabel>
                            ))}
                        </div>
                        {formData.day_schedule.length > 0 && (
                            <div style={{
                                background: 'white',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #008080'
                            }}>
                                <strong style={{ color: '#15616d' }}>Selected Days: </strong>
                                <span style={{ color: '#008080', fontWeight: '500' }}>
                                    {formData.day_schedule.join(', ')}
                                </span>
                            </div>
                        )}
                    </CheckboxGroup>
                </div>
            </Section>

            {/* Time Slots Schedule Section */}
            <Section>
                <div style={{
                    background: '#fff8f0',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #ffd9b3'
                }}>
                    <h3 style={{ color: '#15616d', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaClock size={20} />
                        Time Slots Schedule <span style={{ color: 'red' }}>*</span>
                    </h3>
                    <CheckboxGroup>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '10px',
                            marginBottom: '15px'
                        }}>
                            {TIME_SLOTS.map((slot) => (
                                <CheckboxLabel key={slot.value} style={{
                                    background: formData.time_schedule.includes(slot.value) ? '#fff4e6' : 'white',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: `2px solid ${formData.time_schedule.includes(slot.value) ? '#FF8C00' : '#ddd'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.time_schedule.includes(slot.value)}
                                        onChange={() => handleTimeScheduleChange(slot.value)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontWeight: formData.time_schedule.includes(slot.value) ? 'bold' : 'normal' }}>
                                        {slot.label}
                                    </span>
                                </CheckboxLabel>
                            ))}
                        </div>
                        {formData.time_schedule.length > 0 && (
                            <div style={{
                                background: 'white',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #FF8C00'
                            }}>
                                <strong style={{ color: '#15616d' }}>Selected Time Slots: </strong>
                                <span style={{ color: '#FF8C00', fontWeight: '500' }}>
                                    {formData.time_schedule.join(', ')}
                                </span>
                            </div>
                        )}
                    </CheckboxGroup>
                </div>
            </Section>

            {/* Submit Button */}
            <ButtonGroup style={{ justifyContent: 'center', marginTop: '30px' }}>
                <PrimaryButton
                    onClick={handleSubmit}
                    style={{
                        fontSize: '16px',
                        padding: '12px 40px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <FaSave size={18} />
                    {scheduleExists ? "Update Schedule" : "Create Schedule"}
                </PrimaryButton>
            </ButtonGroup>
        </PageWrapper>
    );
}

export default DoctorSchedule;