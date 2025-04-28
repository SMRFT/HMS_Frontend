import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    MenuItem,
    Typography,
    Container,
} from '@mui/material';
import axios from "axios";
import { DOCTOR_DESIGNATIONS } from './DoctorDesignationConst';

function Doctor() {
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        marital_status: '',
        address_line_1: '',
        address_line_2: '',
        address_line_3: '',
        area: '',
        pin: '',
        email: '',
        phone: '',
        registration_fee: '',
        consulting_fee: '',
        renewal_fee: '',
        consultation_start_time: '', // Start Time
        consultation_end_time: '',   // End Time
        designation: '', 
        department: '',
        created_at: '', // New field
    });

    const [displayDate, setDisplayDate] = useState('');

    useEffect(() => {
        // Set the current date and time on component load
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleString(); // Format as 'MM/DD/YYYY, HH:mm:ss'
        setFormData({ ...formData, created_at: formattedDate });
        setDisplayDate(formattedDate);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/doctors/', formData);
            alert('Doctor added successfully!');
            console.log(response.data);
        } catch (error) {
            console.error('Error adding doctor:', error);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Doctor Registration
            </Typography>
            <Box
                component="form"
                noValidate
                autoComplete="off"
                sx={{
                    mt: 3,
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                {/* Display Date Field at the Top */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Registration Date and Time"
                            name="created_at"
                            value={displayDate}
                            disabled // Make the field non-editable
                            variant="outlined"
                        />
                    </Grid>

                    {/* Other Fields */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Middle Name"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            variant="outlined"
                        >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Marital Status"
                            name="marital_status"
                            value={formData.marital_status}
                            onChange={handleChange}
                            variant="outlined"
                        >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value="Single">Single</MenuItem>
                            <MenuItem value="Married">Married</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address Line 1"
                            name="address_line_1"
                            value={formData.address_line_1}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address Line 2"
                            name="address_line_2"
                            value={formData.address_line_2}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address Line 3"
                            name="address_line_3"
                            value={formData.address_line_3}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Area"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Pin"
                            name="pin"
                            value={formData.pin}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Designation"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            variant="outlined"
                        >
                            <MenuItem value="">Select</MenuItem>
                            {DOCTOR_DESIGNATIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Registration Fee"
                            name="registration_fee"
                            type="number"
                            value={formData.registration_fee}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Consulting Fee"
                            name="consulting_fee"
                            type="number"
                            value={formData.consulting_fee}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Renewal Fee"
                            name="renewal_fee"
                            type="number"
                            value={formData.renewal_fee}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Consultation Start Time"
                            name="consultation_start_time"
                            type="time"
                            value={formData.consultation_start_time || ''}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Consultation End Time"
                            name="consultation_end_time"
                            type="time"
                            value={formData.consultation_end_time || ''}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>

                </Grid>
                
                <Box mt={3} textAlign="center">               
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>
            </Box>
            
        </Container>
    );
}

export default Doctor;
