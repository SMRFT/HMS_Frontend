import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import { DOCTOR_DESIGNATIONS } from "./DoctorDesignationConst";

function DoctorReport() {
  const { first_name } = useParams(); // Extract first_name from the URL
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    marital_status: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
    area: "",
    pin: "",
    email: "",
    phone: "",
    registration_fee: "",
    consulting_fee: "",
    renewal_fee: "",
    consultation_start_time: "",
    consultation_end_time: "",
    designation: "",
    department: "",
    created_at: "",
  });

  const [isEditable, setIsEditable] = useState(false); // Toggle between edit and view modes

  useEffect(() => {
    if (first_name) {
      axios
        .get(`http://localhost:8000/doctor_detail/${first_name}/`)
        .then((response) => {
          const data = response.data;
          setDoctor(data);
          setFormData({ ...data, created_at: new Date().toLocaleString() });
        })
        .catch((error) =>
          console.error("Error fetching doctor details:", error)
        );
    }
  }, [first_name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/doctor_detail/${first_name}/`,
        formData
      );
      alert("Doctor details updated successfully!");
      setDoctor(response.data);
      setIsEditable(false);
    } catch (error) {
      console.error("Error updating doctor details:", error);
    }
  };

  // In render
  if (!doctor) {
    return <Typography variant="h6">Loading doctor details...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Doctor Details
      </Typography>
      <Box
        sx={{
          mt: 3,
          p: 3,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {/* Registration Date Field */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Registration Date and Time"
              name="created_at"
              value={formData.created_at}
              disabled
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Consultation Start Time"
              name="consultation_start_time"
              type="time"
              value={formData.consultation_start_time || ""}
              onChange={handleChange}
              variant="outlined"
              disabled={!isEditable}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Consultation End Time"
              name="consultation_end_time"
              type="time"
              value={formData.consultation_end_time || ""}
              onChange={handleChange}
              variant="outlined"
              disabled={!isEditable}
            />
          </Grid>
        </Grid>

        {/* Edit and Update Buttons */}
        <Box mt={3} textAlign="center">
          {!isEditable ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditable(true)}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpdate}
            >
              Update
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default DoctorReport;
